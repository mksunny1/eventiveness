/**
 * Fast and 'costless' range function for javascript based on generators.
 * 
 * @param {*} start 
 * @param {*} end 
 * @param {*} step 
 */
export function* range(start, end, step) {
    if (!step) step = 1;
    if (end === undefined && start) {end = start; start = 0;}
    for (let i = start; i < end; i+=step) yield i;
}

/**
 * A speculative export:
 * 
 * Can be used to support using generators in place of functions 
 * in high-performance scenarios by:
 * 1. Defining the generator founction to contain a loop that continues 
 * to yield as long as there are args ('undefining' the args before yielding)
 * 2. Calling the function to get the generator object.
 * 3. Alternately setting the args here and calling the generator's next() method
 * ...
 * 
 */
export const args = [

];

