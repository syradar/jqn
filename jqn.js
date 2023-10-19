class NoneImpl {
  constructor() {
    this.none = true;
    this.some = false;
  }

  map() {
    return this;
  }
}

function None() {
  return new NoneImpl();
}

class SomeImpl {
  constructor(value) {
    this.none = false;
    this.some = true;
    this.value = value;
  }

  map(fn) {
    return new Some(fn(this.value));
  }
}

function Some(value) {
  return new SomeImpl(value);
}

function isNullish(value) {
  return value === null || value === undefined;
}

class JQNSomeImpl {
  constructor(selector, context) {
    this.selector = selector;
    this.context = context;
    this.option = Option.fromNullable(context.querySelector(selector));
  }

  map(fn) {
    return new JQNOptionImpl(this.selector, this.context).option.map(fn);
  }

  on(event, fn) {
    return this.map((el) => {
      el.addEventListener(event, fn);
      return el;
    });
  }

  click(fn) {
    return this.on("click", fn);
  }
}

class JQNNoneImpl {
  constructor(selector, context) {
    this.selector = selector;
    this.context = context;
    this.option = None();
  }

  map(fn) {
    return this;
  }

  on(event, fn) {
    return this;
  }

  click(fn) {
    return this;
  }
}

function JQNSome(selector, context) {
  return new JQNSomeImpl(selector, context);
}

function JQNNone(selector, context) {
  return new JQNNoneImpl(selector, context);
}

class OkImpl {
  constructor(value) {
    this.ok = true;
    this.err = false;
    this.value = value;
  }

  map(fn) {
    return new Ok(fn(this.value));
  }
}

function Ok(value) {
  return new OkImpl(value);
}

class ErrImpl {
  constructor(error) {
    this.ok = false;
    this.err = true;
    this.error = error;
  }

  map() {
    return this;
  }
}

function Err(error) {
  return new ErrImpl(error);
}

const Option = Object.freeze({
  None,
  Some,
  fromNullable: (nullableValue) => {
    if (isNullish(nullableValue)) {
      return None();
    }

    return Some(nullableValue);
  },
});

const Result = Object.freeze({
  Ok,
  Err,
  fromNullable: (nullableValue) => {
    if (isNullish(nullableValue)) {
      return Err(nullableValue);
    }

    return Ok(nullableValue);
  },
  toOption: (result) => {
    if (result.ok) {
      return Option(result.value);
    }

    return None();
  },
});

function isElement(value) {
  return value instanceof Element;
}

function isString(value) {
  return typeof value === "string";
}

function isFunction(value) {
  return typeof value === "function";
}

function isObject(value) {
  return typeof value === "object";
}

const jqnSubscriptionCache = new WeakMap();

class JQNOkImpl {
  #subscriptions = [];

  constructor(value) {
    this.ok = true;
    this.err = false;
    /**
     * @type {Element}
     */
    this.value = value;
  }

  map(fn) {
    return new JQNOkImpl(fn(this.value));
  }

  on(event, fn) {
    return this.map((el) => {
      el.addEventListener(event, fn);
      return el;
    });
  }

  /**
   * @returns {JQNOk}
   */
  subscribe(event, fn, optionalSelector = null) {
    const target = this.value.querySelector(optionalSelector) ?? this.value;
    const cache = jqnSubscriptionCache.get(target) ?? new Map();
    const eventCache = cache.get(event) ?? new Set();

    console.log("event fn optionalTarget", event, fn, optionalSelector);

    if (eventCache.has(fn)) {
      return this;
    }

    eventCache.add(fn);

    cache.set(event, eventCache);
    jqnSubscriptionCache.set(target, cache);
    console.log("target", { ...target });

    target.addEventListener(event, fn);

    return this;
  }

  unsubscribe(event, fn, optionalSelector = null) {
    const target = this.value.querySelector(optionalSelector) ?? this.value;
    const cache = jqnSubscriptionCache.get(target) ?? new Map();
    const eventCache = cache.get(event) ?? new Set();

    if (!eventCache.has(fn)) {
      return this;
    }

    eventCache.delete(fn);

    cache.set(event, eventCache);
    jqnSubscriptionCache.set(target, cache);

    target.removeEventListener(event, fn);

    return this;
  }
}

class JQNErrImpl {
  constructor(error) {
    this.ok = false;
    this.err = true;
    this.error = error;
  }

  map() {
    return this;
  }

  on() {
    return this;
  }

  subscribe() {
    return this;
  }

  unsubscribe() {
    return this;
  }
}

function JQNOk(value) {
  return new JQNOkImpl(value);
}

function JQNErr(error) {
  return new JQNErrImpl(error);
}

const JQNResult = Object.freeze({
  Ok: JQNOk,
  Err: JQNErr,
  fromNullable: (nullableValue) => {
    if (isNullish(nullableValue)) {
      return JQNErr(nullableValue);
    }

    return JQNOk(nullableValue);
  },
});

/**
 *
 * @param {string | Element} selector
 * @param {Element} context
 * @returns {JQNOk | JQNErr}
 */
function jqn(selector = "body", context = document) {
  if (isElement(selector)) {
    return JQNOk(selector);
  }

  if (isString(selector)) {
    console.log("JQN", selector, context);
    return JQNResult.fromNullable(context.querySelector(selector));
  }

  return JQNResult.Err(selector);
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
