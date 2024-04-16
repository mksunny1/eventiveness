
/**
 * This module exposes some DOM-enhancing functionss to facilitate 'safe' development of 
 * highly interactive applications. Many of the functions almost map 1-1 to the names of traditional element 
 * methods to make them more self-documenting. But also notice 'apply', 'onEnter' and 'Fragment' which are 
 * very important abstractions, as the included 'account' example demonstrates. 
 * 
 */

export function selectRules(styleSheet, selectors, first) {
    const result = [];
    for (let rule of styleSheet.cssRules) {
        if (rule.cssText.startsWith(selectors)) {
            if (first) return rule;
            else result.push(rule);
        }
    }
    return result;
}

/**
 * Equivalent to element.querySelector but can also select style rules within CSS stylesheets.
 * We simply select styles that begin with the selector.
 * 
 * @param {*} selectors 
 * @param {*} element 
 * @returns 
 */
export function querySelector(selectors, element) {
    if (!element) element = document;
    if (element instanceof CSSStyleSheet) return selectRules(element, selectors, true);
    else return element.querySelector(selectors);
}

/**
 * Equivalent to querySelectorAll just like querySelector.
 * 
 * @param {*} selectors 
 * @param {*} element 
 * @returns 
 */
export function querySelectorAll(selectors, element) {
    if (!element) element = document;
    if (element instanceof CSSStyleSheet) return selectRules(element, selectors);
    else return element.querySelectorAll(selectors);
}


export function weakMap(keys, values) {
    const length = keys.length;
    const result = new WeakMap();
    for (let i = 0; i < length; i++) result.set(keys[i], values[i]);
    return result;
}

export async function eventListener(e, listener, options, handling) {
    if (handling[0]) return;
    handling[0] = true;
    let mixin;

    if (options?.hasOwnProperty('before')) for  (mixin of options.before) mixin(e);
    let result = listener(e);
    if (options?.hasOwnProperty('after')) for (mixin of options.after) mixin(e);
    
    if (result instanceof Promise) result = await result;

    if (options?.hasOwnProperty('wait')) setTimeout(() => handling[0] = false, options.wait);
    else handling[0] = false;

    return result;
}

function attachEventListener(elements, listener, options, attachment) {
    let handling = [false];
    const pListener = async (e) => eventListener(e, listener, options, handling);

    if (!(elements instanceof Array)) elements = [elements];
    for (let element of elements) attachment(element, pListener);
}

/**
 * Ensures that the listener concludes before it can run again. This is most relevant for long-running 
 * listeners that only conclude after promises are resolved. the function passed here should return 
 * promises that must be awaited before the event handling concludes.
 * 
 * This supports passing extra contextual information to the handler 
 * via the 'extras' property of the options object. This feature can help 
 * to reduce the number of similar handlers that have to be created. See the 
 * 'benchmark' example.
 * 
 * Options also enables things like preventDefault and stopPropagation to 
 * be 'pre-configured' rather than called explicitly.
 * 
 * @param {*} elements 
 * @param {*} event 
 * @param {*} listener 
 * @param {*} options 
 */
export function addEventListener(elements, event, listener, options) {
    return attachEventListener(elements, listener, options, 
        (element, listener) => element.addEventListener(event, listener));
}

/**
 * Similar to addEventListener but sets the listener as the only one instead 
 * of appending it to a list of listeners.
 * 
 * @param {*} elements 
 * @param {*} event 
 * @param {*} listener 
 * @param {*} options 
 * @returns 
 */
export function setEventListener(elements, event, listener, options) {
    return attachEventListener(elements, listener, options, 
        (element, listener) => element['on' + event] = listener);
}

/**
 * Takes advantage of event bubbling to listen for events on descendant 
 * elements to reduce the number of listeners to create.
 * 
 * @param {*} event 
 * @param {*} map 
 * @param {*} element 
 */
export function matchEventListener(event, map, element) {
    if (!element) element = document.body;
    let options;
    const handling = [false];
    element.addEventListener(event, (e) => {
        // console.log(e.target);
        for (let [selector, listener] of Object.entries(map)) {
            if (listener instanceof Array) [listener, options] = listener;
            else options = null;
            if (e.target.matches(selector)) {
                return eventListener(e, listener, options, handling);
            }
        }
    });
}

/**
 * Return the first ancestor that matches the selector.
 * 
 * @param {*} element 
 * @param {*} selector 
 * @returns 
 */
export function parentSelector(element, selector) {
    let parent = element.parentNode;
    while (parent && !(parent.matches(selector))) parent = parent.parentNode;
    return parent;
}

export const stopPropagation = e => e.stopPropagation();
export const preventDefault = e => e.preventDefault();


/**
 * Invoke a function when enter key is pressed in an element. This is like effectively creating a new event 
 * just for this popular key.
 * 
 * @param {*} element 
 * @param {*} fn 
 * @param {*} options 
 */
export function onEnter(element, fn, options) {
    addEventListener(element, 'keyup', event => {
        if (event.key === 13) return fn();
    }, options);
}

/**
 * Select the elements given by the object (map) keys and run the functions given by the object values over them.
 * Eleminates the many calls to querySelectorAll, which is very verbose.
 * 
 * @param {*} map 
 * @param {*} element 
 */
export function apply(map, element) {
    let elements, fn, e;
    for (let [selectors, fns] of Object.entries(map)) {
        elements = querySelectorAll(selectors, element);
        if (!(fns instanceof Array)) fns = [fns];
        for (e of elements) for (fn of fns) fn(e);
    }
}

/**
 * Similar to 'apply' but a more efficient implementation
 * 
 * @param {*} map 
 * @param {*} element 
 */
export function applyAll(map, element) {
    let elements, fn, e;
    for (let [selectors, fns] of Object.entries(map)) {
        elements = Array.from(querySelectorAll(selectors, element));
        if (!(fns instanceof Array)) fns = [fns];
        for (fn of fns) fn(elements);
    }
}

/**
 * Wraps a document fragment so that it does not lose its children when they are moved from one parent to another.
 */
export class Fragment {
    constructor(documentFragment) {
        this.childNodes = Array.from(documentFragment.childNodes);
    }
    get() {
        const fragment = new DocumentFragment();
        fragment.append(...this.childNodes);
        return fragment;
    }
    remove() {
        for (let node of this.childNodes) node.parentNode?.removeChild(node);
    }
}
