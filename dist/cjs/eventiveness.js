'use strict';

/**
 * Effectively makes a template literal out of an existing template string and wraps it in a function 
 * which can be called multiple times to 'render' the template with the given arguments.
 * Additionally the built template is 'promise-aware' and will allow them to resolve to string values 
 * before interpolating them.
 * 
 * template = arender(templateString);
 * template(arg1, arg2, ...argRest);
 * .
 * @param {*} template 
 * @param {*} argNames 
 * @param {*} renderName 
 * @returns 
 */
function arender(template, argNames, renderName) {
    if (!renderName) renderName = 'P';
    if (!(argNames instanceof Array)) argNames = [argNames];
    if (argNames.includes(renderName)) {
        throw new Error(`Render name ${renderName} clashes with the name of one of the arguments. 
        Please change the rendername or the argument name to resolve this.`);
    }
    const mainFunction = Function(renderName, ...argNames, "return " + renderName + "`" + template + "`;");
    return (...args) => mainFunction(arender.promise, ...args);
}

/**
 * This is the template tag that enables the arender to wait for promises to resolve:
 * 
 * p`I will wait for this ${Promise.resolve("promise")}!!!`
 * 
 * @param {*} strings 
 * @param  {...any} expressions 
 * @returns 
 */
arender.promise = async function(strings, ...expressions) {
    const promisedExpressions = [];

    for (let [i, exp] of expressions.entries()) {
        if (exp instanceof Promise) promisedExpressions.push(exp);
        else promisedExpressions.push(Promise.resolve(exp));
    }
    
    const resolvedExpressions = await Promise.all(promisedExpressions);
    return resolvedExpressions.map((exp, i) => `${strings[i]}${exp}`).join('') + strings[resolvedExpressions.length];
};

/**
 * Resolves the tree to a node/fragment type and returns a cloner function containing a tree property pointing to 
 * the resolved tree. Depending on the usage scenario, the returned function may be called repeatedly or the tree 
 * property can simply be fetched. This obviates the need for manually caching the tree for later cloning, a potentially 
 * common use-case.
 *  
 * The tree can be a ready-made node or fragment, markup or a promise or function that 
 * resolves to or returns any of these. These will be processed until we get a de-facto tree that can be added to 
 * another node. 
 * 
 * @param {*} tree 
 * @param {*} createTemplate 
 * @returns 
 */
const apriori = async (tree,  createTemplate) => {
    while (typeof tree !== "string" && !(tree instanceof Node)) {
        if (tree instanceof Promise) tree = await tree;
        if (typeof tree === 'function') tree = tree();
    } 
    
    let result;
    let template;
    
    if (typeof tree === 'string' && createTemplate) {
        template = arender(tree);
        result = (...args) => apriori.tree(template(...args)).cloneNode();
    }
    else {
        if (typeof tree === 'string') tree = apriori.tree(tree);
        result = () => tree.cloneNode(true);
    }
    result.tree = tree;
    result.template = template;
    return result; 

};

apriori.tree = function(str) {
    const temp = document.createElement('template');
    temp.innerHTML = str;
    let result = temp.content;
    if (result.children.length === 1) result = result.children[0];
    return result;
};

/**
 * Returns a function which can processes and 'pop' all script tags within its 'root' argument. 
 * Ensures that the same CSSStyleSheet can be reused reused across trees instead of 
 * duplicated even when they have been created declaratively in the tree. This resolves the stated 
 * issue with adding styles to encapsulated elements when using shadow dom as described here; 
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM.
 * 
 * See the attached example (account.html and account.js) for how it is used in practice.
 * 
 */
function sophistry() {
    const context = {};
    const result = (root, replace) => runSophistry(root, context, replace);
    result.import = (link) => importStyle(link, context);
    result.set = (key, str) => setStyle(key, str, context);
    result.styles = context;
    return result;
}

function setStyle(key, str, context) {
    if (context.hasOwnProperty(key)) context[key].self.replaceSync(str);
    else {
        const st = document.createElement('style');
        st.innerText = str;
        context[key] = new sophistry.StyleSheet(st);
    }
    return context[key];
}

