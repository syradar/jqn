import { Err, Ok } from "ts-results";
import { describe, expect, it } from "vitest";
import { JQNOk } from "./main";
import { safeTryMap } from "./safeTryMap";

describe("safeTryMap", () => {
  it("should return an error if the function throws", () => {
    const error = new Error("test");
    const expected = Err(error);
    const fn = () => {
      throw error;
    };
    const ok = JQNOk(document.createElement("div"));
    const result = safeTryMap(fn, Ok(ok));
    expect(result).toEqual(expected);
  });
});
