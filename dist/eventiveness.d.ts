/**
 * This module has been designed to be a drop-in replacement for extending built-in elements. It is supposed to be
 * 1. More widely supported. Safari does not support 'is' attribute.
 * 2. More concise and flexible. You can register and unregister components and you can attach multiple components to the same element..
 * 3. Easier to pass down props in markup without creating ugly markup.
 *
 * The attributes here name the components and the values
 * are the names of props to pass to them along with the element.
 *
 * @example
 * // initialize:
 * const fallbackProps = {prop1: 'Fallback', prop4: 'Last resort'};
 * const act = new Actribute(fallbackProps);
 *
 * // register components:
 * act.register('comp1', (node, prop1) => node.textContent = prop1);
 * act.register('comp2', (node, prop2) => node.style.left = prop2);
 *
 * // use in markup:
 * // &lt;section c-comp1="prop1"  c-comp2="prop2" &gt;
 * //       First section
 * // &lt;/section&gt;
 *
 * / process components:
 * act.process(document.body, {prop2: 1, prop3: 2});
 *
 * // unregister a component:
 * delete act.registry.comp2;
 */
declare class Actribute {
  /**
   * The object that holds all registered components. The keys are the
   * component names and the values are the component functions.
   */
  registry: {};
  /**
   * This object holds any fallback props which can be referenced
   * in the markup, in the values of component attributes. Property names
   * can be referenced similarly to CSS classes.
   */
  props: any;
  /**
   * This is the attribute prefix that denotes component specifiers in
   * markup. A component specifier is an attribute where the name (after
   * the prefix) refers to a component name (in the registery) and the
   * optional value is a space-separated list of property names.
   */
  attrPrefix: any;
  /**
   * Construct a new Actribute instance with the fallback props and
   * attribute prefix.
   *
   * When it is used to process markup, attributes with names starting
   * with attrPrefix are assumed to be component specifiers.
   * A component specifier is of the form [attrPrefix][componentName]="[propertyName] [propertyName] ..."
   *
   * When a component specifier is encountered, the component's function will be
   * invoked with the element and any specified properties as arguments.
   *
   * The attribute can be string (where at least 1 property name is specified),
   * or boolean (where no property is specified).
   *
   * The props object passed to this initializer behaves like a global
   * from which component props may be obtained if they are not found in
   * the props object passed to the `process` method.
   *
   * @param {any} props The value to assign to the props member.
   * @param {string} attrPrefix The value to assign to attrPrefix. Defaults to 'c-'
   * @constructor
   */
  constructor(props: any, attrPrefix: string);
  /**
   * Registers a function as a component bearing the given name.
   * The component can be referenced in processed markup using
   * the name.
   *
   * Returns the same actribute to support chaining.
   *
   * @param {string} name The component name
   * @param {Function} component The component function
   * @returns {Actribute}
   */
  register(name: string, component: Function): Actribute;
  /**
   * Recursively processes the node to identify and apply components.
   *
   * At elements where any components are encountered, the components
   * are called with the element and any specified props. The decendants
   * are not processed.
   *
   * At elements without a component, the descendants are processed
   * recursively.
   *
   * Returns the same actribute to support call chaining.
   *
   * @param {HTMLElement} element
   * @param {any} props
   * @returns {Actribute}
   */
  process(element: HTMLElement, props: any): Actribute;
}

/**
 * An object mapping string keys to values of type function or function[].
 * When used as the `applySec` in a call to `apply`, the keys are used as
 * selectors in calls to `element.querySelectorAll` (or
 * `ruleSelectorAll` if the element is an instance of HTMLStyleElement).
 * The functions will be mathced against the selected elements (or CSS rules)
 * at the same index.
 *
 * @example
 * myApplyMap = {
 *     span: (...spans) => doSomethingWith(spans);
 *     .btn: (...classedButtons) => doAnotherThingWith(classedButtons)
 * }
 */