function runSophistry(root, context, replace) {
    const css = [];
    if (root instanceof HTMLStyleElement || (root instanceof HTMLLinkElement && root.getAttribute('rel') === 'stylesheet')) {
        const hash = root.getAttribute('o-name') || root.getAttribute('href') || sophistry.hash(root.textContent);
        if (context.hasOwnProperty(hash) && !replace && !root.hasAttribute('o-replace')) css.push(context[hash]);
        else {
            let st, st2;
            if (context.hasOwnProperty(hash) ) {
                st2 = context[hash];
                st = st2.self;
            } else {
                st = new CSSStyleSheet();
                st2 = new (sophistry.StyleSheet)(st);
                context[hash] = st2;
            }
            css.push(st2);
            if (root instanceof HTMLStyleElement) st.replaceSync(root.textContent);    // style element
            else fetch(root.getAttribute('href')).then(r => r.text()).then(t => st.replaceSync(t));   // link element
        }
    } else {
        let node = root.children[0];
        let node2;
        while (node) {
            node2 = node.nextElementSibling;
            css.push(...runSophistry(node, context, replace));
            if (node instanceof HTMLStyleElement || (root instanceof HTMLLinkElement && root.getAttribute('rel') === 'stylesheet')) root.removeChild(node);
            node = node2;
        }
    }
    return css;
}


const importStyle = function(link, context) {
    if (context.hasOwnProperty(link)) return context[link];
    else {
        const st = new CSSStyleSheet();
        const st2 = new (sophistry.StyleSheet)(st);
        context[link] = st2;
        fetch(link).then(r => r.text()).then(t => st.replaceSync(t));
        return st2;
    }
};

sophistry.hash = (str) => {
    let hash = 0;
    let chr;
    for (let i = 0, len = str.length; i < len; i++) {
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;    // convert to 32 bit int.
    }
    return hash;
};

sophistry.StyleSheet = class{
    constructor(self) {
        this.self = self;
    }
    /**
     * Adds the CSSStylesheets to the given documents.
     * @param  {...any} documents 
     */
    style(...documents) {
        for (let document of documents) {
            if (!document.adoptedStyleSheets?.includes(this.self)) document.adoptedStyleSheets = [...(document.adoptedStyleSheets || []), this.self];
        }
    };
    /**
     * Removes the stylesheets from the documents
     * @param {*} documents 
     */
    remove(...documents) {
        for (let document of documents) {
            if (document.adoptedStyleSheets.includes(this.self)) document.adoptedStyleSheets.splice(document.adoptedStyleSheets.indexOf(this.self));
        }
    }
};

/**
 * The simple abstraction has been missing in javascript. Eventivity allows one to simply wrap a javascript expression 
 * with a function call to make it reactive.
 * 
 * 1. call h[.eventname[.eventname]](function) to attach the function as a handler for the event
 * 2. call e[.eventname[.eventname]](statements...) to trigger the event after executing the statements.
 * 
 * See the aatached example for a basic usage scenario. Eventivity is a lot more powerful and and there are many 
 * opportunities for combining calls and customizing behavior. 
 * 
 * The most important thing to know about combining calls is thta you typically bind to higher level (super) events to 
 * handle all their events along with all sub events while you trigger lower level events to also trigger higher level 
 * ones. the reverse does not hold. that is higher level events wont trigger lower level ones. so think about events a bit like 
 * classes in OO programming.
 * 
 * When going from one chained call to the next, the arguments carry over to prevent duplication, but they can 
 * be overriden by supplying fresh values. Please pay attention to the special $ used for 'breaking' contexts to 
 * enable aliasing and reuse in complex scenarios. Avoid $ unless you understand its purpose well.
 * 
 * @returns 
 */
function eventivity() {
    const scope = {};
    
    scope.handlers = {};    // contains handlers for events and nested events
    scope.hc = 0;

    scope.handler = (options) => {
        const h = new (eventivity.HandlerContext)(scope);
        h.options = options;
        return h.proxy;
    };

    /**
     * Here we see that we can provide an alternative event class to support alternative dispatch mechanisms.
     * 
     * @param {*} clear 
     * @param {*} eventClass 
     * @returns 
     */
    scope.event = (options, eventClass) => {
        const e = new (eventClass || eventivity.EventContext)(scope);
        e.options = options;
        return e.proxy;
    };

    scope.owners = new Map();

    scope.object = new eventivity.Object(scope);  // raise events with objects
    return scope;
}

