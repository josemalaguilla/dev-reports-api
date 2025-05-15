import { LowerThanOrEqualCondition } from '../../../../../domain/criteria/conditions/operators/lower.equal.filter';
import {
  TypeORMConditionMapper,
  TypeORMConditionMapperResult,
} from './typeorm.condition.mapper';

export class TypeORMLowerThanEqualConditionMapper extends TypeORMConditionMapper {
  public map(
    condition: LowerThanOrEqualCondition,
  ): TypeORMConditionMapperResult {
    this.logger.verbose('Mapping LOWER THAN OR EQUAL condition', {
      field: condition.field,
      value: condition.value,
    });

    return {
      where: `"${condition.field.value()}" <= :${condition.identifier.value()}`,
      parameters: { [condition.identifier.value()]: condition.value.value() },
    };
  }
}
