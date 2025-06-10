import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComunicationModule } from './comunication/comunication.module';
import { ComunicationGateway } from './comunication/comunication.gateway';
import { ComunicationService } from './comunication/comunication.service';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: 'mongodb://localhost:27017/moviles',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ComunicationModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService, ComunicationGateway, ComunicationService],
})
export class AppModule {}
