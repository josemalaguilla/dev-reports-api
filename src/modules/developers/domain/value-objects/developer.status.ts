import { EnumValueObject } from '../../../../shared/core/domain/value-object/enum.value.object';

export enum DeveloperStatuses {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export class DeveloperStatus extends EnumValueObject<string> {
  constructor(value: string) {
    super(value, Object.values(DeveloperStatuses));
  }

  public static active(): DeveloperStatus {
    return new DeveloperStatus(DeveloperStatuses.ACTIVE);
  }

  public static archived(): DeveloperStatus {
    return new DeveloperStatus(DeveloperStatuses.ARCHIVED);
  }
}
