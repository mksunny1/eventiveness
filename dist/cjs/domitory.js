'use strict';

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
 * @param {*} ops 
 * @param {*} runContext 
 * @returns 
 */
function eventListener(ops, runContext) {
    if (!runContext) runContext = defaultRunContext;
    if (!(ops instanceof Array)) ops = [ops];
    let op;
    async function listener(e) {
        if (runContext.running) return;
        runContext.running = true;
        let result;
        for (op of ops) {
            result = await op(e, result);
            if (result === end) break;
        }
        runContext.running = false;
        return result;
    }
    return listener;
}

const end = Symbol();

/**
 * Takes advantage of event bubbling to listen for events on descendant 
 * elements to reduce the number of listeners to create.
 * 
 * @param {*} map 
 * @param {*} wrapListeners 
 */
function matchEventListener(map, wrapListeners) {
    const listenerMap = {};
    for (let [selector, args] of Object.entries(map)) {
        if (wrapListeners || args instanceof Array) {
            if (!(args instanceof Array) || typeof args.at(-1) === 'function') args = [args];
            listenerMap[selector] = eventListener(...args);
        } else listenerMap[selector] = args;
    }
    function listener(e) {
        for (let [selector, fn] of Object.entries(listenerMap)) {
            if (e.target.matches(selector)) return fn(e);
        }
    }
    return listener;
}

const stopPropagation = e => e.stopPropagation();
const preventDefault = e => e.preventDefault();

/**
 * This will stop an event (typically keyup, keydown etc) from continuing 
 * if it has not been triggered by the specified key.
 * 
 * @param {*} e 
 * @returns 
 */
const onKey = key => e => (e.key !== key)? end: '';
const keys = {enter: 13};

/**
 * This will stop a key(up or down...) event from continuing if 
 * it has not been triggered by the enter key.
 * @param {*} e 
 * @returns 
 */
const onEnter = onKey(keys.enter);

exports.end = end;
exports.eventListener = eventListener;
exports.keys = keys;
exports.matchEventListener = matchEventListener;
exports.onEnter = onEnter;
exports.onKey = onKey;
exports.preventDefault = preventDefault;
exports.stopPropagation = stopPropagation;
