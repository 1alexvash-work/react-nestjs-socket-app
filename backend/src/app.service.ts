import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prismaService: PrismaService) {}

  getHello(): { message: string } {
    return { message: 'Your backend is running!' };
  }

  async getMessages(channelId?: string) {
    const id = channelId || '86539db7-d307-4449-acd5-bb4127e3d4d7';
    return await this.prismaService.message.findMany({
      where: {
        channelId: id,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getChannels() {
    const channels = await this.prismaService.channel.findMany();
    // Populate each channel with the most recent message
    for (const channel of channels) {
      const messages = await this.prismaService.message.findMany({
        where: {
          channelId: channel.id,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      /* @ts-ignore */
      channel.lastMessageSnippet = messages[0]?.content || '';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      /* @ts-ignore */
      channel.lastMessageCreatedAt = messages[0]?.createdAt || '';
    }
    return channels;
  }
}
