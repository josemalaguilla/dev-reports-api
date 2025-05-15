import { Module } from '@nestjs/common';
import { DevelopersModule } from '../developers/developers.module';
import { DeveloperReportTemplateGenerateUseCase } from './application/use-cases/developer-report-template-generate.use-case';
import { ReportTemplateGenerateUseCase } from './application/use-cases/report-template-generate.use-case';
import { REPORT_TEMPLATE_SYMBOLS } from './report-template.symbols';

const useCases = [
  {
    provide:
      REPORT_TEMPLATE_SYMBOLS.DEVELOPER_REPORT_TEMPLATE_GENERATE_USE_CASE,
    useClass: DeveloperReportTemplateGenerateUseCase,
  },
  {
    provide: REPORT_TEMPLATE_SYMBOLS.REPORT_TEMPLATE_GENERATE_USE_CASE,
    useClass: ReportTemplateGenerateUseCase,
  },
];

const externalInterfaces = [
  REPORT_TEMPLATE_SYMBOLS.REPORT_TEMPLATE_GENERATE_USE_CASE,
];

@Module({
  imports: [DevelopersModule],
  providers: [...useCases],
  exports: [...externalInterfaces],
})
export class ReportTemplateModule {}
