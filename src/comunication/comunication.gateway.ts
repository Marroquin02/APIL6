import { Injectable, OnModuleInit } from '@nestjs/common';
import { ComunicationService } from './comunication.service';
import * as WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { URLSearchParams } from 'url';
import { Duplex } from 'stream';

@Injectable()
export class ComunicationGateway implements OnModuleInit {
  private wss: WebSocket.Server;

  constructor(private readonly comunicationService: ComunicationService) {}

  onModuleInit() {
    this.wss = new WebSocket.Server({ noServer: true });
    console.log('Servidor WebSocket listo para manejar conexiones upgrade');

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) =>
      this.handleConnection(ws, request),
    );
  }

  public handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer) {
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.wss.emit('connection', ws, request);
    });
  }

  private handleConnection(ws: WebSocket, request: IncomingMessage) {
    const urlSearchParams = new URLSearchParams(
      request.url?.split('?')[1] || '',
    );
    const clientId = urlSearchParams.get('id');

    if (!clientId) {
      console.log('Cliente intentó conectarse sin proporcionar un ID válido');
      ws.close();
      return;
    }

    console.log(`Cliente con ID '${clientId}' conectado`);
    this.comunicationService.addClient(clientId, ws);
    console.log(this.comunicationService.getClients().size);

    ws.on('message', (message: WebSocket.Data) => {
      try {
        const text =
          typeof message === 'string'
            ? message
            : Buffer.isBuffer(message)
              ? message.toString()
              : '';

        if (!text) {
          console.warn('Mensaje recibido no es un string ni un buffer válido');
          return;
        }

        const parsedMessage: Record<string, unknown> = JSON.parse(
          text,
        ) as Record<string, unknown>;
        console.log(
          `Mensaje recibido del cliente '${clientId}':`,
          parsedMessage,
        );

        if (parsedMessage.type === 'AddPost') {
          this.comunicationService.broadcastMessage(
            ws,
            'NewPost',
            parsedMessage.data,
          );
        } else if (parsedMessage.type === 'AddMessage') {
          this.comunicationService.broadcastMessage(
            ws,
            'NewMessage',
            parsedMessage.data,
          );
        }
      } catch (error) {
        console.error('Error al procesar el mensaje:', error);
      }
    });

    ws.on('close', () => {
      console.log(`Cliente con ID '${clientId}' desconectado`);
      this.comunicationService.removeClient(clientId);
    });
  }
}
