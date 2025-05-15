import { DeveloperId } from 'src/modules/developers/domain/value-objects/developer.id';
import { ReportGenerationParams } from 'src/modules/report-templates/domain/report.generation.params';
import { ReportTemplateId } from 'src/modules/report-templates/domain/report.template.id';
import { ReportTemplateNotFound } from 'src/modules/report-templates/domain/report.template.not.found';
import { File } from 'src/shared/file/domain/file';
import { DeveloperReportTemplateGenerateUseCase } from '../../../../../src/modules/report-templates/application/use-cases/developer-report-template-generate.use-case';
import { ReportTemplateGenerateUseCase } from '../../../../../src/modules/report-templates/application/use-cases/report-template-generate.use-case';

describe('ReportTemplateGenerateUseCase', () => {
  let useCase: ReportTemplateGenerateUseCase;
  let developerReportTemplateGenerateUseCase: DeveloperReportTemplateGenerateUseCase;
  let developerId: DeveloperId;
  let templateId: ReportTemplateId;
  let params: ReportGenerationParams;

  beforeEach(() => {
    developerReportTemplateGenerateUseCase = {
      run: jest.fn(),
    } as unknown as DeveloperReportTemplateGenerateUseCase;

    useCase = new ReportTemplateGenerateUseCase(
      developerReportTemplateGenerateUseCase,
    );

    developerId = DeveloperId.create();
    templateId = ReportTemplateId.developer();
    params = new ReportGenerationParams(developerId.value());
  });

  it('should generate a report using the correct template', async () => {
    givenDeveloperReportTemplateExists();

    const result = await useCase.run(templateId, params);

    expectToReturnValidFile(result);
    expectToCallDeveloperReportTemplate();
  });

  it('should throw an error when template is not found', async () => {
    givenInvalidTemplateId();

    try {
      await useCase.run(templateId, params);
    } catch (error) {
      expectToThrowTemplateNotFoundError(error);
    }
  });

  function givenDeveloperReportTemplateExists(): void {
    const mockFile = new File(Buffer.from('{}'), 'test.json');
    (developerReportTemplateGenerateUseCase.run as jest.Mock).mockResolvedValue(
      mockFile,
    );
  }

  function givenInvalidTemplateId(): void {
    templateId = { value: () => 'invalid' } as unknown as ReportTemplateId;
  }

  function expectToCallDeveloperReportTemplate(): void {
    expect(developerReportTemplateGenerateUseCase.run).toHaveBeenCalledWith(
      templateId,
      params,
    );
  }

  function expectToReturnValidFile(result: File): void {
    expect(result).toBeInstanceOf(File);
    expect(result.buffer).toBeInstanceOf(Buffer);
  }

  function expectToThrowTemplateNotFoundError(error: Error): void {
    expect(error).toBeInstanceOf(ReportTemplateNotFound);
  }
});
