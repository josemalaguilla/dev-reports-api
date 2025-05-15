import { LogicalCondition, LogicalOperators } from '../logical.condition';

export class AndCondition extends LogicalCondition {
  logicalOperator: LogicalOperators = LogicalOperators.AND;
}
