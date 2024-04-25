/**
 * Fast and 'costless' range function for javascript based on generators.
 * 
 * @param {*} start 
 * @param {*} end 
 * @param {*} step 
 */
function* range(start, end, step) {
    if (!step) step = 1;
    if (end === undefined && start) {end = start; start = 0;}
    for (let i = start; i < end; i+=step) yield i;
}

/**
 * Returns an iterator over the items of all the arrays, starting from 
 * the zero index to the maximum index of the first argument. The 
 * effective length of the iterator is the sum of the length of the args.
 * 
 * Can be used to join arrays in a way no supported by concat, pusg, etc.
 * 
 * @param  {...any} args 
 */
function* flat(...args) {
    const count = args.length;
    const length = args[0].length;
    let j;
    for (let i = 0; i < length; i++) {
        for (j = 0; j < count; j++) yield args[j][i];
    }
}

export { flat, range };
