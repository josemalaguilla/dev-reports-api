import { Primitives } from 'src/shared/core/domain/value-object/primitive.value.object';
import { BaseValueObject } from '../../../../core/domain/value-object/base.value.object';

export class ConditionValue extends BaseValueObject<Primitives> {
  constructor(value: Primitives) {
    super(value);
  }
}
