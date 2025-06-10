import { Module } from '@nestjs/common';
import { ComunicationService } from './comunication.service';
import { ComunicationGateway } from './comunication.gateway';

@Module({
  providers: [ComunicationGateway, ComunicationService],
})
export class ComunicationModule {}