eventivity.Object = class {
    handlers = new WeakMap();
    hc = 0;
    constructor(scope) {
        this.scope = scope;
    }
    handler(fn, ...objects) {
        const deleters = [];
        let handlers, hc, deleter, owner;
        const owners = this.scope.owners;
        for (let object of objects) {
            this.hc++;
            hc = this.hc;
            if (!this.handlers.has(object)) this.handlers.set(object, {});
            handlers = this.handlers.get(object);
            handlers[hc] = fn;
            deleter = () => delete handlers[hc];
            if (fn instanceof Array && typeof fn[1] === 'object' && fn[1].hasOwnProperty('own')) {
                owner = fn[1].own;
                owner = owner?.prefix || owner;
                
                if (owner) {
                    if (!(owners.hasOwnProperty(owner))) owners.set(owner, []);
                    owners.get(owner).push(deleter);
                }
            }
            deleters.push(deleter);
        }
        return deleters;
    };
    event(args, ...objects) {
        let handlers, key, fn, ops, res, deleters, deleter;
        for (let object of objects) {
            if (!this.handlers.has(object)) continue;
            handlers = this.handlers.get(object);
            for ({key, fn} of Object.entries(handlers)) {
                if (fn instanceof Array) [fn, ops] = fn;
                else ops = null;
                res = fn({args, handler: object});
                if (ops?.esc && res === 'esc') break;
            }
            deleters = this.scope.owners.get(object) || [];
            for (deleter of deleters) deleter();
        }
    }
};

eventivity.Context = class {
    scope; options = {}; #createProxy; prefix = null; 
    constructor(scope) {
        this.scope = scope;
    };
    clone(overrides) {
        const other = new (this.constructor)(this.scope);
        Object.assign(other, this, overrides || {});
        if (other.prefix === null) other.prefix = '';
        return other;
    };
    /**
     * Catt the proxy without an argument to return 'this' for direct manipulation if neccesary.
     */
    get proxy() {
        if (!this.#createProxy) {
            const trap = this.trap;
            this.#createProxy = new Proxy((...args) => (args.length)? this.create(...args): this, trap);
        }
        return this.#createProxy;
    };
    create(...args) {

    };
    get trap() {
        const current = this;
        return {
            get(target, p) {
                if (current.prefix === null) {         // null delliberately different from '' here.
                    return current.clone().proxy[p];   // avoid dirtying current
                } else if (p === '$') {                // $ is special and concise syntax for cloning. so no events should have this name.
                    return current.clone().proxy;      // branch off to enable aliasing and reuse.
                } else {
                    current.prefix = (current.prefix? current.prefix + '.': '') + p;
                    current.update();
                    return current.proxy;
                }
            }
        }
    };
    update() {}
};

function deleter(handlers, eName, hName) {
    return () => delete handlers[eName][hName];
}


eventivity.HandlerContext = class extends eventivity.Context {
    eventName = ''; handlerFunction = null; handlerName;
    create(handlerFunction, options) {
        if (handlerFunction === 0) {
            // special convention to clear all handlers here:. no chaining after such call
            this.scope.handlers[this.eventName] = {};
            return;
        }
        if (options) this.options = Object.assign({}, this.options || {}, options);
        if (!handlerFunction) handlerFunction = this.handlerFunction;
        this.handlerFunction = handlerFunction;

        if (handlerFunction) {
            if (this.options?.raf) {    // request animation frame
                const handler2 = handlerFunction;
                handlerFunction = (arg) => window.requestAnimationFrame(timeStamp => handler2(arg, timeStamp));
            } else if (this.options?.st) {    // set timeout of 0 secs. have to be explicit with longer periods or setintervals
                const handler2 = handlerFunction;
                handlerFunction = (arg) => setTimeout((...timeoutArgs) => handler2(arg, ...timeoutArgs));
            }

            this.scope.hc++;
            const handlerName = this.options?.name || 'h' + this.scope.hc;
            this.handlerName = handlerName;
            let handler;
            if (this.options?.own) { // used for cleanup.
                let owner = this.options.own;
                if (typeof owner !== 'string') owner = this.eventName;  // eg true or 1
                else owner = owner.prefix || owner;
                const owners = this.scope.owners;
                if (!(owners.hasOwnProperty(owner))) owners.set(owner, []);
                owners.get(owner).push(deleter(this.scope.handlers, this.eventName, this.handlerName));
            }
            handler = [this, handlerFunction, handlerName];
            if (!(this.scope.handlers.hasOwnProperty(this.eventName))) this.scope.handlers[this.eventName] = {};
            this.scope.handlers[this.eventName][handlerName] = handler;         // handlers are named so that they can be easily found to remove with the node
        }
        let newHandlerContext;
        const current = this;
        return new Proxy((...otherOptions) => otherOptions.length? this.create(handlerFunction, otherOptions[0]): this, {   // result can simply be assigned and recalled to repeat setup for another node
            get(target, p){
                if (!newHandlerContext) {
                    // create a new handler context with only the event reset to empty string to support chaining.
                    newHandlerContext = current.clone({prefix: '', eventName: ''}).proxy;
                }
                return newHandlerContext[p];
            }
        });
    };
    /**
     * Deletes the last csreated handler when called. This is meant to help with 
     * cleanup if necessary.
     */
    delete() {
        if (this.eventName && this.handlerName) {
            delete this.scope.handlers[this.eventName][this.handlerName];
            this.eventName = '';
            delete this.handlerName;
        }
    };
    update() {
        this.eventName = this.prefix;
    };
};

