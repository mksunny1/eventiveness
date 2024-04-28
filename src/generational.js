/**
 * Fast and 'costless' range function for javascript based on generators.
 *
 * @example
 *
 *
 * @param {number} start
 * @param {number} [end]
 * @param {number} [step]
 */
export function* range(start, end, step) {
    if (!step)
        step = 1;
    if ((end === undefined || end === null) && start) {
        end = start;
        start = 0;
    }
    for (let i = start; i < end; i += step)
        yield i;
}
/**
 * Returns a generator which iterates over the subset of the
 * 'arrayLike' object that matches the provided index.
 *
 * @example
 *
 *
 * @param {any} arrayLike
 * @param {Iterable<any>} index
 */
export function* items(arrayLike, index) {
    for (let i of index)
        yield arrayLike[i];
}
/**
 * Call to get the length of an object. The object must either
 * have a length property of be previously passed in a call to`setLength`.
 *
 * @example
 *
 *
 * @param {any} iter
 */
export function getLength(iter) {
    return iterLengths.get(iter) || iter.length;
}
/**
 * Stores the 'fake' lenghts of iterables passed in calls to `setLength`.
 * Can also be modified manually.
 */
export const iterLengths = new WeakMap();
/**
 * Attaches a 'fake' length to an object (likely iterable or iterator)
 * which does not have a length property, so that it can work well with
 * functions that use `getLength`.
 *
 * @example
 *
 *
 * @param {any} iter
 */
export function setLength(iter, length) {
    iterLengths.set(iter, length);
    return iter;
}
/**
 * Returns an iterator over the items of all the input iterators, starting from
 * the zero index to the maximum index of the first argument. The
 * effective length of the iterator is the multiple of the length of thr smallest
 * iterator and the number of iterators (number of args).
 *
 * Can be used to join arrays in a way no supported by `concat`, `push`, etc.
 * To pass an array as an iterator, call array.values().
 *
 * @example
 *
 *
 * @param  {...Iterator<any>} args
 */
export function* flat(...args) {
    const count = getLength(args);
    let j;
    while (true) {
        for (let i = 0; i < count; i++) {
            if (args[i].next().done)
                yield args[i].next().value;
            else
                return;
        }
    }
}
/**
 * Get an iterator over the next 'count' items of the given iterator.
 *
 * @example
 *
 *
 * @param iter
 * @param count
 */
export function* next(iter, count) {
    while (count-- > 0)
        yield iter.next().value;
}
/**
 * Returns an unordered/random iterator over the input array..
 *
 * @example
 *
 *
 * @param {any[]} array
 */
export function* uItems(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i >= 0; i--) {
        yield arr.splice(Math.round(Math.random() * i), 1);
    }
}
