import { Condition } from '../condition';
import { ConditionField } from '../condition.field';
import { ConditionIdentifier } from '../condition.identifier';
import { ConditionOperator, Operator } from '../condition.operator';
import { ConditionValue } from '../condition.value';

export class NotEqualCondition extends Condition {
  operator: ConditionOperator = new ConditionOperator(Operator.NOT_EQUAL);
  readonly value: ConditionValue;

  constructor(
    field: ConditionField,
    value: ConditionValue,
    identifier?: ConditionIdentifier,
  ) {
    super(field, value, identifier);
  }
}
