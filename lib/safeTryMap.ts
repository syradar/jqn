import { JQNErr, JQNOk } from "./main";

export function safeTryMap(
  fn: (e: Element) => Element,
  ok: JQNOk
): JQNOk | JQNErr {
  try {
    return JQNOk(fn(ok.value));
  } catch (error) {
    if (error instanceof Error) {
      return JQNErr(error);
    }

    const message = JSON.stringify(error);

    return JQNErr(new Error(message));
  }
}
