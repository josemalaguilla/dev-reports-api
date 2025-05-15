export interface ArrayValueObject<T> {
  value(): T[];
  equals(otherValue: ArrayValueObject<T>): boolean;
  length(): number;
}
