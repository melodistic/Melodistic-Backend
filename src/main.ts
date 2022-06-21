import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet'
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api')
	app.enableCors({
		allowedHeaders: ['Authorization', 'Content-Type'],
		methods: ['GET', 'POST'],
		origin: ['localhost'],
	})
  app.use(helmet())

  const config = new DocumentBuilder()
    .setTitle('Melodistic API')
    .setDescription('Melodistic API Specification')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header'
    })
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(configService.get('PORT'));

}
bootstrap();
