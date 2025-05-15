export interface ValueObject<T> {
  value(): T;
  equals(otherValue: ValueObject<T>): boolean;
}
