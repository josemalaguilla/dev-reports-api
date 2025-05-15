import { ValueObject } from './value.object';

export declare type Primitives = string | number | boolean | Date;

export type PrimitiveValueObject<T extends Primitives> = ValueObject<T>;
