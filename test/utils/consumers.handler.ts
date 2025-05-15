import { INestApplication } from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';

export class ConsumersHandler {
  private readonly sqsService: SqsService;

  constructor(private readonly app: INestApplication) {
    this.sqsService = this.app.get<SqsService>(SqsService);
  }

  public stopAllConsumers() {
    const consumerNames = this.sqsService.consumers.keys();
    for (const consumerName of consumerNames) {
      this.stopConsumer(consumerName);
    }
  }

  public stopConsumer(consumerName: string) {
    const consumer = this.sqsService.consumers.get(consumerName);
    if (!consumer) return;
    consumer.instance.stop({ abort: true });
  }

  public startConsumer(consumerName: string) {
    const consumer = this.sqsService.consumers.get(consumerName);
    if (!consumer) return;
    consumer.instance.start();
  }
}
