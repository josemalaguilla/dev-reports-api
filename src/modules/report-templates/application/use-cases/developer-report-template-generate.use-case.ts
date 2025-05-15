import { Inject } from '@nestjs/common';
import { FindOneDeveloperUseCase } from 'src/modules/developers/application/use-cases/find-one-developer.use-case';
import { DEVELOPER_SYMBOLS } from 'src/modules/developers/developers.symbols';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { File } from 'src/shared/file/domain/file';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { ReportGenerationParams } from '../../domain/report.generation.params';
import { ReportTemplateId } from '../../domain/report.template.id';
import { ReportTemplateUseCase } from './report.template.use-case';

export class DeveloperReportTemplateGenerateUseCase
  implements ReportTemplateUseCase
{
  private readonly logger: Logger;

  constructor(
    @Inject(DEVELOPER_SYMBOLS.FIND_ONE_DEVELOPER_USE_CASE)
    private readonly findOneDeveloperUseCase: FindOneDeveloperUseCase,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.reports)
        .withClassType(LoggingClassTypes.useCase)
        .withClassName(this.constructor.name)
        .build(),
    );
  }

  public async run(
    templateId: ReportTemplateId,
    params: ReportGenerationParams,
  ): Promise<File> {
    this.logger.log('Generating developer report template', {
      templateId: templateId,
      developerId: params.developerId,
    });

    const developerId = params.developerId;
    const developer = await this.findOneDeveloperUseCase.run(developerId);

    this.logger.log('Developer found', {
      developerId: developer.id,
      name: developer.name,
    });

    const jsonContent = JSON.stringify(developer, null, 2);
    const buffer = Buffer.from(jsonContent);
    const fileName = `developer_report_${developerId.value()}.json`;

    this.logger.log('Developer report template generated', {
      reportId: templateId,
      fileName,
    });

    return new File(buffer, fileName);
  }
}
