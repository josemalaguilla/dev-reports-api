import { FindOneDeveloperUseCase } from 'src/modules/developers/application/use-cases/find-one-developer.use-case';
import { Developer } from 'src/modules/developers/domain/entities/developer';
import { DeveloperNotFoundError } from 'src/modules/developers/domain/errors/developer.not-found.error';
import { DeveloperId } from 'src/modules/developers/domain/value-objects/developer.id';
import { ReportGenerationParams } from 'src/modules/report-templates/domain/report.generation.params';
import { ReportTemplateId } from 'src/modules/report-templates/domain/report.template.id';
import { File } from 'src/shared/file/domain/file';
import { DeveloperMother } from 'test/modules/developers/domain/entities/developer.mother';
import { DeveloperReportTemplateGenerateUseCase } from '../../../../../src/modules/report-templates/application/use-cases/developer-report-template-generate.use-case';

describe('DeveloperReportTemplateGenerateUseCase', () => {
  let useCase: DeveloperReportTemplateGenerateUseCase;
  let findOneDeveloperUseCase: FindOneDeveloperUseCase;
  let developer: Developer;
  let developerId: DeveloperId;
  let templateId: ReportTemplateId;
  let params: ReportGenerationParams;

  beforeEach(() => {
    findOneDeveloperUseCase = {
      run: jest.fn(),
    } as unknown as FindOneDeveloperUseCase;

    useCase = new DeveloperReportTemplateGenerateUseCase(
      findOneDeveloperUseCase,
    );

    developer = DeveloperMother.random();
    developerId = developer.id;
    templateId = ReportTemplateId.developer();
    params = new ReportGenerationParams(developerId.value());
  });

  it('should generate a report file with developer data', async () => {
    givenDeveloperExists();

    const result = await useCase.run(templateId, params);

    expectToReturnValidFile(result);
    expectFileToContainDeveloperData(result);
    expectToFindDeveloperWithCorrectId();
  });

  it('should throw an error when developer is not found', async () => {
    givenDeveloperDoesNotExist();

    try {
      await useCase.run(templateId, params);
    } catch (error) {
      expectToThrowDeveloperNotFoundError(error);
    }
  });

  function givenDeveloperExists(): void {
    (findOneDeveloperUseCase.run as jest.Mock).mockResolvedValue(
      developer.toPrimitives(),
    );
  }

  function givenDeveloperDoesNotExist(): void {
    (findOneDeveloperUseCase.run as jest.Mock).mockRejectedValue(
      new DeveloperNotFoundError(developerId),
    );
  }

  function expectToFindDeveloperWithCorrectId(): void {
    const usedDeveloperId = (findOneDeveloperUseCase.run as jest.Mock).mock
      .calls?.[0]?.[0] as DeveloperId;
    expect(developerId.equals(usedDeveloperId)).toBeTruthy();
  }

  function expectToReturnValidFile(result: File): void {
    expect(result).toBeInstanceOf(File);
    expect(result.fileName).toBe(
      `developer_report_${developerId.value()}.json`,
    );
    expect(result.buffer).toBeInstanceOf(Buffer);
  }

  function expectFileToContainDeveloperData(file: File): void {
    const content = file.buffer.toString();
    const parsedContent = JSON.parse(content);

    expect(parsedContent).toMatchObject({
      id: developer.id.value(),
      name: developer.name.value(),
    });
  }

  function expectToThrowDeveloperNotFoundError(error: Error): void {
    expect(error).toBeInstanceOf(DeveloperNotFoundError);
  }
});
