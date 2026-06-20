import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

type UsersRepositoryMock = {
  create: jest.Mock<User, [Partial<User>]>;
  findOne: jest.Mock<Promise<User | null>, [unknown]>;
  recover: jest.Mock<Promise<User>, [User]>;
  save: jest.Mock<Promise<User>, [User]>;
  softRemove: jest.Mock<Promise<User>, [User]>;
};

type ConfigServiceMock = {
  get: jest.Mock<string | undefined, [string]>;
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepositoryMock;
  let configService: ConfigServiceMock;
  const now = new Date('2026-01-01T00:00:00.000Z');
  const userId = '5cfbe14b-01ef-4f2b-b276-7ba25a47aa4c';

  const makeUser = (payload: Partial<User> = {}): User =>
    ({
      createdAt: now,
      deletedAt: null,
      email: 'maria@example.com',
      id: userId,
      name: 'Maria Silva',
      passwordHash: 'hashed-password',
      role: UserRole.USER,
      updatedAt: now,
      ...payload,
    }) as User;

  beforeEach(() => {
    repository = {
      create: jest.fn((payload: Partial<User>) => makeUser(payload)),
      findOne: jest.fn<Promise<User | null>, [unknown]>(),
      recover: jest.fn((user: User) =>
        Promise.resolve(makeUser({ ...user, deletedAt: null })),
      ),
      save: jest.fn((user: User) => Promise.resolve(user)),
      softRemove: jest.fn((user: User) => Promise.resolve(user)),
    };
    configService = {
      get: jest.fn<string | undefined, [string]>(),
    };

    service = new UsersService(
      repository as unknown as Repository<User>,
      configService as unknown as ConfigService,
    );
  });

  it('creates a common user without exposing the password hash', async () => {
    const user = await service.create({
      email: 'MARIA@EXAMPLE.COM',
      name: ' Maria Silva ',
      password: 'admin123456',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'maria@example.com',
        name: 'Maria Silva',
        role: UserRole.USER,
      }),
    );
    expect(user).toEqual(
      expect.objectContaining({
        active: true,
        email: 'maria@example.com',
        name: 'Maria Silva',
        role: UserRole.USER,
      }),
    );
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('seeds the initial administrator with the admin role', async () => {
    configService.get.mockImplementation((key: string) => {
      const values: Record<string, string> = {
        ADMIN_EMAIL: 'ROOT@EXAMPLE.COM',
        ADMIN_NAME: 'Root Admin',
        ADMIN_PASSWORD: 'root123456',
      };

      return values[key];
    });
    repository.findOne.mockResolvedValue(null);

    await service.onModuleInit();

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { email: 'root@example.com' },
      withDeleted: true,
    });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'root@example.com',
        name: 'Root Admin',
        role: UserRole.ADMIN,
      }),
    );
  });

  it('promotes a common user to administrator', async () => {
    repository.findOne.mockResolvedValue(makeUser());

    const user = await service.promoteToAdmin(userId);

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ role: UserRole.ADMIN }),
    );
    expect(user.role).toBe(UserRole.ADMIN);
  });

  it('does not promote a user that is already an administrator', async () => {
    repository.findOne.mockResolvedValue(makeUser({ role: UserRole.ADMIN }));

    await expect(service.promoteToAdmin(userId)).rejects.toThrow(
      'O usuário informado já é administrador.',
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('reactivates a soft-deleted user', async () => {
    const inactiveUser = makeUser({ deletedAt: now });
    repository.findOne.mockResolvedValue(inactiveUser);

    const user = await service.activate(userId);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: userId },
      withDeleted: true,
    });
    expect(repository.recover).toHaveBeenCalledWith(inactiveUser);
    expect(user.active).toBe(true);
  });
});
