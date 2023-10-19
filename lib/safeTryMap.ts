import { Result, Ok, Err } from "ts-results";

export function safeTryMap<T, U = T>(
  fn: (e: T) => U,
  result: Result<T, Error>
): Result<U, Error> {
  try {
    return Ok(fn(result.unwrap()));
  } catch (error) {
    if (error instanceof Error) {
      return Err(error);
    }

    const message = JSON.stringify(error);

    return Err(new Error(message));
  }
}
