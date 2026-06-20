import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const getBoolean = (
  value: string | undefined,
  defaultValue: boolean,
): boolean => {
  if (value === undefined) {
    return defaultValue;
  }

  return value.toLowerCase() === 'true';
};

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST') ?? 'localhost',
  port: Number(configService.get<string>('DB_PORT') ?? 5432),
  username: configService.get<string>('DB_USERNAME') ?? 'postgres',
  password: configService.get<string>('DB_PASSWORD') ?? 'postgres',
  database: configService.get<string>('DB_DATABASE') ?? 'user_management',
  autoLoadEntities: true,
  synchronize: getBoolean(configService.get<string>('DB_SYNCHRONIZE'), true),
});
