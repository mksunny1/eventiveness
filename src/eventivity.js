/**
 * A re-write of the eventivity module for more clarity and 
 * performance.
 */

/**
 * Supports simple model of reactivity where we compose 
 * functions into iterables to invoke them simultaneously.
 * 
 * fuctions are composed in advance as an iterable (typically an array 
 * or set) and then used allong with call to perform reactive operations:
 * 
 * const event = [];
 * event.push(v => 'First handler');     // function made for the event
 * event.push([v => 'Recursive second handler 1', v => 'Recursive second handler 2']);
 * let v;
 * call(event, v = {...});
 * 
 * @param {*} functions 
 * @param  {...any} args 
 * @returns 
 */
export function call(functions, args) {
    for (let f of functions) {
        if (typeof f !== 'function') call(f, args);   // nested events
        else f(args);
    }
    return args;
}


/**
 * Another simple model of reactivity where we set object properties 
 * simultaneously based on input. The goal is to minimize function calls 
 * for this kind of reactivity. 
 * 
 * NB: it is good practice to not have too many similar reactive functions.
 * Either write a single function with parameters or use this function.
 * 
 * props is a prepared or composed mapping of the keys in args to object 
 * fields that should be set to it: 
 * {arg1: {prop1: [obj1, obj2, ...], prop2: [obj3], ...}, arg2: {...}, ...}
 * 
 * rhs are the values to be set, usually supplied inline with the call to set:
 * {arg1: 'new computation', arg2: await (fetch('something-remote')), 
 * arg3: call(event, 'we can' + 'also nest things here ', 1, 2, 3)}
 * 
 * @param {*} props 
 * @param {*} args 
 * @returns 
 */
export function set(props, args) {
    let prop, obj;
    for (let [key, value] of Object.entries(props)) {
        for ([prop, obj] of Object.entries(value)) {
            obj[prop] = args[key];
        }
    };
    return args;
}
