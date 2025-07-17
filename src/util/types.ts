export type Override<TYPE, SUBJECT> = Omit<TYPE, keyof SUBJECT> & SUBJECT;

type PrimitiveKeys<TYPE> = {
  [P in keyof TYPE]: TYPE[P] extends object ? never : P;
}[keyof TYPE];
export type PrimitiveOnly<TYPE> = Pick<TYPE, PrimitiveKeys<TYPE>>;

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type PrimitiveType = string | number | boolean | bigint | symbol | Date | null | undefined

export type FilteredPropertiesOnlyPrimitiveAndEnum<T> = {
  [K in keyof T as T[K] extends PrimitiveType ? K :
  T[K] extends Record<string | number, never> ? K : // enum 타입 처리
  never
  ]: T[K]
}

export type FilteredPropertiesOnlyRequired<T> = {
  [K in keyof T as T[K] extends null | undefined ? never :
  K
  ]: T[K]
}

type IsSimple<T> =
  T extends string | number | boolean | null | undefined
  ? true
  : T extends Date
  ? true
  : false

export type MakePrimitiveRequired<T> = {
  [K in keyof T as IsSimple<T[K]> extends true ? K : never]-?: T[K]
}

export type MakePrimitiveRequiredWithObject<T> = {
  [K in keyof T as IsSimple<T[K]> extends true ? K : never]-?: T[K]
} & {
  [K in keyof T as IsSimple<T[K]> extends true ? never : K]?: T[K]
}




export function toSingleString(value: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? ''
  }
  return value
}