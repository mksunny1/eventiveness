
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

/**
 * Ensures that the listener concludes before it can run again. This is most relevant for long-running 
 * listeners that only conclude after promises are resolved. the function passed here should return 
 * promises that must be awaited before the event handling concludes.
 * 
 * @param {*} element 
 * @param {*} event 
 * @param {*} listener 
 */
export function addEventListener(element, event, listener) {
    let handling = false;

    element.addEventListener(event, async (...args) => {
        if (handling) return;
        handling = true;
        const result = listener(...args);
        if (result instanceof Promise) await result;
        handling = false;
    })
}

/**
 * Invoke a function when enter key is pressed in an element. This is like effectively creating a new event 
 * just for this popular key.
 * 
 * @param {*} element 
 * @param {*} fn 
 * @param {*} preventDefault 
 */
export function onEnter(element, fn, preventDefault) {
    addEventListener(element, 'keyup', event => {
        if (event.key === 13) {
            if (preventDefault) event.preventDefault();
            return fn();
        }
    })
}

/**
 * Select the elements given by the object (map) keys and run the functions given by the object values over them.
 * Eleminates the many calls to querySelectorAll, which is very verbose.
 * 
 * @param {*} map 
 * @param {*} element 
 */
export function apply(map, element) {
    // console.log(element);
    // for (let e of element?.childNodes || []) console.log(e);

    let elements, fn, e;
    for (let [selectors, fns] of Object.entries(map)) {
        elements = querySelectorAll(selectors, element);
        if (!(fns instanceof Array)) fns = [fns];
        for (e of elements) {
            // console.log(e);
            for (fn of fns) fn(e);
        }
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