interface ApplyMap {
  [key: string]: Function | Function[];
}
/**
 * Functions similarly to querySelectorAll, but for selecting style rules in
 * a CSS stylesheet object. All rules that start with any of the selectors are
 * selected.
 * @example
 * const firstSpanRule = ruleSelectorAll('span', document.getElementsByTagName('style')[0], true)[0];
 *
 * @param {string} selectors
 * @param {HTMLStyleElement} styleElement
 * @param {boolean} [firstOnly]
 * @returns {Array<CSSRule>}
 */
declare function ruleSelectorAll(
  selectors: string,
  styleElement: HTMLStyleElement,
  firstOnly?: boolean,
): Array<CSSRule>;
/**
 * Similar to querySelector in the same way ruleSelectorAll is similar to
 * querySelectorAll.
 * @example
 * const firstSpanRule = ruleSelector('span', document.getElementsByTagName('style')[0])
 *
 *
 * @param {string} selectors
 * @param {HTMLStyleElement} styleElement
 * @returns {CSSRule}
 */
declare function ruleSelector(
  selectors: string,
  styleElement: HTMLStyleElement,
): CSSRule;
/**
 * Return the first ancestor that matches the selector.
 * @example
 * const removeListener = (e) => {
 *     table.removeChild(component.beforeRemove(parentSelector(e.target, 'tr')));
 * };
 *
 * @param {Node} node
 * @param {string} selector
 * @returns {Element}
 */
declare function parentSelector(node: Node, selector: string): Element | null;
/**
 * Select the elements matching the keys in applyMap and run the functions given by the values over them.
 * This eliminates the many calls to querySelectorAll, which is quite verbose.
 *
 * Without the third argument (asComponents), all selected elements are
 * passed to the functions at once. With the argument given as a truthy value,
 * the elements are passed one by one, so that the behavior is almost like that
 * of web components.
 * @example
 * apply({
 *     main: main => {
 *         const newContent = [...range(101, 120)].map(i => `My index is  now ${i}`);
 *         const lastChildren = Array.from(main.children).map(c => c.lastElementChild);
 *         set(lastChildren,  {textContent: newContent});
 *     }
 * });
 *
 * @param {ApplyMap } applyMap
 * @param {HTMLElement} [containerElement]
 * @param {boolean|number} [asComponent]
 * @param {boolean|number} [firstOnly]
 */
declare function apply(
  applyMap: ApplyMap,
  containerElement?: HTMLElement,
  asComponent?: boolean | number,
  firstOnly?: boolean | number,
): void;
/**
 * Applies the given functions to the specified elements (or CSS rules).
 *
 * asComponent specifies whether the functions should be applied to each
 * element. If falsy/not specified, all the elements are passed to the functions
 * at once.
 * @example
 * applyTo(Array.from(document.body.children), (...bodyChildren) => console.log(bodyChildren.length));
 *
 * @param {(Element|CSSRule)[]} elements
 * @param {Function|Function[]} functions
 * @param {boolean|undefined} [asComponent]
 */
declare function applyTo(
  elements: (Element | CSSRule)[] | (Element | CSSRule),
  functions: Function | Function[],
  asComponent?: boolean | number | undefined,
): void;

/**
 * A template tag that will resolve only after all
 * interpolated promises have been resolved, finally returning the
 * intended string.
 *
 * @example
 * const t = tag`I will wait for this ${Promise.resolve("promise")}!!!`
 * // t === 'I will wait for this promise!!!'
 *
 * @param {Array<string>} strings
 * @param  {...any} expressions
 * @returns {Promise<string>}
 */
declare function tag(
  strings: Array<string>,
  ...expressions: any[]
): Promise<string>;
/**
 * Effectively creates a template literal out of an existing template string and wraps it in a function
 * which can be called multiple times to 'render' the template with the given arguments.
 *
 * @example
 * const t = await apriori.template('I will render this ${"guy"} immediately!!!')();
 * // t === 'I will render this guy immediately!!!'
 *
 * @param {string} templateStr the template string
 * @param {Array<string>} argNames tThe names of the parameters of the returned function (which can be 'seen' inside the template string)
 * @returns {(...any): string}
 */
