import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Partial<Repository<User>>>;

  beforeEach(() => {
    const now = new Date('2026-01-01T00:00:00.000Z');

    repository = {
      create: jest.fn((payload: Partial<User>) => ({
        createdAt: now,
        deletedAt: null,
        id: '5cfbe14b-01ef-4f2b-b276-7ba25a47aa4c',
        role: UserRole.ADMIN,
        updatedAt: now,
        ...payload,
      })),
      save: jest.fn((user: User) => Promise.resolve(user)),
    };

    service = new UsersService(
      repository as Repository<User>,
      { get: jest.fn() } as unknown as ConfigService,
    );
  });

  it('creates an admin user without exposing the password hash', async () => {
    const user = await service.create({
      email: 'ADMIN@EXAMPLE.COM',
      name: ' Administrador ',
      password: 'admin123456',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'admin@example.com',
        name: 'Administrador',
      }),
    );
    expect(user).toEqual(
      expect.objectContaining({
        active: true,
        email: 'admin@example.com',
        name: 'Administrador',
        role: UserRole.ADMIN,
      }),
    );
    expect(user).not.toHaveProperty('passwordHash');
  });
});
