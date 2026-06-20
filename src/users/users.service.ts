import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';

type DriverError = {
  code?: string;
};

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedInitialAdmin();
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = this.usersRepository.create({
      email: this.normalizeEmail(createUserDto.email),
      name: createUserDto.name.trim(),
      passwordHash: await this.hashPassword(createUserDto.password),
    });

    try {
      const savedUser = await this.usersRepository.save(user);
      return new UserResponseDto(savedUser);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Ja existe um usuario com este e-mail.');
      }

      throw error;
    }
  }

  async findAll(includeInactive = false): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find({
      order: {
        createdAt: 'DESC',
      },
      withDeleted: includeInactive,
    });

    return users.map((user) => new UserResponseDto(user));
  }

  async findOne(id: string, includeInactive = false): Promise<UserResponseDto> {
    const user = await this.findUserById(id, includeInactive);
    return new UserResponseDto(user);
  }

  async findActiveById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: this.normalizeEmail(email) })
      .andWhere('user.deleted_at IS NULL')
      .getOne();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.findUserById(id);

    if (updateUserDto.email !== undefined) {
      user.email = this.normalizeEmail(updateUserDto.email);
    }

    if (updateUserDto.name !== undefined) {
      user.name = updateUserDto.name.trim();
    }

    if (updateUserDto.password !== undefined) {
      user.passwordHash = await this.hashPassword(updateUserDto.password);
    }

    try {
      const savedUser = await this.usersRepository.save(user);
      return new UserResponseDto(savedUser);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Ja existe um usuario com este e-mail.');
      }

      throw error;
    }
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.findUserById(id);
    await this.usersRepository.softRemove(user);
  }

  private async findUserById(
    id: string,
    includeInactive = false,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      withDeleted: includeInactive,
    });

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado.');
    }

    return user;
  }

  private async seedInitialAdmin(): Promise<void> {
    const email = this.normalizeEmail(
      this.configService.get<string>('ADMIN_EMAIL') ?? 'admin@example.com',
    );
    const password =
      this.configService.get<string>('ADMIN_PASSWORD') ?? 'admin123456';
    const name =
      this.configService.get<string>('ADMIN_NAME') ?? 'Administrador';

    const existingAdmin = await this.usersRepository.findOne({
      where: { email },
      withDeleted: true,
    });

    if (existingAdmin) {
      return;
    }

    await this.create({
      email,
      name,
      password,
    });
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = error.driverError as DriverError;
    return driverError.code === '23505';
  }
}
