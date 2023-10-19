export type Nullish = null | undefined;
export type Nullable<T> = T | Nullish;

export function isNullish(value: unknown): value is Nullish {
  return value === null || value === undefined;
}
export function isElement(value: unknown): value is Element {
  return value instanceof Element;
}
export function isString(value: unknown): value is string {
  return typeof value === "string";
}
export function isFunction(
  value: unknown
): value is (
  ...arg: any
) => {} | FunctionConstructor | Function | (() => void) {
  return typeof value === "function";
}

// fix error where array is object
export function isObject(value: unknown): value is object {
  if (isNullish(value)) {
    return false;
  }

  if (typeof value !== "object") {
    return false;
  }

  if (Array.isArray(value)) {
    return false;
  }

  if (value === null) {
    return false;
  }

  if (isFunction(value)) {
    return false;
  }

  return true;
}
