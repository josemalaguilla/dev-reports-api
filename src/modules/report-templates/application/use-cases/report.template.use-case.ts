import { UseCase } from 'src/shared/core/domain/use-cases/base.use-case';
import { File } from 'src/shared/file/domain/file';
import { ReportGenerationParams } from '../../domain/report.generation.params';
import { ReportTemplateId } from '../../domain/report.template.id';

export interface ReportTemplateUseCase
  extends UseCase<File, [ReportTemplateId, ReportGenerationParams]> {
  run(
    templateId: ReportTemplateId,
    params: ReportGenerationParams,
  ): Promise<File>;
}
