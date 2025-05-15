import { LowerThanCondition } from '../../../../../domain/criteria/conditions/operators/lower.filter';
import {
  TypeORMConditionMapper,
  TypeORMConditionMapperResult,
} from './typeorm.condition.mapper';

export class TypeORMLowerThanConditionMapper extends TypeORMConditionMapper {
  public map(condition: LowerThanCondition): TypeORMConditionMapperResult {
    this.logger.verbose('Mapping LOWER THAN condition', {
      field: condition.field,
      value: condition.value,
    });

    return {
      where: `"${condition.field.value()}" < :${condition.identifier.value()}`,
      parameters: { [condition.identifier.value()]: condition.value.value() },
    };
  }
}
