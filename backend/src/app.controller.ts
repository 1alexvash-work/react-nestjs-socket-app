import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** For testing: ignore */
  @Get('message')
  getHello() {
    return this.appService.getHello();
  }

  /**
   * @returns all messages for a given channel
   */
  @Get('messages/:channelId')
  getMessages(@Param('channelId') channelId: string) {
    return this.appService.getMessages(channelId);
  }

  /**
   * @returns all channels
   */
  @Get('channels')
  getChannels() {
    return this.appService.getChannels();
  }
}
