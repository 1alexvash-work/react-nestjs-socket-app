import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server } from 'socket.io';
import { PrismaService } from 'src/prisma.service';

@WebSocketGateway({ cors: true, namespace: 'chat' })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly prismaService: PrismaService) {}

  @WebSocketServer() io: Server;

  afterInit() {
    console.log('Websocket Server initialized');
  }

  async handleConnection(client: any) {
    this.logger.log(`Client id: ${client.id} connected`);
    const sockets = await this.io.fetchSockets();
    this.logger.debug(`Number of connected clients: ${sockets.length}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client id: ${client.id} disconnected`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    client: any,
    payload: {
      content: string;
      channelId?: string;
      senderName?: string;
    },
  ) {
    this.logger.log(`Message received from client id: ${client.id}`);
    // this.logger.debug(`Payload: ${payload}`);
    // Server emits event to all clients
    this.io.emit('message', payload);
    // Add message to database

    const DEFAULT_CHANNEL_ID = '86539db7-d307-4449-acd5-bb4127e3d4d7';

    await this.prismaService.message.create({
      data: {
        channelId: payload.channelId || DEFAULT_CHANNEL_ID,
        content: payload.content,
        senderName: payload.senderName,
      },
    });
    // Undefined return means no ack needed
    return;
  }
}
