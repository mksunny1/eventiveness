

export interface FunctionMap2 {
    [key: string]: Function | Function[];
}

const defaultRunContext = {running:false};

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
export function eventListener(ops: Function[] | Function, runContext?: any) {
    if (!runContext) runContext = defaultRunContext;
    if (!(ops instanceof Array)) ops = [ops];
    let op: Function;
    async function listener(e: any) {
        if (runContext.running) return;
        runContext.running = true;
        let result: any;
        for (op of (ops as Function[])) {
            result = await op(e, runContext);
            if (result === END) break;
        }
        runContext.running = false;
        return result;
    }
    return listener;
}

export const END = Symbol();

/**
 * Takes advantage of event bubbling to listen for events on descendant 
 * elements to reduce the number of listeners to create.
 * 
 * @param {FunctionMap2} map 
 * @param {boolean} wrapListeners 
 */
export function matchEventListener(map: FunctionMap2, wrapListeners?: boolean) {
    const listenerMap: {[key: string]: Function} = {};
    for (let [selector, args] of Object.entries(map)) {
        if (wrapListeners || args instanceof Array) {
            let args2;
            if (!(args instanceof Array) || typeof args.at(-1) === 'function') { args2 = [args, null] }
            listenerMap[selector] = args2? eventListener(args2[0], args2[1]): eventListener(args[0], args[1]);
        } else listenerMap[selector] = args;
    }
    function listener(e: { target: { matches: (arg0: string) => any; }; }) {
        for (let [selector, fn] of Object.entries(listenerMap)) {
            if (e.target.matches(selector)) return fn(e);
        }
    }
    return listener;
}

export const stopPropagation = (e: { stopPropagation: () => any; }) => e.stopPropagation();
export const preventDefault = (e: { preventDefault: () => any; }) => e.preventDefault();

/**
 * This will stop an event (typically keyup, keydown etc) from continuing 
 * if it has not been triggered by the specified key.
 * 
 * @returns 
 */
export const onKey = (key: string) => (e: KeyboardEvent) => (e.key !== key)? END: '';
export const keys = {enter: 'Enter'};

/**
 * This will stop a key(up or down...) event from continuing if 
 * it has not been triggered by the enter key.
 */
export const onEnter = onKey(keys.enter);
