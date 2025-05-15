import { GreaterThanOrEqualCondition } from '../../../../../domain/criteria/conditions/operators/greater.equal.condition';
import {
  TypeORMConditionMapper,
  TypeORMConditionMapperResult,
} from './typeorm.condition.mapper';

export class TypeORMGreaterThanEqualConditionMapper extends TypeORMConditionMapper {
  public map(
    condition: GreaterThanOrEqualCondition,
  ): TypeORMConditionMapperResult {
    this.logger.verbose('Mapping GREATER THAN OR EQUAL condition', {
      field: condition.field,
      value: condition.value,
    });

    return {
      where: `"${condition.field.value()}" >= :${condition.identifier.value()}`,
      parameters: { [condition.identifier.value()]: condition.value.value() },
    };
  }
}
