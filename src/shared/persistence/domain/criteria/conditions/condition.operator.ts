import { EnumValueObject } from '../../../../core/domain/value-object/enum.value.object';

export enum Operator {
  EQUAL = '=',
  NOT_EQUAL = '!=',
  GT = '>',
  GTE = '>=',
  LT = '<',
  LTE = '<=',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
}

export class ConditionOperator extends EnumValueObject<Operator> {
  constructor(value: Operator) {
    super(value, Object.values(Operator));
  }
}
