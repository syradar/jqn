import { EventCache } from "./eventCache.js";
import { safeTryMap } from "./safeTryMap.js";
import { isElement, isString } from "./typeGuard.js";
import { isNullish } from "./typeGuard.js";

const jqnSubscriptionCache = new EventCache();

class JQNOkImpl {
  readonly ok = true;
  readonly err = false;
  readonly value: Element;
  constructor(value: Element) {
    this.ok = true;
    this.err = false;
    /**
     * @type {Element}
     */
    this.value = value;
  }

  map<U extends Element>(fn: (el: Element) => U): JQNOk {
    return safeTryMap(fn, this) as JQNOk;
  }

  on(event: string, fn: EventListener): JQNOk {
    return this.map((el) => {
      el.addEventListener(event, fn);
      return el;
    });
  }

  /**
   * @returns {JQNOk}
   */
  subscribe(
    event: string,
    fn: EventListener,
    optionalSelector: string | null = null
  ) {
    const target =
      this.value.querySelector(optionalSelector ?? "") ?? this.value;
    jqnSubscriptionCache.add(target, event, fn);
    target.addEventListener(event, fn);
    return this;
  }

  unsubscribe(
    event: string,
    fn: EventListener,
    optionalSelector: string | null = null
  ) {
    const target =
      this.value.querySelector(optionalSelector ?? "") ?? this.value;
    jqnSubscriptionCache.delete(target, event, fn);
    target.removeEventListener(event, fn);
    return this;
  }
}

class JQNErrImpl {
  readonly ok = false;
  readonly err = true;
  readonly error: Error;

  constructor(error: Error) {
    this.error = error;
  }

  map(): this {
    return this;
  }

  on(): this {
    return this;
  }

  subscribe(): this {
    return this;
  }

  unsubscribe(): this {
    return this;
  }
}

export type JQNOk = JQNOkImpl;
export type JQNErr = JQNErrImpl;

export function JQNOk(value: Element) {
  return new JQNOkImpl(value);
}

export function JQNErr(error: Error) {
  return new JQNErrImpl(error);
}

const JQNResult = Object.freeze({
  Ok: JQNOk,
  Err: JQNErr,
  fromNullable: (nullableValue: Element | null | undefined): JQNOk | JQNErr => {
    if (isNullish(nullableValue)) {
      const error = new Error(`${nullableValue} is null or undefined`);
      return JQNErr(error);
    }

    return JQNOk(nullableValue as Element);
  },
});

/**
 *
 * @param {string | Element} selector
 * @param {Element} context
 * @returns {JQNOk | JQNErr}
 */
function jqn(
  selector: string | Element = "body",
  context = document
): JQNOk | JQNErr {
  if (isElement(selector)) {
    return JQNOk(selector);
  }

  if (isString(selector)) {
    return JQNResult.fromNullable(context.querySelector(selector as string));
  }

  return JQNErr(new Error(`Invalid selector: ${selector}`));
}

// test

jqn(".js-cta-1")
  .on("click", () => console.log("clicked"))
  .map((el) => {
    console.log(el);
    return el;
  });

const cta2Handler = () => console.log("clicked js-cta-2");

jqn().subscribe("click", cta2Handler, ".js-cta-2");
jqn().unsubscribe("click", cta2Handler, ".js-cta-2");
jqn().subscribe("click", cta2Handler, ".js-cta-2");
