import { SNSClient } from '@aws-sdk/client-sns';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SNSEventBusFactory } from './sns.event.bus.factory';
import { SNSEventPublisher } from './sns.event.publisher';

@Global()
@Module({
  providers: [
    {
      provide: SNSClient,
      useFactory: (configService: ConfigService) => {
        return new SNSClient({
          endpoint: configService.get<string>('AWS_ENDPOINT'),
          region: configService.get<string>('AWS_REGION'),
          credentials: {
            accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
            secretAccessKey: configService.get<string>('AWS_SECRET_KEY'),
          },
        });
      },
      inject: [ConfigService],
    },
    SNSEventPublisher,
    SNSEventBusFactory,
  ],
  exports: [SNSEventBusFactory],
})
export class SNSEventModule {}