eventivity.EventContext = class extends eventivity.Context {
    events = []; args = null;
    clone(overrides) {
        const clone = super.clone(overrides);
        clone.events = [];
        return clone;
    };
    handle(handler, handlersArg, event, eventHandlers) {
        // invokes a single handler. Another place to potentially override behavior.
        let [handlerContext, handlerFunction, handlerName] = handler;

        Object.assign(handlersArg, {handler: handlerContext});          // second set of properties of the handler argument
        const result = handlerFunction(handlersArg);        // the handler function itself is the final point of customisation
        if (this.options?.clear) delete eventHandlers[handlerName];
        return result;
    };
    dispatch(handlersArg) {
        // handlersArg.event === this in this case:
        const results = {};
        
        // default event dispatcher. can be overriden by applying alternate executor, same way scope can be applied.
        let eventHandlers, values, handler, result, deleters, deleter;
        for (let event of this.events) {
            eventHandlers = this.scope.handlers[event];
            if (!eventHandlers) continue;        
            values = Array.from(Object.values(eventHandlers));                // nothing here...
            for (handler of values) {
                result = this.handle(handler, handlersArg, event, eventHandlers);
                if ((result === 'esc') && this.options?.esc || handler[0].options?.esc) return;  // can be used for mutually exclusive handlers.
                else if (handler[0].options?.name) results[handler[0].options.name] = result;     // map handler function to its result; just in case we need both later
            }

            // cleanup handlers 'owned' by this event. nb: 'owned by' different from 'bound to'
            deleters = this.scope.owners.get(event) || [];
            for (deleter of deleters) deleter();
        }

        return results;
    };
    /**
     * Create an event to be dispatched.
     * 
     * @param {*} eventArgs 
     * @param {*} target 
     * @returns 
     */
    create(eventArgs, options, target) {
        const initialArgs = eventArgs;
        if (options) this.options = Object.assign({}, this.options || {}, options);

        if (!eventArgs.length) eventArgs = this.args || [];
        if (!(eventArgs instanceof Array)) eventArgs = [eventArgs];
        this.args = eventArgs;

        const handlersArg = {args: eventArgs, event: this, target};                // first set of properties of the handler argument
        const results = this.dispatch(handlersArg, options);               // so the dispatch method can be trivially overriden to support any custom handling

        let newEventContext;                                                       // resets the event to empty string to support chaining.
        const current = this;
        return new Proxy((...otherOptions) => otherOptions.length? this.create(eventArgs, otherOptions[0]): this, {   // result can simply be assigned and recalled to repeat setup for another node
            get(target, p){
                if (p === '$') return {args: initialArgs, results};                // can be used to make the event 'transparent', so that it returns its args. Remember cannot name an event $
                if (!newEventContext) newEventContext = current.clone({prefix: '', events: []}).proxy;
                return newEventContext[p];
            }
        });
    };
    update() {
        this.events.push(this.prefix);
    }
};

