import { Condition } from '../condition';
import { ConditionField } from '../condition.field';
import { ConditionIdentifier } from '../condition.identifier';
import { ConditionOperator, Operator } from '../condition.operator';
import { ConditionValue } from '../condition.value';

export class LowerThanOrEqualCondition extends Condition {
  operator: ConditionOperator = new ConditionOperator(Operator.LTE);
  readonly value: ConditionValue;

  constructor(
    field: ConditionField,
    value: ConditionValue,
    identifier?: ConditionIdentifier,
  ) {
    super(field, value, identifier);
  }
}
