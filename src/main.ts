import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as http from 'http';
import { ComunicationGateway } from './comunication/comunication.gateway';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('moviles/apil6');
  const httpAdapter = app.getHttpAdapter();
  const server = http.createServer(httpAdapter.getInstance());

  const comunicationGateway = app.get(ComunicationGateway);

  server.on('upgrade', (request, socket, head) => {
    comunicationGateway.handleUpgrade(request, socket, head);
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.init();
  server.listen(process.env.PORT ?? 3000, () => {
    console.log(
      `🚀 Servidor escuchando en el puerto ${process.env.PORT ?? 3000}`,
    );
  });
}
bootstrap();
