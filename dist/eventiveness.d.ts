/**
 * This is a module that was designed to be a dropin replacement for extending built-in elements. It is supposed to be
 * 1. more widely supported (safari does not support 'is' attribute)
 * 2. more concise and flexible :you can register and unregister components and you can attach multiple components to the same element..
 * 3. easier to pass down props in markup without looking ugly.
 *
 * The usage pattern is similar to using 'is' attribute but here the attributes name the components and the values
 * are the names of props to pass to them along with the element.
 *
 * We have not created examples yet for this.
 *
 */
declare class Actribute {
    registry: {};
    props: any;
    compAttr: any;
    /**
     * Construct a new Actribute instance with the fallback props and
     * attribute prefix.
     *
     * When it is used to process markup, attributes with names starting
     * with compAttr ('c-' by default) are assumed to be component specifiers.
     * A component specifier is of the form [compAttr][componentName]="[propertyName] [propertyName] ..."
     *
     * When a component specifier is encountered, the component (registerd with the
     * 'register' method) will be invoked with the element and any specified
     * properties as arguments.
     *
     * The props object passed to this initializer behave like a global
     * from which component props may be obtained if they are not found in
     * the props object passed to the 'process' method.
     *
     * @param {any} props
     * @param {string} compAttrPrefix
     * @constructor
     */
    constructor(props: any, compAttrPrefix: string);
    /**
     * Registers a function as a component bearing the given name.
     * The components can thus be referenced in processed markup using
     * the name.
     *
     * Returns the same actribute to support chaining.
     *
     * @param {string} name
     * @param {Function} component
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

interface AnyObject {
    [key: string]: any;
}
type Func = (...args: any[]) => any;
interface FunctionMap {
    [key: string]: Func | Func[];
}
interface ArrayMap {
    [key: string]: any[];
}
/**
 * Functions similarly to querySelectorAll, but for selecting style rules in
 * a CSS stylesheet object. All rules that start with any of the selectors are
 * selected.
 *
 * @param {string} selectors
 * @param {HTMLStyleElement} styleElement
 * @param {boolean} onlyFirst
 * @returns {Array<CSSRule>}
 */
declare function ruleSelectorAll(selectors: string, styleElement: HTMLStyleElement, onlyFirst?: boolean): Array<CSSRule>;
/**
 * Similar to querySelector in the same way ruleSelectorAll is similar to
 * querySelectorAll.
 *
 * @param {string} selectors
 * @param {HTMLStyleElement} styleElement
 * @returns {CSSRule}
 */
declare function ruleSelector(selectors: string, styleElement: HTMLStyleElement): CSSRule;
/**
 * Return the first ancestor that matches the selector.
 *
 * @param {Node} node
 * @param {string} selector
 * @returns {Element}
 */
declare function parentSelector(node: Node, selector: string): Element | null;
/**
 * Select the elements given by the object (map) keys and run the functions given by the object values over them.
 * Eleminates the many calls to querySelectorAll, which is quite verbose.
 *
 * Without the third argument (asComponents), all selected elements are
 * passed to the functions at once. With the argument given as a truthy value,
 * the elements are passed one by one, so that the behavior is almost like that
 * of web components.
 *
 * @param {FunctionMap } functions
 * @param {HTMLElement} element
 * @param {boolean} asComponent
 */
declare function apply(functions: FunctionMap, element?: HTMLElement, asComponent?: boolean): void;
/**
 * A function to select and set specific properties and/or attributes on
 * elements. The steps are as follows
 *
 * 1. Use the selectors to select the appropriate elements.
 *
 * 2. the selected elements are filtered by the index (in for...of loop)
 *
 * 3. the values is an object mapping the name of the property or attribute
 * to set to values lists which must contain all the indices.
 *
 * 4. the specified properties and/or attributes of the elements
 * are set to the values at the same indices.
 *
 * In the values map, property names are written normally but attribute
 * names start with underscore (_).
 *
 * @param {string} selectors
 * @param {number[]|[number[], number[]]} index
 * @param {ArrayMap} values
 * @param {HTMLElement} element
 */
declare function set(selectors: string, index: number[] | [number[], number[]], values: ArrayMap, element: HTMLElement): void;
/**
 * This method is important to prevent boilerplate in code where
 * we need to replace certain elements in a tree with other elements
 * within the same tree, such as in 'swap' scenarios.
 *
 * Replacing an element A with another element B will move B to the location
 * of A and remove A. If we wanted to set B to another value, such as A, we
 * need to store its initial location before the move. We also need to use
 * a different method, such as insertBefore to insert the new element in
 * B's formar location. This generally requires a lot more attention than
 * simply calling a function to manage all that, especially when there are
 * many 'Bs' to move.
 *
 * This functions makes it very easy to replace multiple elements in a tree
 * at the same time without any mental overhead.
 *
 * @param {Array<Node>} values The replacement nodes.
 * @param {HTMLElement} element Element containing all the elements to replace. Defaults to document.body.
 * @param {number[]|[number[], number[]]} index The children at these indices are replaced with the corresponding values. Can be either index or [index, valueIndex]. Defaults to all indices in values.
 * @param {string} selectors Selectors for what to replace. Defaults to element children
 */
declare function replace(values: Array<Node>, element: HTMLElement, index: number[] | [number[], number[]], selectors: string): void;

/**
 * This is a template tag that will resolve only after all
 * interpolated promises have been resolved, finally returning the
 * intended string.
 *
 * tag`I will wait for this ${Promise.resolve("promise")}!!!`
 *
 * @param {Array<string>} strings
 * @param  {...any} expressions
 * @returns {Promise<string>}
 */
declare function tag(strings: Array<string>, ...expressions: any[]): Promise<string>;
/**
 * Effectively creates a template literal out of an existing template string and wraps it in a function
 * which can be called multiple times to 'render' the template with the given arguments.
 *
 * @param {string} templateStr the template string
 * @param {Array<string>} argNames the names of the arguments inside the template literal
 * @returns {(...any): string}
 */
declare function template(templateStr: string, argNames?: Array<string>): ((...any: any[]) => string);
/**
 * Similar to apriori.template but the built template is also 'promise-aware' and will allow them to resolve to string values
 * before interpolating them. Supply a tagName argument to change
 * the name of the tag in cases where the default (A) is the name of
 * an argument (present in  argNames).
 *
 * @param {string} templateStr the template string
 * @param {Array<string>} argNames the names of the arguments inside the template literal
 * @param {string} tagName
 * @returns {(...any): string}
 */
declare function asyncTemplate(templateStr: string, argNames: Array<string>, tagName: string): ((...any: any[]) => string);
interface ArrayTemplate {
    (arr: any[], ...args: any[]): string;
}
/**
 * Similar to template, but will render an iterable (such as array) of items together instead
 * of rendering each item individually. This improves efficiency because
 * we only call one function for all the items instead of one function
 * per array item.
 *
 * The function always receives the iterable as the first argument followed
 * by the args named by argNames.
 *
 * itemName is the name of each item of the iterable in the template. Defaults
 * to 'item'. itemSep is the text that goes between the rendered item
 * texts. Defaults to the empty string.
 *
 * @param {string} templateStr
 * @param {Array<string>} argNames
 * @param {string} itemName
 * @param {string} itemSep
 * @returns {ArrayTemplate}
 */
declare function arrayTemplate(templateStr: string, argNames: Array<string>, itemName: string, itemSep: string): ArrayTemplate;
/**
 * Async equivalent of arrayTemplate. The async template tag ('T' by default)
 * is applied to the template strings. Use this when there are promises to
 * resolve.
 *
 * @param {string} templateStr
 * @param {Array<string>} argNames
 * @param {string} itemName
 * @param {string} itemSep
 * @param {string} tagName
 * @returns {ArrayTemplate}
 */
declare function asyncArrayTemplate(templateStr: string, argNames: Array<string>, itemName: string, itemSep: string, tagName: string): ArrayTemplate;
/**
 * Fetches text (typically markup) from the url. Just a shorthand.
 *
 * @param {string} url
 * @param {RequestInit} init
 * @returns {Promise<string>}
 */
declare function get(url: string, init: RequestInit): Promise<string>;
/**
 * Shorthand for creating a DocumentFragment from markup. If the
 * fragment has only one child, the child is returned instead.
 * So this is also a shorthand for creating single elements.
 *
 * @param {string} markup
 * @returns {Node}
 */
declare const createFragment: (markup: string) => Node;
/**
 * Returns a DocumentRange between the start and end elements
 *
 * @param {Node} start The first element in the range
 * @param {Node} end  The last element in the range
 * @returns {Range}
 */
declare function createRange(start: Node, end: Node): Range;
/**
 * Wraps a document fragment so that it does not lose its children when
 * they are moved from one parent to another.
 */
declare class LastingFragment {
    nodes: Node[];
    /**
     * Creates a new LastingFragment instance with all the input nodes
     * as children. If any of the nodes is a document fragment, all its
     * children will be added as children of the new LastingFragment.
     *
     * @param  {...Node} nodes
     * @constructor
     */
    constructor(...nodes: Node[]);
    /**
     * Dynamically builds and returns a document fragment from the children
     * of this fragment.
     * @returns {DocumentFragment}
     */
    get(): DocumentFragment;
    /**
     * Removes the children of this fragment from their current parent
     */
    remove(): void;
}

interface FunctionMap2 {
    [key: string]: Function | Function[];
}
/**
 * Composes a listener from the functions in ops which will prevent
 * itself from running multiple times concurrently. This is particularly
 * useful when promises need to be awaited.
 *
 * The function returns an object containing the created listerner and
 * the monitor for whether it is running
 *
 * Note that the ops can communicate with their return value and
 * second args.
 *
 * @param {Function[] | Function} ops
 * @param {any} runContext
 * @returns
 */
declare function eventListener(ops: Function[] | Function, runContext?: any): (e: any) => Promise<any>;
declare const END: unique symbol;
/**
 * Takes advantage of event bubbling to listen for events on descendant
 * elements to reduce the number of listeners to create.
 *
 * @param {FunctionMap2} map
 * @param {boolean} wrapListeners
 */
declare function matchEventListener(map: FunctionMap2, wrapListeners?: boolean): (e: {
    target: {
        matches: (arg0: string) => any;
    };
}) => any;
declare const stopPropagation: (e: {
    stopPropagation: () => any;
}) => any;
declare const preventDefault: (e: {
    preventDefault: () => any;
}) => any;
/**
 * This will stop an event (typically keyup, keydown etc) from continuing
 * if it has not been triggered by the specified key.
 *
 * @returns
 */
declare const onKey: (key: string) => (e: KeyboardEvent) => "" | typeof END;
declare const keys: {
    enter: string;
};
/**
 * This will stop a key(up or down...) event from continuing if
 * it has not been triggered by the enter key.
 */
declare const onEnter: (e: KeyboardEvent) => "" | typeof END;

/**
 * Fast and 'costless' range function for javascript based on generators.
 *
 * @param {number} start
 * @param {number} end
 * @param {number} step
 */
declare function range(start: number, end: number | undefined, step: number | undefined): Generator<number, void, unknown>;
/**
 * Returns an iterator over the items of all the arrays, starting from
 * the zero index to the maximum index of the first argument. The
 * effective length of the iterator is the sum of the length of the args.
 *
 * Can be used to join arrays in a way no supported by concat, pusg, etc.
 *
 * @param  {...any} args
 */
declare function flat(...args: any[]): Generator<any, void, unknown>;

/**
 * Creates a One object which transmits a call, method dispatch, property
 * get or set applied to the 'one' object to the 'many' objects.
 *
 * The recursive arg is used to ensure that getting properties always
 * wraps the array results with One also.
 *
 * The context arg will be passed to all delegated calls. A new object
 * is created if it is not provided.
 *
 * @param {any[]} many
 * @param {boolean} recursive
 * @param {any} context
 * @returns
 */
declare function one(many: any[], recursive?: boolean, context?: any): One;
/**
 * Return a 'pure' One from a proxied One.
 *
 * @param one
 * @returns
 */
declare function unWrap(one: One): any;
interface OneCtor {
    (many: any[], recursive?: boolean, context?: any, ctor?: OneCtor): One;
}
declare class One {
    many: any[];
    recursive?: boolean;
    ctor?: OneCtor;
    context?: any;
    /**
     * Creates a new One instance for propagating operations to all the items
     * in many. Property get, set , delete and method call operations are
     * propagated. Each of these operations has a corresponding method in One.
     *
     * @param {any[]} many
     * @param {boolean} [recursive] Whether to wrap the arrays returned by get with another One.
     * @param {any} context An optional shared context to be passed to all propagated method calls
     * @param {OneCtor} [ctor] The constructor used to create the recursively created Ones.This parameter is used internally;
     * no need to supply an argument.
     * @constructor
     */
    constructor(many: any[], recursive?: boolean, context?: any, ctor?: OneCtor);
    /**
     * Gets corresponding properties from all the objects in many
     *
     * @param {string | number | symbol | null} [prop]
     * @param {boolean} [forceArray]
     * @returns {any[]|One}
     */
    get(prop?: string | number | symbol | null, forceArray?: boolean): any[] | One;
    /**
     * Sets corresponding property values in the objects in many.
     * 'values' are treated similarly to 'args' in the call method.
     *
     * @param {string | number | symbol | null} [prop]
     * @param {any[]} [values]
     */
    set(prop?: string | number | symbol | null, values?: any[]): any;
    /**
     * Delete the property from all objects in many.
     *
     * @param {string | number | symbol} prop
     */
    delete(prop: string | number | symbol): void;
    /**
     * Calls all the items in many (if method is not specified) or the
     * corresponding methods in many (if  method is specified).
     *
     * args will be (or be coerced into) an array of argument for
     * corresponding items in many:
     *
     * args = [many1Args, many2Args, many3Args, ...].
     *
     * When One is created with the one function, the outer array can
     * be omitted in the calls since there is no explicit need to
     * secify a method in this case (it is infered by the wrapping proxy)
     *
     *
     * @param {any[]} args
     * @param {string | number | symbol} [method]
     * @returns {any[]}
     */
    call(args?: any[], method?: string | number | symbol): any[];
}

declare class Sophistry {
    context: {};
    /**
     * Processes and 'pops' all style tags within the passed root.
     * Ensures that the same CSSStyleSheet can be reused across document trees (maindocument
     * and shadow roots) instead of duplicated even when they have been
     * created declaratively in the trees.
     *
     * If replace is given, any cached stylesheets with the same name as a
     * styleshhet within the root will be replaced (reactively).
     *
     * This resolves the stated issue with adding encapsulated styles to
     * elements when using shadow dom as described here;
     * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM.
     *
     * @param {T} root
     * @param {boolean} [replace]
     * @returns {SophistryStyleSheet[]}
     */
    process<T extends Element>(root: T, replace?: boolean): SophistryStyleSheet[];
    /**
     * Import a stylesheet defined in an external CSS file.
     *
     * @param {string} link
     * @param {boolean} [replace]
     * @returns {SophistryStyleSheet}
     */
    import(link: string, replace?: boolean): SophistryStyleSheet;
    /**
     *
     * @param {string} name
     * @param {string} css
     * @returns
     */
    set(name: string, css: string): SophistryStyleSheet;
}
declare class SophistryStyleSheet {
    css: CSSStyleSheet;
    /**
     * Creates a new CSS stylesheet which contains convenient methods
     * for styling and 'unstyling' elements.
     *
     * @param {CSSStyleSheet} cssStyleSheet
     * @constructor
     */
    constructor(cssStyleSheet: any);
    /**
     * Adds the CSSStylesheets to the given documents.
     * @param  {...any} documents
     */
    style<T extends (Document | ShadowRoot)>(...documents: T[]): void;
    /**
     * Removes the stylesheets from the documents
     * @param {*} documents
     */
    remove<T extends (Document | ShadowRoot)>(...documents: T[]): void;
}
/**
 * Wraps a CSSStyleSheet with a SophistryStyleSheet
 * @param {CSSStyleSheet} cssStyleSheet
 * @returns
 */
declare function wrap(cssStyleSheet: CSSStyleSheet): SophistryStyleSheet;

export { Actribute, type AnyObject, type ArrayMap, type ArrayTemplate, END, type Func, type FunctionMap, type FunctionMap2, LastingFragment, One, type OneCtor, Sophistry, SophistryStyleSheet, apply, arrayTemplate, asyncArrayTemplate, asyncTemplate, createFragment, createRange, eventListener, flat, get, keys, matchEventListener, onEnter, onKey, one, parentSelector, preventDefault, range, replace, ruleSelector, ruleSelectorAll, set, stopPropagation, tag, template, unWrap, wrap };