declare function template(
  templateStr: string,
  argNames?: Array<string>,
): (...any: any[]) => string;
/**
 * Similar to template but the built template is also 'promise-aware' and will allow them to resolve to string values
 * before interpolating them.
 *
 * @example
 * const t = await apriori.asyncTemplate('I will wait for this ${Promise.resolve("promise")}!!!')();
 * // t === 'I will wait for this promise!!!'
 *
 *
 * @param {string} templateStr the template string
 * @param {Array<string>} argNames The names of the parameters of the returned function (which can be 'seen' inside the template string)
 * @param {string} tagName Supply a tagName argument to change the name of the tag function inside the template string if
 * the default name (T) is present in  argNames.
 * @returns {(...any): string}
 */
declare function asyncTemplate(
  templateStr: string,
  argNames: Array<string>,
  tagName: string,
): (...any: any[]) => string;
/**
 * The return value of a call to arrayTemplate.
 */
interface ArrayTemplate {
  (arr: Iterable<any>, ...args: any[]): string;
}
/**
 * Similar to template, but will render an iterable (such as array) of items together instead
 * of rendering each item individually. It improves efficiency in these scenarios.
 *
 * @example
 * const t = arrayTemplate('I will render this ${it}/${other} immediately!!!', ['other'], 'it', ' & ')([1, 2, 3, 4, 5], '(shared)');
 * // t === 'I will render this 1/(shared) immediately!!! & I will render this 2/(shared) immediately!!! & I will render this 3/(shared) immediately!!! & I will render this 4/(shared) immediately!!! & I will render this 5/(shared) immediately!!!'
 *
 * @param {string} templateStr The template string
 * @param {Array<string>} argNames The names of the parameters (after the iterable) of the returned function (which can be 'seen' inside the template string)
 * @param {string} itemName The name of the current item of the iterable as seen inside the template string. Defaults
 * to 'item'
 * @param {string} itemSep The text that goes between the rendered items.
 * Defaults to the empty string.
 * @returns {ArrayTemplate}
 */
declare function arrayTemplate(
  templateStr: string,
  argNames: Array<string>,
  itemName: string,
  itemSep: string,
): ArrayTemplate;
/**
 * Async equivalent of arrayTemplate. The async template tag ('T' by default)
 * is applied to the template string. Use this when there are promises
 * among the arguents that will be passed to the returned function.
 *
 * @example
 * let t = asyncArrayTemplate('I will async render this ${item}')([1, 2, 3, 4, 5].map(i => Promise.resolve(i)));
 * console.log(t instanceof Promise);   // true
 * t = await t
 * // t === 'I will async render this 1I will async render this 2I will async render this 3I will async render this 4I will async render this 5'
 *
 * @param {string} templateStr The template string
 * @param {Array<string>} argNames The names of the parameters (after the iterable) of the returned function (which can be 'seen' inside the template string)
 * @param {string} itemName The name of the current item of the iterable as seen inside the template string. Defaults
 * to 'item'
 * @param {string} itemSep The text that goes between the rendered items.
 * Defaults to the empty string.
 * @param {string} tagName Supply a tagName argument to change the name of the tag function inside the template string if
 * the default name (T) is present in  argNames.
 * @returns {ArrayTemplate}
 */
declare function asyncArrayTemplate(
  templateStr: string,
  argNames: Array<string>,
  itemName: string,
  itemSep: string,
  tagName: string,
): ArrayTemplate;
/**
 * Fetches text (typically markup) from the url. This is only a shorthand
 * for using `fetch`.
 *
 * @example
 * const markup = await apriori.get('./apriori/get.html')
 *
 *
 * @param {string} url  The url to pass to `fetch`
 * @param {boolean} [suppressErrors] Whether to return the empty string if an error occurs.
 * @param {RequestInit} [init]  The `init` argument for `fetch`
 * @returns {Promise<string>}
 */
declare function get(
  url: string,
  suppressErrors?: boolean,
  init?: RequestInit,
): Promise<string>;
/**
 * Shorthand for creating a DocumentFragment from markup. If the
 * fragment has only one child, the child is returned instead.
 * So this is also a shorthand for creating single elements.
 *
 * @example
 * const frag1 = apriori.createFragment(`
 *    <p>Para 1</p>
 *    <p>Para 2</p>
 *`)
 * // <p>Para 1</p><p>Para 2</p>
 *
 * @param {string} markup The `outerHTML` of what to create
 * @returns {Node}
 */
