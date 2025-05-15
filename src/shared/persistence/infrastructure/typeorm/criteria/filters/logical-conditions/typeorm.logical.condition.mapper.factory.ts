import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { InvalidArgumentError } from 'src/shared/core/domain/errors/invalid-argument.error';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';
import { AndCondition } from 'src/shared/persistence/domain/criteria/conditions/logical-conditions/and.condition';
import { OrCondition } from 'src/shared/persistence/domain/criteria/conditions/logical-conditions/or.condition';
import { LogicalCondition } from 'src/shared/persistence/domain/criteria/conditions/logical.condition';
import { TypeORMAndConditionMapper } from './typeorm.and.condition.mapper';
import { TypeORMLogicalConditionMapper } from './typeorm.logical.condition.mapper';
import { TypeORMOrConditionMapper } from './typeorm.or.condition.mapper';

export class TypeORMLogicalConditionMapperFactory {
  private static readonly logger: Logger = LoggerFactory.create(
    new LoggerContextBuilder()
      .withModule(LoggingSymbols.persistence)
      .withClassType(LoggingClassTypes.infraestructure)
      .withClassName(this.constructor.name)
      .build(),
  );

  private static readonly factoryMap = new Map<
    typeof LogicalCondition,
    TypeORMLogicalConditionMapper
  >([
    [AndCondition, new TypeORMAndConditionMapper()],
    [OrCondition, new TypeORMOrConditionMapper()],
  ]);

  public static create(
    condition: LogicalCondition,
  ): TypeORMLogicalConditionMapper {
    this.logger.verbose('Creating logical condition mapper', {
      conditionType: condition.constructor.name,
    });

    const mapper = this.factoryMap.get(
      condition.constructor as typeof LogicalCondition,
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
