import { LogicalCondition } from 'src/shared/persistence/domain/criteria/conditions/logical.condition';
import { Brackets, WhereExpressionBuilder } from 'typeorm';
import { AndCondition } from '../../../../../domain/criteria/conditions/logical-conditions/and.condition';
import { TypeORMConditionMapperFactory } from '../conditions/typeorm.condition.mapper.factory';
import { TypeORMLogicalConditionMapper } from './typeorm.logical.condition.mapper';
import { TypeORMLogicalConditionMapperFactory } from './typeorm.logical.condition.mapper.factory';

export class TypeORMAndConditionMapper extends TypeORMLogicalConditionMapper {
  public map(builder: WhereExpressionBuilder, condition: AndCondition): void {
    this.logger.verbose('Mapping AND condition', {
      conditionsCount: condition.conditions.length,
    });

    if (condition.hasConditions()) {
      for (const subCondition of condition.conditions) {
        if (subCondition instanceof LogicalCondition) {
          const parser =
            TypeORMLogicalConditionMapperFactory.create(subCondition);
          builder.andWhere(
            new Brackets((subBuilder) => {
              parser.map(subBuilder, subCondition);
            }),
          );
        } else {
          const parser = TypeORMConditionMapperFactory.create(subCondition);
          const { where, parameters } = parser.map(subCondition);
          builder.andWhere(where, parameters);
        }
      }
    }
  }
}
