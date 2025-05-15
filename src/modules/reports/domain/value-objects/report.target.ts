import { EnumValueObject } from '../../../../shared/core/domain/value-object/enum.value.object';

export enum ReportTargets {
  developer = 'developer',
}

export class ReportTarget extends EnumValueObject<string> {
  constructor(value: string) {
    super(value, Object.values(ReportTargets));
  }

  public static developer(): ReportTarget {
    return new ReportTarget(ReportTargets.developer);
  }
}