declare const createFragment: (markup: string) => Node;

/**
 * A function used to insert a new node using a target node.
 *
 * @example
 * myInserter = (node, target) => target.append(node);
 */
interface Inserter {
  (node: Node, target: Node): void;
}
/**
 * Insert the values before the elements.
 *
 * @example
 * // Insert a span into all the children of the first main element:
 * import {apply} from 'appliance'
 * import {insert} from 'domitory'
 * const span = document.createElement('span');
 * apply({main: main => insert(main.children, main.children.map(() => span.cloneNode())))})
 *
 *
 * @param {Iterable<Node>} elements The target nodes.
 * @param {Iterable<Node>} values The new nodes to insert.
 * @param {Inserter} [insertWith] The insertion function
 */
declare function insert(
  elements: Iterator<Node> | Node[],
  values: Iterable<Node>,
  insertWith?: Inserter,
): void;
/**
 * Default inserters for use with `insert`
 */
declare const inserter: {
  /**
   * Inserts the node before the target using `insertBefore`
   * @param node
   * @param target
   */
  before(node: Node, target: Node): void;
  /**
   * Append the node to the target using `appendChild`
   * @param node
   * @param target
   */
  append(node: Node, target: Node): void;
};
/**
 * Creates a DocumentRange between the start and end elements
 *
 * @example
 *
 *
 * @param {Node} start The first element in the range
 * @param {Node} end  The last element in the range
 * @returns {Range}
 */
declare function createRange(start: Node, end: Node): Range;
/**
 * Map of string keys to any[] values. The keys name properties
 * (or attributes when they start with _) and the values are arrays
 * matched against selected or specified elements .
 *
 * As an example, we can target 3 buttons to set their
 * textContents to corresponding values using the following SetOnMap
 * (as the values object in a call to `setOn`):
 * @example
 * {
 *     textContent: ['btn 1', 'btn 2', 'btn 3']
 * },
 */
interface SetMap {
  [key: string]: any[];
}
/**
 * Set specified properties and/or attributes on the specified elements.
 * Please do not pass the same 'generator' multiple times in values. First
 * convert them to arrays.
 *
 * @example
 * // Shuffle the class attributes of all the children of the first main element:
 * import {apply} from 'appliance'
 * import {set} from 'domitory'
 * import {uItems} from 'generational'
 * apply({main: main => set(main.children, {_class: uItems(main.children.map(c => c.className))})})
 *
 *
 * @param {(Element|CSSRule)[]} elements
 * @param {SetMap} values
 */
declare function set(
  elements: Iterable<Element | CSSRule>,
  values: SetMap,
): void;
/**
 * Correctly replace the specified nodes with corresponding values.
 *
 * @example
 * // Safely shuffle all the children of the first main element:
 * import {apply} from 'appliance'
 * import {update} from 'domitory'
 * import {uItems} from 'generational'
 * apply({main: main => update(main.children, uItems(main.children))})
 *
 * @param {Iterable<Node>} elements The nodes to replace.
 * @param {Iterable<Node>} values The replacement nodes.
 */
declare function update(elements: Iterable<Node>, values: Iterable<Node>): void;
/**
 * Remove the elements from their parent nodes.
 *
 * @example
 * // Remove all elements with the 'rem' class
 * apply({'.rem': (...elements) => remove(elements)});
 *
 * @param {Iterable<Node>} elements
 */
declare function remove(elements: Iterable<Node>): void;

/**
 * Base class for EventListener and MatchListener
 */
declare class Listener {
  listener: EventListenerOrEventListenerObject;
  listen(
    eventName: string,
    elements: EventTarget[],
    options?: boolean | AddEventListenerOptions,
  ): void;
  remove(eventName: string, ...elements: EventTarget[]): void;
}
/**
 * Object mapping element mapping strings to event handler functions.
 * The matching strings (keys) are used to match event targets to trigger
 * the invocation of their associated handler functions.
 *
 */
