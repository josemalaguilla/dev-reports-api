import { NotEqualCondition } from '../../../../../domain/criteria/conditions/operators/not.equal.filter';
import {
  TypeORMConditionMapper,
  TypeORMConditionMapperResult,
} from './typeorm.condition.mapper';

export class TypeORMNotEqualConditionMapper extends TypeORMConditionMapper {
  public map(condition: NotEqualCondition): TypeORMConditionMapperResult {
    this.logger.verbose('Mapping NOT EQUAL condition', {
      field: condition.field,
      value: condition.value,
    });

    return {
      where: `"${condition.field.value()}" != :${condition.identifier.value()}`,
      parameters: { [condition.identifier.value()]: condition.value.value() },
    };
  }
}
