import {
  BadRequestException,
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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

const userIdPipe = new ParseUUIDPipe({
  exceptionFactory: () => new BadRequestException('ID de usuário inválido.'),
  version: '4',
});

const includeInactivePipe = new ParseBoolPipe({
  exceptionFactory: () =>
    new BadRequestException(
      'O parâmetro includeInactive deve ser verdadeiro ou falso.',
    ),
});

@ApiTags('users')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@ApiBadRequestResponse({ description: 'Dados da requisição inválidos.' })
@ApiUnauthorizedResponse({ description: 'Token inválido ou ausente.' })
@ApiForbiddenResponse({ description: 'Acesso restrito a administradores.' })
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar usuário comum' })
  @ApiCreatedResponse({
    description: 'Usuário comum cadastrado com sucesso.',
    type: UserResponseDto,
  })
  @ApiConflictResponse({
    description: 'Já existe um usuário com este e-mail.',
  })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuários' })
  @ApiQuery({
    description: 'Inclui usuários desativados na listagem.',
    name: 'includeInactive',
    required: false,
    type: Boolean,
  })
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  findAll(
    @Query('includeInactive', new DefaultValuePipe(false), includeInactivePipe)
    includeInactive: boolean,
  ): Promise<UserResponseDto[]> {
    return this.usersService.findAll(includeInactive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiQuery({
    description: 'Permite consultar usuários desativados.',
    name: 'includeInactive',
    required: false,
    type: Boolean,
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado.' })
  findOne(
    @Param('id', userIdPipe) id: string,
    @Query('includeInactive', new DefaultValuePipe(false), includeInactivePipe)
    includeInactive: boolean,
  ): Promise<UserResponseDto> {
    return this.usersService.findOne(id, includeInactive);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar usuário' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiConflictResponse({
    description: 'Já existe um usuário com este e-mail.',
  })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado.' })
  update(
    @Param('id', userIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/promote')
  @ApiOperation({ summary: 'Promover usuário comum a administrador' })
  @ApiOkResponse({
    description: 'Usuário promovido a administrador com sucesso.',
    type: UserResponseDto,
  })
  @ApiConflictResponse({
    description: 'O usuário informado já é administrador.',
  })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado.' })
  promoteToAdmin(
    @Param('id', userIdPipe) id: string,
  ): Promise<UserResponseDto> {
    return this.usersService.promoteToAdmin(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Reativar usuário' })
  @ApiOkResponse({
    description: 'Usuário reativado com sucesso.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado.' })
  activate(@Param('id', userIdPipe) id: string): Promise<UserResponseDto> {
    return this.usersService.activate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar usuário com soft delete' })
  @ApiNoContentResponse({ description: 'Usuário desativado com sucesso.' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado.' })
  async deactivate(@Param('id', userIdPipe) id: string): Promise<void> {
    await this.usersService.deactivate(id);
  }
}
