import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente ou invalido.' })
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar usuario administrador' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiConflictResponse({ description: 'E-mail ja cadastrado.' })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios administradores' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
  })
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  findAll(
    @Query('includeInactive', new DefaultValuePipe(false), ParseBoolPipe)
    includeInactive: boolean,
  ): Promise<UserResponseDto[]> {
    return this.usersService.findAll(includeInactive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuario administrador por ID' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'Usuario nao encontrado.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeInactive', new DefaultValuePipe(false), ParseBoolPipe)
    includeInactive: boolean,
  ): Promise<UserResponseDto> {
    return this.usersService.findOne(id, includeInactive);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar usuario administrador' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiConflictResponse({ description: 'E-mail ja cadastrado.' })
  @ApiNotFoundResponse({ description: 'Usuario nao encontrado.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar usuario administrador com soft delete' })
  @ApiNoContentResponse({ description: 'Usuario desativado.' })
  @ApiNotFoundResponse({ description: 'Usuario nao encontrado.' })
  async softDelete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.usersService.softDelete(id);
  }
}
