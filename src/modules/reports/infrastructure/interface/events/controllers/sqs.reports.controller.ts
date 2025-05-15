import { Message } from '@aws-sdk/client-sqs';
import { Inject, Injectable } from '@nestjs/common';
import { SqsConsumerEventHandler, SqsMessageHandler } from '@ssut/nestjs-sqs';
import { REPORT_SYMBOLS } from 'src/modules/reports/reports.symbols';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { SQSEventConsumer } from 'src/shared/events/infrastructure/sqs/sqs.event.consumer';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { ReportGenerateOnReportCreate } from '../../../../application/use-cases/report-generate-on-report-create.controller';

@Injectable()
export class ReportsSQSConsumer extends SQSEventConsumer {
  constructor(
    @Inject(REPORT_SYMBOLS.GENERATE_REPORT_ON_REPORT_CREATE)
    private readonly generateReportOnReportCreate: ReportGenerateOnReportCreate,
  ) {
    super();
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.events)
        .withClassType(LoggingClassTypes.infraestructure)
        .withClassName(this.constructor.name)
        .build(),
    );
    this.subscribers = [this.generateReportOnReportCreate];
    this.deserializer.configure(this.subscribers);
  }

  @SqsMessageHandler(REPORT_SYMBOLS.REPORT_DOMAIN_EVENTS_MESSAGE, false)
  public async handleMessage(message: Message): Promise<void> {
    return this.processMessage(message);
  }

  @SqsConsumerEventHandler(
    REPORT_SYMBOLS.REPORT_DOMAIN_EVENTS_MESSAGE,
    'processing_error',
  )
  public async onProcessingError(
    error: Error,
    message: Message,
  ): Promise<void> {
    this.logger.error(`Error processing events`, { error, message });
  }

  @SqsConsumerEventHandler(REPORT_SYMBOLS.REPORT_DOMAIN_EVENTS_MESSAGE, 'error')
  public async onError(
    error: Error,
    message: Message | Message[],
  ): Promise<void> {
    this.logger.error(`Error with events`, { error, message });
  }

  @SqsConsumerEventHandler(
    REPORT_SYMBOLS.REPORT_DOMAIN_EVENTS_MESSAGE,
    'timeout_error',
  )
  public async onTimeoutError(error: Error, message: Message): Promise<void> {
    this.logger.error(`Timeout error processing events`, { error, message });
  }
}
