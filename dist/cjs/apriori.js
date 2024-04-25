'use strict';

/**
 * This is a template tag that will resolve only after all 
 * interpolated promises have been resolved, finally returning the 
 * intended string.
 * 
 * tag`I will wait for this ${Promise.resolve("promise")}!!!`
 * 
 * @param {*} strings 
 * @param  {...any} expressions 
 * @returns 
 */
async function tag(strings, ...expressions) {
    const promiseExpressions = [];

    for (let [i, exp] of expressions.entries()) {
        if (exp instanceof Promise) promiseExpressions.push(exp);
        else promiseExpressions.push(Promise.resolve(exp));
    }
    
    const resolvedExpressions = await Promise.all(promiseExpressions);
    return resolvedExpressions.map((exp, i) => `${strings[i]}${exp}`).join('') + strings[resolvedExpressions.length];
}
/**
 * Effectively creates a template literal out of an existing template string and wraps it in a function 
 * which can be called multiple times to 'render' the template with the given arguments.
 * 
 * @param {*} str the template string
 * @param {*} argNames the names of the arguments inside the template literal
 * @returns 
 */
function template(str, argNames) {
    if (!argNames) argNames = [];
    return Function(...argNames, `return \`${str}\`;`)
}
/**
 * Similar to apriori.template but the built template is also 'promise-aware' and will allow them to resolve to string values 
 * before interpolating them. Supply a tagName argument to change 
 * the name of the tag in cases where the default (A) is the name of 
 * an argument (present in  argNames).
 * 
 * @param {*} str 
 * @param {*} argNames 
 * @param {*} tagName 
 * @returns 
 */
function asyncTemplate(str, argNames, tagName) {
    if (!argNames) argNames = [];
    if (!tagName) tagName = 'T';
    if (argNames.includes(tagName)) {
        throw new Error(`The tag name ${tagName} clashes with the name of one of the arguments. 
        Please change the tag name or the argument name to resolve this.`);
    }
    const f = Function(tagName, ...argNames, `return ${tagName}\`${str}\`;`);
    return (...args) => f(tag, ...args);
}

/**
 * Similar to template, but will render an iterable (such as array) of items together instead 
 * of rendering each item individually. This improves efficiency because 
 * we only call one function for all the items instead of one function 
 * per array item.
 * 
 * The function always receives the iterable as the first argument followed 
 * by the args named by argNames.
 * 
 * itemName is the name of each item of the iterable in the template. Defaults 
 * to 'item'. itemSep is the text that goes between the rendered item 
 * texts. Defaults to the empty string.
 * 
 * @param {*} str 
 * @param {*} argNames 
 * @param {*} itemName 
 * @param {*} itemSep 
 * @returns 
 */
function arrayTemplate(str, argNames, itemName, itemSep) {
    if (!argNames) argNames = [];
    if (!itemName) itemName = 'item';
    if (!itemSep) itemSep = '';

    return Function('arr', ...argNames, `
        const result = [];
        for (let ${itemName} of arr) {
            result.push(\`${str}\`);
        }
        return result.join('${itemSep}')
    `);
}

/**
 * Async equivalent of arrayTemplate. The async template tag ('T' by default) 
 * is applied to the template strings. Use this when there are promises to 
 * resolve.
 * 
 * @param {*} str 
 * @param {*} argNames 
 * @param {*} itemName 
 * @param {*} itemSep 
 * @param {*} tagName 
 * @returns 
 */
function arrayAsyncTemplate(str, argNames, itemName, itemSep, tagName) {
    if (!argNames) argNames = [];
    if (!itemName) itemName = 'item';
    if (!itemSep) itemSep = '';
    if (!tagName) tagName = 'T';

    if (itemName === tagName) {
        throw new Error(`The tag name ${tagName} is the same as the item name. 
        Please change the tag name or the item name to resolve this.`);
    }
    if (argNames.includes(tagName)) {
        throw new Error(`The tag name ${tagName} clashes with the name of one of the arguments. 
        Please change the tag name or the argument name to resolve this.`);
    }

    const f = Function(tagName, 'arr', ...argNames, `
        const result = [];
        for (let ${itemName} of arr) {
            result.push(${tagName}\`${str}\`);
        }
        return Promise.all(result).then(resolved => resolved.join('${itemSep}'));
    `);
    return (arr, ...args) => f(tag, arr, ...args);
}

/**
 * Fetches text (typically markup) from the url. Just a shorthand.
 * 
 * @param {*} url 
 * @param {*} init 
 * @returns 
 */
function get(url, init) {
    return fetch(url, init).then(r => r.text());
}

/**
 * Shorthand for creating a DocumentFragment from markup. If the 
 * fragment has only one child, the child is returned instead. 
 * So this is also a shorthand for creating single elements.
 * 
 * @param {*} markup 
 * @returns 
 */
const createFragment = function(markup) {
    const temp = document.createElement('template');
    temp.innerHTML = markup;
    let result = temp.content;
    if (result.children.length === 1) result = result.children[0];
    return result;
};

/**
 * Returns a DocumentRange between the start and end elements
 * 
 * @param {*} start The first element in the range
 * @param {*} end  The last element in the range
 * @returns 
 */
function createRange(start, end) {
    const range = document.createRange();
    range.setStart(start, 0);
    range.setStart(end, 0);
    return range;
}

/**
 * Wraps a document fragment so that it does not lose its children when 
 * they are moved from one parent to another.
 */
class LastingFragment {
    /**
     * Creates a new LastingFragment instance with all the input nodes 
     * as children. If any of the nodes is a document fragment, all its 
     * children will be added as children of the new LastingFragment.
     * 
     * @param  {...any} nodes 
     */
    constructor(...nodes) {
        this.nodes = [];
        for (let node of nodes) {
            if (node instanceof DocumentFragment) this.nodes.push(...node.childNodes);
            else this.nodes.appendChild(node);
        }
    }
    /**
     * Dynamically builds and returns a document fragment from the children 
     * of this fragment.
     * @returns 
     */
    get() {
        const fragment = new DocumentFragment();
        fragment.append(...this.nodes);
        return fragment;
    }
    /**
     * Removes the children of this fragment from their current parent
     */
    remove() {
        for (let node of this.nodes) node.parentNode?.removeChild(node);
    }
}

exports.LastingFragment = LastingFragment;
exports.arrayAsyncTemplate = arrayAsyncTemplate;
exports.arrayTemplate = arrayTemplate;
exports.asyncTemplate = asyncTemplate;
exports.createFragment = createFragment;
exports.createRange = createRange;
exports.get = get;
exports.tag = tag;
exports.template = template;
