import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { ValidationError } from 'class-validator';
import { AppModule } from './app.module';

const getValidationMessages = (errors: ValidationError[]): string[] => {
  return errors.flatMap((error) => {
    const messages = Object.entries(error.constraints ?? {}).map(
      ([constraint, message]) => {
        if (constraint === 'whitelistValidation') {
          return `O campo ${error.property} não é permitido.`;
        }

        return message;
      },
    );

    return [...messages, ...getValidationMessages(error.children ?? [])];
  });
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) =>
        new BadRequestException({
          error: 'Requisição inválida',
          message: getValidationMessages(errors),
          statusCode: 400,
        }),
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API de Gerenciamento de Usuários')
    .setDescription(
      'API REST para gestão de usuários com autenticação JWT e autorização por perfil.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const port = Number(configService.get<string>('PORT') ?? 3000);
  await app.listen(port);
}
void bootstrap();
