import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  console.log(process.env.DATABASE_URL);
  app.use((req: Request, res: Response, next: NextFunction) => {
    const { method, url, body, query, params } = req;

    console.log('Incoming Request:');
    console.log(`Method: ${method}`);
    console.log(`URL: ${url}`);
    console.log(`Query: ${JSON.stringify(query)}`);
    console.log(`Params: ${JSON.stringify(params)}`);
    console.log(`Body: ${JSON.stringify(body)}`);

    // Capture and log the response body
    const originalSend = res.send;
    res.send = function (body) {
      // console.log('Response:');
      // console.log(JSON.stringify(body, null, 2));
      return originalSend.apply(this, arguments);
    };

    next();
  });

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description')
    .setVersion('1.0')
    .build();

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.setGlobalPrefix('api');

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 8001);
}
bootstrap();
