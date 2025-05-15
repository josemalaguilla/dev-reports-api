import { UpdateDeveloperEmailDomainEvent } from 'src/modules/developers/domain/events/update.developer.email.domain.event';
import { UpdateDeveloperLastNameDomainEvent } from 'src/modules/developers/domain/events/update.developer.lastname.domain.event';
import { UpdateDeveloperNameDomainEvent } from 'src/modules/developers/domain/events/update.developer.name.domain.event';
import { DeveloperRepository } from 'src/modules/developers/domain/ports/developer.repository';
import { DeveloperLastName } from 'src/modules/developers/domain/value-objects/developer.last.name';
import { EventBus } from 'src/shared/events/domain/event.bus';
import { CountResult } from 'src/shared/persistence/domain/responses/count.result';
import { EventBusMock } from 'test/shared/events/infrastructure/mock/event.bus.mock';
import { DeveloperUpdateQuery } from '../../../../../src/modules/developers/application/dtos/developer.update.query';
import { UpdateDeveloperUseCase } from '../../../../../src/modules/developers/application/use-cases/update-developer.use-case';
import {
  Developer,
  DeveloperWithPrimitives,
} from '../../../../../src/modules/developers/domain/entities/developer';
import { DeveloperNotFoundError } from '../../../../../src/modules/developers/domain/errors/developer.not-found.error';
import { DuplicateEmailError } from '../../../../../src/modules/developers/domain/errors/duplicate.email.error';
import { DeveloperMother } from '../../domain/entities/developer.mother';
import { DeveloperEmailMother } from '../../domain/value-objects/developer.email.mother';
import { DeveloperLastNameMother } from '../../domain/value-objects/developer.last.name.mother';
import { DeveloperNameMother } from '../../domain/value-objects/developer.name.mother';
import { DeveloperRepositoryMock } from '../../infrastructure/persistence/mock/developer.repository.mock';