interface Matcher {
  [key: string]: Function | Function[];
}
/**
 * Composes a listener function from the functions in ops. ops may be
 * a single function or an array of functions.
 *
 * The functions are called in the same order when handling events. They
 * will receive as erguments the event object and a run context.
 *
 * The run context can be passed as the second argument to this function
 * (or it will default to the global runContext). The context can be used
 * for communication and it also maintains a running property which will
 * ensure that no 2 handlers using it will run concurrently (providing the
 * API is respected).
 *
 * The API is as follows:
 * If a handler function returns a promise, it is assumed to still be running
 * until the promise resolves or rejects. Neither the handler nor any other
 * handlers using the same run context can start until it stops running.
 *
 * Individual op functions can also terminate event handling by returning the
 * END symbol.
 *
 * @example
 * input.onkeyup = eventListener([onEnter, () => login(input.value), preventDefault]);
 * apply({
 *     '#loginButton': button => {
 *         button.onclick = eventListener(() => login(input.value));
 *     }
 * }, form);
 *
 *
 * @param {Function[] | Function} ops The function or functions making up the handler
 * @param {any} [runContext] The optional run context.
 * @returns
 */
declare function eventListener(
  ops: Function[] | Function,
  runContext?: any,
): (e: any) => Promise<any>;
/**
 * Similar to eventListener function but has methods for attaching
 * and removing itself from multiple elements at the same time.
 *
 * This gives the listener a 'personality' and promotes its reuse
 * (good practice).
 */
declare class EventListener extends Listener {
  constructor(ops: Function[] | Function, runContext?: any);
}
/**
 * Symbol which will terminate event handling if returned by any of
 * the functions in the ops chain of an event handler created with
 * `eventHandler`.
 *
 * @example
 * const keyEventBreaker = (e: KeyboardEvent) => (e.key !== key)? END: '';
 */
declare const END: unique symbol;
/**
 * Takes advantage of event bubbling to listen for events on descendant
 * elements to reduce the number of listeners to create.
 *
 * @example
 * table.onclick = matchListener({
 *     'a.lbl': e => select(e.target.parentNode.parentNode),
 *     'span.remove': [removeListener, preventDefault, stopPropagation]
 * }, true);
 *
 * @param {Matcher} matcher Map of event target matcher to associated handler function
 * @param {boolean} wrapListeners Whether to werap the matcher functions with `eventListener`.
 */
declare function matchListener(
  matcher: Matcher,
  wrapListeners?: boolean,
): (e: { target: MatchEventTarget }) => any;
/**
 * An event target which may have a 'matches' method.
 */
interface MatchEventTarget extends EventTarget {
  matches?: (arg0: string) => any;
}
/**
 * Similar to matchListener function but has methods for attaching
 * and removing itself from multiple elements at the same time.
 *
 * This gives the listener a 'personality' and promotes its reuse
 * (good practice).
 */
declare class MatchListener extends Listener {
  constructor(matcher: Matcher, wrapListeners?: boolean);
}
/**
 * Simply calls `stopPropagation` on the event. Useful for creating one-liner
 * event handlers.
 *
 * @param e The event object
 * @returns
 */
declare const stopPropagation: (e: { stopPropagation: () => any }) => any;
/**
 * Simply calls `preventDefault` on the event. Useful for creating one-liner
 * event handlers.
 *
 * @param e The event object
 * @returns
 */
declare const preventDefault: (e: { preventDefault: () => any }) => any;
/**
 * This returns a function which will stop an event handler run (typically for keyup,
 * keydown etc) from continuing if it has not been triggered by the specified key.
 * The returned functions are to be placed before the main handler functions in the `ops`
 * array passed to `eventListener`.
 *
 * @example
 *
 *
 * @returns {Function}
 */
declare const onKey: (key: string) => (e: KeyboardEvent) => "" | typeof END;
declare const keys: {
  enter: string;
};
/**
 * This will stop a key(up or down...) event handler run from continuing if
 * it has not been triggered by the enter key.
 */
declare const onEnter: (e: KeyboardEvent) => "" | typeof END;

/**
 * Fast and 'costless' range function for javascript based on generators.
 *
 * @example
 * const arr1000 = [...range(0, 1000)];
 * // creates an array with 1000 items counting from 0 to 999.
 *
 * @param {number} start
 * @param {number} [end]
 * @param {number} [step]
 */
