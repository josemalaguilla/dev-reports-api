import { GreaterThanCondition } from '../../../../../domain/criteria/conditions/operators/greater.condition';
import {
  TypeORMConditionMapper,
  TypeORMConditionMapperResult,
} from './typeorm.condition.mapper';

export class TypeORMGreaterThanConditionMapper extends TypeORMConditionMapper {
  public map(condition: GreaterThanCondition): TypeORMConditionMapperResult {
    this.logger.verbose('Mapping GREATER THAN condition', {
      field: condition.field,
      value: condition.value,
    });

    return {
      where: `"${condition.field.value()}" > :${condition.identifier.value()}`,
      parameters: { [condition.identifier.value()]: condition.value.value() },
    };
  }
}