describe('UpdateDeveloperUseCase', () => {
  let useCase: UpdateDeveloperUseCase;
  let repository: DeveloperRepository;
  let validUpdate: DeveloperUpdateQuery;
  let validDeveloper: Developer;
  let eventBus: EventBus;

  beforeEach(() => {
    repository = new DeveloperRepositoryMock();
    eventBus = new EventBusMock();
    useCase = new UpdateDeveloperUseCase(repository, eventBus);
    validUpdate = new DeveloperUpdateQuery(
      DeveloperNameMother.random(),
      DeveloperLastNameMother.random(),
      DeveloperEmailMother.random(),
    );
    validDeveloper = DeveloperMother.random();
  });

  it('should update a developer', async () => {
    mockDatasourceToFindDeveloper();
    mockDatasourceToNotFindAnyDeveloperWithSameEmail();

    const result = await useCase.run(validDeveloper.id, validUpdate);

    expectResultToHaveValuesUpdated(result);
    expectToHaveSavedProperlyTheUpdates();
  });

  it('should publish an event when updating each developer field', async () => {
    mockDatasourceToFindDeveloper();
    mockDatasourceToNotFindAnyDeveloperWithSameEmail();

    await useCase.run(validDeveloper.id, validUpdate);

    expectToHaveEmittedUpdateDeveloperEvents();
  });

  it('should unset value when receiving empty string as update', async () => {
    validUpdate = new DeveloperUpdateQuery(
      undefined,
      new DeveloperLastName(''),
    );
    mockDatasourceToFindDeveloper();
    mockDatasourceToNotFindAnyDeveloperWithSameEmail();

    const result = await useCase.run(validDeveloper.id, validUpdate);

    expectResultToHaveUnsetTheProperty(result);
    expectToHaveSavedTheInstanceWithoutTheRemovedField();
  });

  it('should not modify nothing when receives undefined update param', async () => {
    validUpdate = new DeveloperUpdateQuery();
    mockDatasourceToFindDeveloper();
    mockDatasourceToNotFindAnyDeveloperWithSameEmail();

    const result = await useCase.run(validDeveloper.id, validUpdate);

    expectResultToHaveValuesUpdated(result);
    expectToHaveSavedProperlyTheUpdates();
  });

  it('should fail if developer does not exists', async () => {
    mockDatasourceToNotFindDeveloper();
    mockDatasourceToNotFindAnyDeveloperWithSameEmail();

    try {
      await useCase.run(validDeveloper.id, validUpdate);
    } catch (error) {
      expectToThrowNotFoundError(error);
    }
  });

  it('should fail if updated email already exists', async () => {
    validUpdate = new DeveloperUpdateQuery(
      undefined,
      undefined,
      DeveloperEmailMother.random(),
    );
    mockDatasourceToFindDeveloper();
    mockDatasourceToFindOtherDevelopersWithSameEmail();

    try {
      await useCase.run(validDeveloper.id, validUpdate);
    } catch (error) {
      expectToThrowDuplicateEmailError(error);
    }
  });

  function mockDatasourceToFindDeveloper() {
    repository.findOne = jest.fn().mockResolvedValue(validDeveloper);
  }

  function mockDatasourceToNotFindDeveloper() {
    repository.findOne = jest.fn().mockResolvedValue(null);
  }

  function mockDatasourceToNotFindAnyDeveloperWithSameEmail(): void {
    repository.count = jest.fn().mockResolvedValue(new CountResult(0));
  }

  function mockDatasourceToFindOtherDevelopersWithSameEmail(): void {
    repository.count = jest.fn().mockResolvedValue(new CountResult(1));
  }

  function expectResultToHaveValuesUpdated(
    updated: DeveloperWithPrimitives,
  ): void {
    expect(updated).toEqual({
      ...validDeveloper.toPrimitives(),
      ...validUpdate.toPrimitives(),
    });
  }

  function expectResultToHaveUnsetTheProperty(
    updated: DeveloperWithPrimitives,
  ) {
    const expectedUpdatedDeveloper = validDeveloper.toPrimitives();
    delete expectedUpdatedDeveloper.lastName;
    expect(updated).toEqual(expectedUpdatedDeveloper);
  }

  function expectToHaveSavedProperlyTheUpdates(): void {
    expect(repository.save).toHaveBeenCalledWith(expect.any(Developer));
    const developerUsedToSave: Developer = (repository.save as jest.Mock).mock
      .calls[0][0];
    const expectedDeveloper = Developer.fromPrimitives({
      ...validDeveloper.toPrimitives(),
      ...validUpdate.toPrimitives(),
    });
    expect(developerUsedToSave.equals(expectedDeveloper)).toBeTruthy();
  }

  function expectToHaveSavedTheInstanceWithoutTheRemovedField(): void {
    expect(repository.save).toHaveBeenCalledWith(expect.any(Developer));
    const developerUsedToSave: Developer = (repository.save as jest.Mock).mock
      .calls[0][0];
    const expectedUpdatedDeveloper = validDeveloper.toPrimitives();
    delete expectedUpdatedDeveloper.lastName;
    const expectedDeveloper = Developer.fromPrimitives({
      ...expectedUpdatedDeveloper,
      lastName: null,
    });
    expect(developerUsedToSave.equals(expectedDeveloper)).toBeTruthy();
  }

  function expectToThrowNotFoundError(error: Error): void {
    expect(error).toBeInstanceOf(DeveloperNotFoundError);
  }

  function expectToThrowDuplicateEmailError(error: Error): void {
    expect(error).toBeInstanceOf(DuplicateEmailError);
  }

  function expectToHaveEmittedUpdateDeveloperEvents(): void {
    const publishCalls = (eventBus.publish as jest.Mock).mock.calls;
    const publishedEvents = publishCalls[0][0];

    expect(publishedEvents).toEqual(
      expect.arrayContaining([
        expect.any(UpdateDeveloperNameDomainEvent),
        expect.any(UpdateDeveloperLastNameDomainEvent),
        expect.any(UpdateDeveloperEmailDomainEvent),
      ]),
    );

    expect(publishedEvents).toHaveLength(3);
  }
});
