import { ReportTemplateGenerateUseCase } from 'src/modules/report-templates/application/use-cases/report-template-generate.use-case';
import { ReportGenerationParams } from 'src/modules/report-templates/domain/report.generation.params';
import { ReportTemplateId } from 'src/modules/report-templates/domain/report.template.id';
import { File } from 'src/shared/file/domain/file';
import { Report } from '../entities/report';
import { ReportFileRepository } from '../ports/report.file.repository';
import { ReportGeneratedFile } from '../value-objects/report.generated.file';
import { ReportFilePathBuilder } from './report.file.path.builder';

export class ReportGenerator {
  private readonly pathBuilder: ReportFilePathBuilder;
  constructor(
    private readonly reportFileRepository: ReportFileRepository,
    private readonly reportTemplateGenerateUseCase: ReportTemplateGenerateUseCase,
  ) {
    this.pathBuilder = new ReportFilePathBuilder();
  }

  public async generate(report: Report): Promise<ReportGeneratedFile> {
    const file = await this.generateReportTemplate(report);
    return this.saveFile(file, report);
  }

  private async generateReportTemplate(report: Report): Promise<File> {
    return this.reportTemplateGenerateUseCase.run(
      ReportTemplateId.fromReport(report),
      ReportGenerationParams.fromReport(report),
    );
  }

  private async saveFile(
    file: File,
    report: Report,
  ): Promise<ReportGeneratedFile> {
    const path = this.pathBuilder.build(report, file);
    await this.reportFileRepository.writeFile(file, path);
    return new ReportGeneratedFile(path.value());
  }
}
