import { Developer } from 'src/modules/developers/domain/entities/developer';
import { DeleteDeveloperDomainEvent } from 'src/modules/developers/domain/events/delete.developer.domain.event';
import { DeveloperRepository } from 'src/modules/developers/domain/ports/developer.repository';
import { EventBus } from 'src/shared/events/domain/event.bus';
import { EventBusMock } from 'test/shared/events/infrastructure/mock/event.bus.mock';
import { DeleteDeveloperUseCase } from '../../../../../src/modules/developers/application/use-cases/delete-developer.use-case';
import { DeveloperNotFoundError } from '../../../../../src/modules/developers/domain/errors/developer.not-found.error';
import { DeveloperMother } from '../../domain/entities/developer.mother';
import { DeveloperRepositoryMock } from '../../infrastructure/persistence/mock/developer.repository.mock';

describe('DeleteDeveloperUseCase', () => {
  let useCase: DeleteDeveloperUseCase;
  let repository: DeveloperRepository;
  let eventBus: EventBus;
  let validDeveloper: Developer;

  beforeEach(() => {
    repository = new DeveloperRepositoryMock();
    eventBus = new EventBusMock();
    useCase = new DeleteDeveloperUseCase(repository, eventBus);
    validDeveloper = DeveloperMother.random();
  });

  it('should delete a developer', async () => {
    mockDatasourceToFindDeveloper();

    await useCase.run(validDeveloper.id);

    expectToDeleteOnDatasourceWithCorrectParams();
  });

  it('should publish an event when a developer is deleted', async () => {
    mockDatasourceToFindDeveloper();

    await useCase.run(validDeveloper.id);

    expectToHaveEmittedDeletedDeveloperEvent();
  });

  it('should throw not found error if developer does not exists', async () => {
    mockDatasourceToNotFindAnyDeveloper();
    try {
      await useCase.run(validDeveloper.id);
    } catch (error) {
      expectToThrowNotFoundError(error);
    }
  });

  function mockDatasourceToFindDeveloper(): void {
    repository.findOne = jest.fn().mockResolvedValue(validDeveloper);
  }

  function mockDatasourceToNotFindAnyDeveloper(): void {
    repository.find = jest.fn().mockResolvedValue(null);
  }

  function expectToDeleteOnDatasourceWithCorrectParams(): void {
    expect(repository.delete).toHaveBeenCalledWith(validDeveloper);
  }

  function expectToThrowNotFoundError(error: Error): void {
    expect(error).toBeInstanceOf(DeveloperNotFoundError);
  }

  function expectToHaveEmittedDeletedDeveloperEvent(): void {
    expect(eventBus.publish).toHaveBeenCalledWith([
      expect.any(DeleteDeveloperDomainEvent),
    ]);
  }
});