declare function range(
  start: number,
  end?: number,
  step?: number,
): Generator<number, void, unknown>;
/**
 * Returns a generator which iterates over the subset of the
 * 'arrayLike' object that matches the provided index.
 *
 * @example
 * const tenth = items(arr1000, range(0, 1000, 10));
 * // selects every 10th item in the array.
 *
 * @param {any} arrayLike
 * @param {Iterable<any>} index
 */
declare function items(
  arrayLike: any,
  index: Iterable<number>,
): Generator<any, void, unknown>;
/**
 * Call to get the length of an object. The object must either
 * have a length property of be previously passed in a call to`setLength`.
 *
 * @example
 * const myRange = range(12);
 * setLength(myRange, 12);
 * getLength(myRange);   // returns 12.
 *
 * @param {any} iter
 */
declare function getLength(iter: any): number;
/**
 * Stores the 'fake' lenghts of iterables passed in calls to `setLength`.
 * Can also be modified manually.
 */
declare const iterLengths: WeakMap<any, number>;
/**
 * Attaches a 'fake' length to an object (likely iterable or iterator)
 * which does not have a length property, so that it can work well with
 * functions that use `getLength`.
 *
 * @example
 * const myRange = range(12);
 * setLength(myRange, 12);
 * getLength(myRange);   // returns 12.
 *
 * @param {any} iter
 */
declare function setLength(iter: any, length: number): any;
/**
 * Returns an iterator over the items of all the input iterators, starting from
 * the zero index to the maximum index of the first argument. The
 * effective length of the iterator is the multiple of the length of thr smallest
 * iterator and the number of iterators (number of args).
 *
 * Can be used to join arrays in a way no supported by `concat`, `push`, etc.
 * To pass an array as an iterator, call array.values().
 *
 * @example
 * for (let i of flat(range(10, range(15)))) {
 *      console.log(i);    // 0, 0, 1, 1, 2, 2, .... till smallest iterable (10) is exhausted.
 * }
 *
 * @param  {...Iterator<any>} args
 */
declare function flat(...args: [Iterator<any>]): Generator<any, void, unknown>;
/**
 * Get an iterator over the next 'count' items of the given iterator.
 *
 * @example
 * next([1, 4, 3, 6, 7, 4, 5].values(), 3);  // 1, 4, 3
 *
 * @param iter
 * @param count
 */
declare function next(
  iter: Iterator<any>,
  count: number,
): Generator<any, void, unknown>;
/**
 * Returns an unordered/random iterator over the input array..
 *
 * @example
 * const unOrdered = uItems([1, 2, 3, 4]);  // [4, 1, 3, 2]
 *
 * @param {any[]} array
 */
declare function uItems(array: any[]): Generator<any[], void, unknown>;

/**
 * Creates a One object which transmits a call, method dispatch, property
 * get or set applied to the 'one' object to the 'many' objects.
 *
 * The recursive arg is used to ensure that getting properties always
 * wraps the array results with `one` also.
 *
 * Items in the context arg will be passed to all delegated calls as the
 * final arguments. An empty array is created if not specified.
 *
 * Sometimes, you may want to pass an array of 1 or more objects to provide a shared
 * context for the items in many. Other times you may prefer no context because
 * it may affect the behavior of the calls, since the functions or methods may
 * be accepting optional arguments there. Passing your own arrays enable you to
 * set the behavior however you like (by emptying or populating the array).
 *
 * @example
 * const component = one([data(), view(table)], false, [{}]);
 * component.create([10000]);
 *
 * @param {any[]} many An array of objects to delegat actios to
 * @param {boolean} [recursive] Whether to return One instances in `get` calls
 * @param {any[]} [context] Shared context for the 'many' functions or object methods
 * @returns
 */
declare function one(many: any[], recursive?: boolean, context?: any[]): One;
/**
 * Return a 'pure' One from a proxied One.
 *
 * @param one
 * @returns
 */
declare function unWrap(one: One): any;
/**
 * A recursive One constructor. Used internally for recursive 'One's.
 */
