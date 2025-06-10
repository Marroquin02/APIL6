import { Injectable } from '@nestjs/common';
import * as WebSocket from 'ws';

@Injectable()
export class ComunicationService {
  private clients: Map<string, WebSocket> = new Map();

  getClients(): Map<string, WebSocket> {
    return this.clients;
  }

  addClient(clientId: string, ws: WebSocket): void {
    if (this.clients.has(clientId)) {
      const existingWs = this.clients.get(clientId);
      if (existingWs) this.sendMessage(existingWs, 'disconect');
      existingWs?.close();
    }
    this.clients.set(clientId, ws);
  }

  removeClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  broadcastMessage(sender: WebSocket, type: string, data: any): void {
    this.clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        this.sendMessage(client, type, data);
      }
    });
  }

  private sendMessage(client: WebSocket, type: string, data?: unknown): void {
    const message = JSON.stringify({ type, data });
    client?.send(message);
  }
}
