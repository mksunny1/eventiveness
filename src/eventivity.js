/**
 * A re-write of the eventivity module for more clarity and 
 * performance.
 */

function handle(handler, handlerFunction, ...objects) {
    let objectHandlers;
    for (let object of objects) {
        objectHandlers = handler.scope.handlers.get(object);
        if (!objectHandlers) {
            objectHandlers = new Map();
            handler.scope.handlers.set(object, objectHandlers);
        }
        objectHandlers.set(handler.name, handlerFunction);
    }
    return handler;
}

function deleteHandler(objectHandlers, handler, object) {
    objectHandlers.delete(handler.name);
    if (!objectHandlers.size) handler.scope.handlers.delete(object);
}

export class Handler {
    constructor(scope, handlerFunction) {
        this.scope = scope;
        this.reset(handlerFunction);
    };
    /**
     * Effectively like creating a new handler, but will save us the cost.
     * @param {*} handlerFunction 
     */
    reset(handlerFunction) {
        this.function = handlerFunction;
        this.once = null;
        this.name = 'handler' + (this.scope.nHandlers++);
    }
    /**
     * The handler will be executed when any of the objects are used to 
     * trigger an event. It is then delete. To handle repeatedly, call the 
     * handleAll method.
     * 
     * @param {*} objects 
     * @returns 
     */
    handle(...objects) {
        if (!this.once) this.once = (args, object, objectHandlers, name) => {
            setTimeout(() => deleteHandler(objectHandlers, this, object));
            return this.function(args, object, objectHandlers, name); 
        };
        return handle(this, this.once, ...objects);
    };
    /**
     * Invoke the handler everytime any of the objects are used to trigger 
     * an event.
     * @param  {...any} objects 
     */
    handleAll(...objects) {
        return handle(this, this.function, ...objects);
    };
    /**
     * Explicitly removes the handler from the events.
     * @param  {...any} objects 
     */
    remove(...objects) {
        for (let object of objects) {
            objectHandlers = this.scope.handlers.get(object);
            deleteHandler(objectHandlers, this, object);
        }
    }
}

export class Event {
    constructor(scope, statementResults) {
        this.scope = scope;
        this.results = statementResults;
    };
    /**
     * Raise the events and delete the handlers.
     * 
     * @param  {...any} objects 
     */
    raise(...objects) {
        setTimeout(() => {
            for (let object of objects) this.scope.handlers.delete(object);
        });
        return this.raiseAll(...objects);
    };
    /**
     * Raise the event without deleting the handlers.
     * 
     * @param  {...any} objects 
     */
    raiseAll(...objects) {
        let objectHandlers, name, handler;
        for (let object of objects) {
            objectHandlers = this.scope.handlers.get(object);
            if (!objectHandlers) continue;
            for ([name, handler] of objectHandlers.entries()) handler(this.results, object, objectHandlers, name);
        }
        return this.statementResults;
    }
}

/**
 * Sets up and returns a new scope shared by event handlers 
 * and triggers.
 * 
 * @returns 
 */
export function eventivity() {
    const scope = {
        handlers: new Map(), owners: new Map(), nHandlers: 0,
        handler: (handlerFunction) => (new Handler(scope, handlerFunction)),
        event: (...statementResults) => (new Event(scope, statementResults))
    };
    return scope;
}