interface OneConstructor {
  (
    many: any[],
    recursive?: boolean,
    context?: any[],
    ctor?: OneConstructor,
  ): One;
}
/**
 * An object which delegates actions on it to other objects
 *
 * @example
 *
 *
 */
declare class One {
  /**
   * The many objects this One delegates to.
   */
  many: any[];
  /**
   * Whether this One will return other 'One's in calls to `get`.
   */
  recursive?: boolean;
  /**
   * The constructor function used for creating new 'One's in calls to `get`.
   */
  ctor?: OneConstructor;
  /**
   * The context shared by the many functions or methods of the objects in many.
   * They all receive its items as their last set of arguments.
   */
  context?: any[];
  /**
   * Creates a new One instance for propagating operations to all the items
   * in many.
   *
   * @param {any[]} many The many objects or functions this One will delegate to.
   * @param {boolean} [recursive] Whether to wrap the arrays returned by `get` with another One.
   * @param {any[]} context An optional shared context to be passed to all propagated method or function calls.
   * This is an array of objects passed as the final arguments in calls. Empty array by default.
   * @param {OneConstructor} [ctor] The constructor used to create the `get` Ones. This parameter is used internally;
   * no need to supply an argument.
   *
   * @example
   * const loginYes = new One([username => profileView(username)]);
   * loginYes.call([[username]]);
   *
   * @constructor
   */
  constructor(
    many: any[],
    recursive?: boolean,
    context?: any[],
    ctor?: OneConstructor,
  );
  /**
   * Gets corresponding properties from all the objects in many. If this is
   * a recursive One and forceArray is falsy, the array result will be
   * used as the 'many' argument in a call to this.ctor and the created One
   * is returned instead of the array.
   *
   * @example
   * const o = new One([{a: 1}, {a: 2}])
   * o.get('a');  // [1, 2]
   *
   * @param {string | number | symbol | null} [prop]
   * @param {boolean} [forceArray]
   * @returns {any[]|One}
   */
  get(
    prop?: string | number | symbol | null,
    forceArray?: boolean,
  ): any[] | One;
  /**
   * Sets corresponding property values in the objects in many.
   * 'values' are treated similarly to 'args' in the call method.
   *
   * @example
   * const o = new One([{a: 1}, {a: 2}])
   * o.set('a', [4, 7]);
   *
   * @param {string | number | symbol | null} [prop]
   * @param {any[]} [values]
   */
  set(prop?: string | number | symbol | null, values?: any[]): any;
  /**
   * Delete the property from all objects in many.
   *
   * @example
   * const o = new One([{a: 1}, {a: 2}])
   * o.delete('a');
   *
   * @param {string | number | symbol} prop
   */
  delete(prop: string | number | symbol): void;
  /**
   * Calls all the items in many (if method is not specified) or their
   * corresponding methods (if  method is specified). All the calls will
   * receive any items in `this.context` as their final arguments to
   * enable communication.
   *
   * args can be specified as follows:
   * `[[a1, a2], [a1, a2], [a1, a2]]`
   *
   * If `this.many` has 3 items, they will receive their own args. If there
   * are more items in `this.many`, they will all get the last provided args array
   * (here the one passed to the third item).
   *
   * The `one` function wraps created 'One's with a proxy to allow methods
   * to be called directly on them. Assuming we want to pass the same args
   * as above to such a method, the call will look like:
   *
   * `object.method([a1, a2], [a1, a2], [a1, a2])`.
   *
   * There is no need to wrap with the outer array in such cases.
   *
   * Call returns an array containing the return values of the individual
   * calls to many items.
   *
   * @example
   * const loginYes = new One([username => profileView(username)]);
   * loginYes.call([[username]]);
   *
   * @param {any[]} args The function or method arguments
   * @param {string | number | symbol} [method] The name of a method to call.
   * A function call is assumed if not specified.
   * @param {boolean} [ignoreContext] Set this to a truthy value to prevent the
   * shared context from getting passed in this call.
   *
   * @returns {any[]}
   */
  call(
    args?: any[],
    method?: string | number | symbol,
    ignoreContext?: boolean,
  ): any[];
}
/**
 * Pass this as the first arg in a One call to prevent it from injecting
 * a context. This is an alternative to passing a third argument to the
 * `call` function
 */
