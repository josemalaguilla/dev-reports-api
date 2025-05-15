import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { Inject } from '@nestjs/common';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Logger } from '../../../logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from '../../../logger/domain/services/logger.context.builder';
import { LoggerFactory } from '../../../logger/infrastructure/logger.factory';
import { SNSTopic } from './value-objects/sns.topic';

export declare type SNSMessage = object;

export type SNSMessageGroupId = string;

export class SNSEventPublisher {
  private readonly logger: Logger;

  constructor(@Inject(SNSClient) private readonly snsClient: SNSClient) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.events)
        .withClassType(LoggingClassTypes.infraestructure)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  public async publish(
    topic: SNSTopic,
    message: SNSMessage,
    messageGroupId: SNSMessageGroupId,
  ): Promise<void> {
    this.logger.debug('Publishing message to SNS', {
      topicArn: topic,
      message: message,
    });

    const command = new PublishCommand({
      TopicArn: topic.value(),
      MessageGroupId: messageGroupId,
      Message: JSON.stringify(message),
    });

    await this.snsClient.send(command);
  }
}
