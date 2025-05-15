import { LogicalCondition, LogicalOperators } from '../logical.condition';

export class OrCondition extends LogicalCondition {
  logicalOperator: LogicalOperators = LogicalOperators.OR;
}