/**
 * This module exposes some DOM-enhancing functionss to facilitate 'safe' development of 
 * highly interactive applications. Many of the functions almost map 1-1 to the names of traditional element 
 * methods to make them more self-documenting. But also notice 'apply', 'onEnter' and 'Fragment' which are 
 * very important abstractions, as the included 'account' example demonstrates. 
 * 
 */

function selectRules(styleSheet, selectors, first) {
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
function querySelector(selectors, element) {
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
function querySelectorAll(selectors, element) {
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
 * @param {*} preventDefault 
 * @param {*} stopPropagation 
 */
function addEventListener(element, event, listener, preventDefault, stopPropagation) {
    let handling = false;

    element.addEventListener(event, async (...args) => {
        if (preventDefault) args[0].preventDefault();
        if (stopPropagation) args[0].stopPropagation();
        if (handling) return;
        handling = true;
        const result = listener(...args);
        if (result instanceof Promise) await result;
        handling = false;
    });
}

/**
 * Invoke a function when enter key is pressed in an element. This is like effectively creating a new event 
 * just for this popular key.
 * 
 * @param {*} element 
 * @param {*} fn 
 * @param {*} preventDefault 
 */
function onEnter(element, fn, preventDefault) {
    addEventListener(element, 'keyup', event => {
        if (event.key === 13) {
            if (preventDefault) event.preventDefault();
            return fn();
        }
    });
}

/**
 * Select the elements given by the object (map) keys and run the functions given by the object values over them.
 * Eleminates the many calls to querySelectorAll, which is very verbose.
 * 
 * @param {*} map 
 * @param {*} element 
 */
function apply(map, element) {
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
class Fragment {
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

class Actribute {
    registry = {};          // component instances are added here
    constructor(props, attrs) {
        this.props = props || {};
        this.attrs = attrs || 'c-';
    };
    register(name, component) {
        this.registry[name] = component;
    };
    process(node, props) {
        let compProps = [], comp, propKey, propVal, foundAllProps, processed = false;
        for (let {attr, value} of node.attributes) {
            if (attr.startsWith(this.compAttr)) {
                processed = true;
                comp = attr.substring(this.compAttr.length);
                if (this.registry.hasOwnProperty(comp))  {
                    compProps = [];
                    foundAllProps = true;
                    value = value.trim();
                    if (value) {
                        for (propKey of value.split(' ')) {
                            propKey = propKey.trim();
                            if (!propKey) continue;     // just too much space between prop names/keys.
                            propVal = props[propKey] || this.props[propKey];
                            if (propVal !== undefined) compProps.push(propVal);
                            else {
                                 foundAllProps = false;
                                 break;
                            }
                        }
                    }
                    if (foundAllProps) {
                        this.registry[comp](node, ...compProps);
                    } else {
                        console.error(`Some properties were not found for the component "${comp}."`);
                        break;    // break so we know where it stopped.
                    }
                } else {
                    console.error(`The component  "${comp}" was not found in the registry.`);
                    break;    // break so we know where the error occured (instead of printing the element).
                }
            } 
        }

        if (!processed) for (child of node.children) this.process(node, props);

    }
}


/**
 * This is a module that was designed to be a dropin replacement for extending built-in elements. It is supposed to be 
 * 1. more widely supported (safari does not support 'is' attribute)
 * 2. more concise and flexible :you can register and unregister components and you can attach multiple components at once..
 * 3. easier to pass down props in markup without looking ugly.
 * 
 * The usage pattern is similar to using 'is' attribute but here the attributes name the components and the values 
 * are the names of props to pass to them along with the element.
 * 
 * We have not created examples yet for this yet.
 * 
 * @param {*} props 
 * @param {*} attrs 
 * @returns 
 */
function actribute(props, attrs) {
    const act = new Actribute(props, attrs);
    const comp = (node, props) => act.process(node, props);
    return {comp, act};
}

exports.Fragment = Fragment;
exports.actribute = actribute;
exports.addEventListener = addEventListener;
exports.apply = apply;
exports.apriori = apriori;
exports.arender = arender;
exports.eventivity = eventivity;
exports.onEnter = onEnter;
exports.querySelector = querySelector;
exports.querySelectorAll = querySelectorAll;
exports.selectRules = selectRules;
exports.sophistry = sophistry;
