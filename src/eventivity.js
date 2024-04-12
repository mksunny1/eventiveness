
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
export function eventivity() {
    const scope = {};
    
    scope.handlers = {};    // contains handlers for events and nested events
    scope.hc = 0;

    scope.handler = (options) => {
        const h = new (eventivity.HandlerContext)(scope)
        h.options = options
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
        e.options = options
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
            deleters.push(deleter)
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
}

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
}

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
        this.args = eventArgs

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
