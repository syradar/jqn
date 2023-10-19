import { describe, expect, it } from "vitest";
import { safeTryMap } from "./safeTryMap";
import { JQNErr, JQNOk } from "./main";

describe("safeTryMap", () => {
  it("should return an error if the function throws", () => {
    const error = new Error("test");
    const expected = JQNErr(error);
    const fn = () => {
      throw error;
    };
    const ok = JQNOk(document.createElement("div"));
    const result = safeTryMap(fn, ok);
    expect(result).toEqual(expected);
  });
});
