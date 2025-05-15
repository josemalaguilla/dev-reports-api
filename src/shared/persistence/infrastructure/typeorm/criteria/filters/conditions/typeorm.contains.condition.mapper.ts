import { ContainsCondition } from '../../../../../domain/criteria/conditions/operators/contains.condition';
import {
  TypeORMConditionMapper,
  TypeORMConditionMapperResult,
} from './typeorm.condition.mapper';

export class TypeORMContainsConditionMapper extends TypeORMConditionMapper {
  public map(condition: ContainsCondition): TypeORMConditionMapperResult {
    this.logger.verbose('Mapping CONTAINS condition', {
      field: condition.field,
      values: condition.value.map((v) => v.value()),
    });

    return {
      where: `"${condition.field.value()}" IN (:...${condition.identifier.value()})`,
      parameters: {
        [condition.identifier.value()]: condition.value.map((conditionValue) =>
          conditionValue.value(),
        ),
      },
    };
  }
}