declare const ignoreContext: unique symbol;

/**
 * An instance of Sophistrory can be used to obtain and cache CSS Stylesheets
 * which can be shared by multiple DOM elements.
 *
 * @example
 *
 */
declare class Sophistry {
  /**
   * An cache for created SophistryStyleSheets.
   */
  context: {};
  /**
   * Processes and 'pops' all style tags within the root.
   * Ensures that the same CSSStyleSheet can be reused across document trees (maindocument
   * and shadow roots) instead of duplicated even when they have been
   * created declaratively.
   *
   * If replace is truthy, any cached stylesheets with the same name (or hash) as a
   * styleshhet within the root will be replaced (reactively).
   *
   * This resolves the stated issue with declaratively adding encapsulated
   * styles to elements when using shadow DOM as described here;
   * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM.
   *
   * @example
   * const element = apriori.createFragment(apriori.get('markup.html'));
   * const styles = mySophistry.process(element);
   * document.body.append(element);
   * for (let style of styles) style.style(element, document.body.firstElementChild);
   *
   * @param {Element} root
   * @param {boolean} [replace]
   * @returns {StyleSheet[]}
   */
  process(root: Element, replace?: boolean): StyleSheet[];
  /**
   * Import a stylesheet defined in an external CSS file. Optionally
   * specify a name for the imported style in the Scophystry context (cache).
   * The name will default to the portion of the link before the first
   * apostrophe...
   *
   * @example
   * const style = mySophistry.import('style.css');
   *
   * @param {string} link
   * @param {string} [name]
   * @returns {StyleSheet}
   */
  import(link: string, name?: string): StyleSheet;
  /**
   * Replaces the text of an existing stylesheet. This is reactive.
   *
   * @example
   * mySophistry.set('style.css', await apriori.get('new-style.css'));  // override everything.
   *
   * @param {string} name
   * @param {string} css
   * @returns
   */
  set(name: string, css: string): StyleSheet;
}
/**
 * This is used to wrap a CSSStyleSheet to provide convenient methods
 * for styling and 'unstyling' elements.
 *
 * @example
 * const sss = new SophistryStyleSheet(css);
 *
 */
declare class StyleSheet {
  /**
   * The wrapped CSS stylesheet.
   */
  css: CSSStyleSheet;
  /**
   * Creates a new Sophistry stylesheet.
   *
   * @param {CSSStyleSheet} cssStyleSheet
   * @constructor
   */
  constructor(cssStyleSheet: any);
  /**
   * Styles the elements with the wrapped CSSStylesheets.
   * If an element is not the document or a shadow root, an open shadow
   * root is created for it and then the rrot is styled.
   *
   * @example
   * sss.style(...Array.from(document.body.children))
   *
   * @param  {...T} elements
   */
  style<T extends Element | DocumentFragment>(...elements: T[]): void;
  /**
   * Removes the wrapped stylesheet from the elements (or their shadow roots).
   *
   * @example
   * sss.remove(...Array.from(document.body.children))
   *
   *
   * @param {...T} elements
   */
  remove<T extends Element | DocumentFragment>(...elements: T[]): void;
}

export {
  Actribute,
  type ApplyMap,
  type ArrayTemplate,
  END,
  EventListener,
  type Inserter,
  Listener,
  type MatchEventTarget,
  MatchListener,
  type Matcher,
  One,
  type OneConstructor,
  type SetMap,
  Sophistry,
  StyleSheet,
  apply,
  applyTo,
  arrayTemplate,
  asyncArrayTemplate,
  asyncTemplate,
  createFragment,
  createRange,
  eventListener,
  flat,
  get,
  getLength,
  ignoreContext,
  insert,
  inserter,
  items,
  iterLengths,
  keys,
  matchListener,
  next,
  onEnter,
  onKey,
  one,
  parentSelector,
  preventDefault,
  range,
  remove,
  ruleSelector,
  ruleSelectorAll,
  set,
  setLength,
  stopPropagation,
  tag,
  template,
  uItems,
  unWrap,
  update,
};
