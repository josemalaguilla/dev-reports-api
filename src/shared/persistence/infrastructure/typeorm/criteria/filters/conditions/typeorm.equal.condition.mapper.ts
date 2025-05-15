import { EqualCondition } from '../../../../../domain/criteria/conditions/operators/equal.condition';
import {
  TypeORMConditionMapper,
  TypeORMConditionMapperResult,
} from './typeorm.condition.mapper';

export class TypeORMEqualConditionMapper extends TypeORMConditionMapper {
  public map(condition: EqualCondition): TypeORMConditionMapperResult {
    this.logger.verbose('Mapping EQUAL condition', {
      field: condition.field,
      value: condition.value,
    });

    return {
      where: `"${condition.field.value()}" = :${condition.identifier.value()}`,
      parameters: { [condition.identifier.value()]: condition.value.value() },
    };
  }
}
