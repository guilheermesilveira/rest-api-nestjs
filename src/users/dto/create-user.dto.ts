import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Maria Silva', maxLength: 120 })
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @MaxLength(120, { message: 'O nome deve ter no máximo 120 caracteres.' })
  name!: string;

  @ApiProperty({ example: 'maria@example.com', maxLength: 160 })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  @MaxLength(160, { message: 'O e-mail deve ter no máximo 160 caracteres.' })
  email!: string;

  @ApiProperty({ example: 'strongPassword123', minLength: 8, maxLength: 72 })
  @IsString({ message: 'A senha deve ser um texto.' })
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })
  @MaxLength(72, { message: 'A senha deve ter no máximo 72 caracteres.' })
  password!: string;
}
