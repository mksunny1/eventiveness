
/**
 * Supports simple model of reactivity where we compose 
 * functions into iterables to invoke them simultaneously.
 * 
 * fuctions are composed in advance into an iterable (typically an array 
 * or set) and then used allong with 'call' to perform reactive operations:
 * 
 * const event = [];
 * event.push(v => 'First handler');     // function made for the event
 * event.push([v => 'Recursive second handler 1', v => 'Recursive second handler 2']);
 * let variable;
 * call(event, variable = {...});
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
 * Similar to object.assign but the keys do not need to be the same.
 * 
 * @param {*} props 
 * @param {*} args 
 * @returns 
 */
export function set(props, args) {
    let prop, objs, obj;
    for (let [key, value] of Object.entries(props)) {
        for ([prop, objs] of Object.entries(value)) {
            if (!(objs instanceof Array)) objs = [objs];
            for (obj of objs) obj[prop] = args[key];
        }
    };
    return args;
}
