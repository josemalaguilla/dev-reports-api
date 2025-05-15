import { BaseValueObject } from '../../../../core/domain/value-object/base.value.object';
import { ConditionField } from './condition.field';

export class ConditionIdentifier extends BaseValueObject<string> {
  public static fromField(conditionField: ConditionField): ConditionIdentifier {
    return new ConditionIdentifier(conditionField.value());
  }
}
