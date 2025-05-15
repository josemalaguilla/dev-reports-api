import { CreateDeveloperDomainEvent } from 'src/modules/developers/domain/events/create.developer.domain.event';
import { DeveloperRepository } from 'src/modules/developers/domain/ports/developer.repository';
import { DeveloperEmail } from 'src/modules/developers/domain/value-objects/developer.email';
import { DeveloperLastName } from 'src/modules/developers/domain/value-objects/developer.last.name';
import { DeveloperName } from 'src/modules/developers/domain/value-objects/developer.name';
import { EventBus } from 'src/shared/events/domain/event.bus';
import { CountResult } from 'src/shared/persistence/domain/responses/count.result';
import { EventBusMock } from 'test/shared/events/infrastructure/mock/event.bus.mock';
import { CreateDeveloperUseCase } from '../../../../../src/modules/developers/application/use-cases/create-developer.use-case';
import {
  Developer,
  DeveloperWithPrimitives,
} from '../../../../../src/modules/developers/domain/entities/developer';
import { DuplicateEmailError } from '../../../../../src/modules/developers/domain/errors/duplicate.email.error';
import { DeveloperEmailMother } from '../../domain/value-objects/developer.email.mother';
import { DeveloperLastNameMother } from '../../domain/value-objects/developer.last.name.mother';
import { DeveloperNameMother } from '../../domain/value-objects/developer.name.mother';
import { DeveloperRepositoryMock } from '../../infrastructure/persistence/mock/developer.repository.mock';

describe('CreateDeveloperUseCase', () => {
  let useCase: CreateDeveloperUseCase;
  let repository: DeveloperRepository;
  let eventBus: EventBus;
  let name: DeveloperName;
  let lastName: DeveloperLastName;
  let email: DeveloperEmail;

  beforeEach(() => {
    repository = new DeveloperRepositoryMock();
    eventBus = new EventBusMock();
    useCase = new CreateDeveloperUseCase(repository, eventBus);
    name = DeveloperNameMother.random();
    lastName = DeveloperLastNameMother.random();
    email = DeveloperEmailMother.random();
  });

  it('should create a developer', async () => {
    mockDatasourceToNotFindMoreDevelopersWithEmail();

    const createdDeveloper = await useCase.run(name, email, lastName);

    expectResultToMatchTheCommandFields(createdDeveloper);
    expectToHaveSaved();
  });

  it('should emit a created developer event', async () => {
    mockDatasourceToNotFindMoreDevelopersWithEmail();

    await useCase.run(name, email, lastName);

    expectToHaveEmittedCreateDeveloperEvent();
  });

  it('should throw duplicate email error when other developer has same email', async () => {
    mockDatasourceToFindMoreThanOneDeveloperWithSameEmail();
    try {
      await useCase.run(name, email, lastName);
    } catch (error) {
      expectToThrowDuplicateError(error);
    }
  });

  function expectResultToMatchTheCommandFields(
    createdDeveloper: DeveloperWithPrimitives,
  ): void {
    expect(createdDeveloper).toBeDefined();
    expect(createdDeveloper.name).toEqual(name.value());
    expect(createdDeveloper.lastName).toEqual(lastName.value());
    expect(createdDeveloper.email).toEqual(email.value());
  }

  function expectToHaveSaved(): void {
    expect(repository.save).toHaveBeenCalledWith(expect.any(Developer));
  }

  function expectToThrowDuplicateError(error: Error): void {
    expect(error).toBeInstanceOf(DuplicateEmailError);
  }

  function mockDatasourceToFindMoreThanOneDeveloperWithSameEmail(): void {
    repository.count = jest.fn().mockResolvedValue(new CountResult(1));
  }

  function mockDatasourceToNotFindMoreDevelopersWithEmail(): void {
    repository.count = jest.fn().mockResolvedValue(new CountResult(0));
  }

  function expectToHaveEmittedCreateDeveloperEvent(): void {
    expect(eventBus.publish).toHaveBeenCalledWith([
      expect.any(CreateDeveloperDomainEvent),
    ]);
  }
});
