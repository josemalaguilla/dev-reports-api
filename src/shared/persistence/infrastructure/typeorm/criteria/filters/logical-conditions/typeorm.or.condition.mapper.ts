import { OrCondition } from 'src/shared/persistence/domain/criteria/conditions/logical-conditions/or.condition';
import { LogicalCondition } from 'src/shared/persistence/domain/criteria/conditions/logical.condition';
import { Brackets, WhereExpressionBuilder } from 'typeorm';
import { TypeORMConditionMapperFactory } from '../conditions/typeorm.condition.mapper.factory';
import { TypeORMLogicalConditionMapper } from './typeorm.logical.condition.mapper';
import { TypeORMLogicalConditionMapperFactory } from './typeorm.logical.condition.mapper.factory';

export class TypeORMOrConditionMapper extends TypeORMLogicalConditionMapper {
  public map(builder: WhereExpressionBuilder, condition: OrCondition): void {
    this.logger.verbose('Mapping OR condition', {
      conditionsCount: condition.conditions.length,
    });

    if (condition.hasConditions()) {
      for (const subCondition of condition.conditions) {
        if (subCondition instanceof LogicalCondition) {
          const parser =
            TypeORMLogicalConditionMapperFactory.create(subCondition);
          builder.orWhere(
            new Brackets((subBuilder) => {
              parser.map(subBuilder, subCondition);
            }),
          );
        } else {
          const parser = TypeORMConditionMapperFactory.create(subCondition);
          const { where, parameters } = parser.map(subCondition);
          builder.orWhere(where, parameters);
        }
      }
    }
  }
}
