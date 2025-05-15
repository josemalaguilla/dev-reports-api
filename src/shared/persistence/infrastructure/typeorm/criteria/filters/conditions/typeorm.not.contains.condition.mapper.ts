import { NotContainsCondition } from 'src/shared/persistence/domain/criteria/conditions/operators/not.contains.filter';
import {
  TypeORMConditionMapper,
  TypeORMConditionMapperResult,
} from './typeorm.condition.mapper';

export class TypeORMNotContainsConditionMapper extends TypeORMConditionMapper {
  public map(condition: NotContainsCondition): TypeORMConditionMapperResult {
    this.logger.verbose('Mapping NOT CONTAINS condition', {
      field: condition.field,
      values: condition.value.map((v) => v.value()),
    });

    return {
      where: `"${condition.field.value()}" NOT IN (:...${condition.identifier.value()})`,
      parameters: {
        [condition.identifier.value()]: condition.value.map((conditionValue) =>
          conditionValue.value(),
        ),
      },
    };
  }
}
