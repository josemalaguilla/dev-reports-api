import { LoggingSymbols } from 'src/server/app.logging.symbols';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { InvalidArgumentError } from '../../../../../../core/domain/errors/invalid-argument.error';
import { Logger } from '../../../../../../logger/domain/ports/logger';
import { LoggerFactory } from '../../../../../../logger/infrastructure/logger.factory';
import { Condition } from '../../../../../domain/criteria/conditions/condition';
import { LogicalCondition } from '../../../../../domain/criteria/conditions/logical.condition';
import { ContainsCondition } from '../../../../../domain/criteria/conditions/operators/contains.condition';
import { EqualCondition } from '../../../../../domain/criteria/conditions/operators/equal.condition';
import { GreaterThanCondition } from '../../../../../domain/criteria/conditions/operators/greater.condition';
import { GreaterThanOrEqualCondition } from '../../../../../domain/criteria/conditions/operators/greater.equal.condition';
import { LowerThanOrEqualCondition } from '../../../../../domain/criteria/conditions/operators/lower.equal.filter';
import { LowerThanCondition } from '../../../../../domain/criteria/conditions/operators/lower.filter';
import { NotContainsCondition } from '../../../../../domain/criteria/conditions/operators/not.contains.filter';
import { NotEqualCondition } from '../../../../../domain/criteria/conditions/operators/not.equal.filter';
import { TypeORMConditionMapper } from './typeorm.condition.mapper';
import { TypeORMContainsConditionMapper } from './typeorm.contains.condition.mapper';
import { TypeORMEqualConditionMapper } from './typeorm.equal.condition.mapper';
import { TypeORMGreaterThanConditionMapper } from './typeorm.greater.condition.mapper';
import { TypeORMGreaterThanEqualConditionMapper } from './typeorm.greater.equal.condition.mapper';
import { TypeORMLowerThanConditionMapper } from './typeorm.lower.condition.mapper';
import { TypeORMLowerThanEqualConditionMapper } from './typeorm.lower.equal.condition.mapper';
import { TypeORMNotContainsConditionMapper } from './typeorm.not.contains.condition.mapper';
import { TypeORMNotEqualConditionMapper } from './typeorm.not.equal.condition.mapper';

export class TypeORMConditionMapperFactory {
  private static readonly logger: Logger = LoggerFactory.create(
    new LoggerContextBuilder()
      .withModule(LoggingSymbols.persistence)
      .withClassType(LoggingClassTypes.infraestructure)
      .withClassName(this.constructor.name)
      .build(),
  );

  private static readonly factoryMap = new Map<
    typeof Condition,
    TypeORMConditionMapper
  >([
    [EqualCondition, new TypeORMEqualConditionMapper()],
    [GreaterThanCondition, new TypeORMGreaterThanConditionMapper()],
    [GreaterThanOrEqualCondition, new TypeORMGreaterThanEqualConditionMapper()],
    [LowerThanCondition, new TypeORMLowerThanConditionMapper()],
    [LowerThanOrEqualCondition, new TypeORMLowerThanEqualConditionMapper()],
    [NotEqualCondition, new TypeORMNotEqualConditionMapper()],
    [ContainsCondition, new TypeORMContainsConditionMapper()],
    [NotContainsCondition, new TypeORMNotContainsConditionMapper()],
  ]);

  public static create(
    condition: Condition | LogicalCondition,
  ): TypeORMConditionMapper {
    this.logger.verbose('Creating condition mapper', {
      conditionType: condition.constructor.name,
    });

    const mapper = this.factoryMap.get(
      condition.constructor as typeof Condition,
    );
    if (!mapper) {
      this.logger.error('Unsupported condition type', {
        conditionType: condition.constructor.name,
      });
      throw new InvalidArgumentError(
        `Unsupported condition ${condition.constructor}`,
      );
    }

    return mapper;
  }
}
