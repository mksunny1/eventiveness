/**
 * This is a template tag that will resolve only after all 
 * interpolated promises have been resolved, finally returning the 
 * intended string.
 * 
 * tag`I will wait for this ${Promise.resolve("promise")}!!!`
 * 
 * @param {Array<string>} strings 
 * @param  {...any} expressions 
 * @returns {Promise<string>}
 */
export async function tag(strings: Array<string>, ...expressions: any[]): Promise<string> {
    const promiseExpressions: unknown[] = [];

    for (let [i, exp] of Array.from(expressions.entries())) {
        if (exp instanceof Promise) promiseExpressions.push(exp);
        else promiseExpressions.push(Promise.resolve(exp));
    }
    
    const resolvedExpressions = await Promise.all(promiseExpressions);
    return resolvedExpressions.map((exp, i) => `${strings[i]}${exp}`).join('') + strings[resolvedExpressions.length];
};

/**
 * Effectively creates a template literal out of an existing template string and wraps it in a function 
 * which can be called multiple times to 'render' the template with the given arguments.
 * 
 * @param {string} templateStr the template string
 * @param {Array<string>} argNames the names of the arguments inside the template literal
 * @returns {(...any): string}
 */
export function template(templateStr: string, argNames?: Array<string>): ((...any) => string)  {
    if (!argNames) argNames = [];
    return Function(...argNames, `return \`${templateStr}\`;`) as ((...any) => string);
}
/**
 * Similar to apriori.template but the built template is also 'promise-aware' and will allow them to resolve to string values 
 * before interpolating them. Supply a tagName argument to change 
 * the name of the tag in cases where the default (A) is the name of 
 * an argument (present in  argNames).
 * 
 * @param {string} templateStr the template string
 * @param {Array<string>} argNames the names of the arguments inside the template literal
 * @param {string} tagName 
 * @returns {(...any): string}
 */
export function asyncTemplate(templateStr: string, argNames: Array<string>, tagName: string): ((...any) => string) {
    if (!argNames) argNames = [];
    if (!tagName) tagName = 'T';
    if (argNames.includes(tagName)) {
        throw new Error(`The tag name ${tagName} clashes with the name of one of the arguments. 
        Please change the tag name or the argument name to resolve this.`);
    }
    const f = Function(tagName, ...argNames, `return ${tagName}\`${templateStr}\`;`);
    return (...args) => f(tag, ...args);
}


export interface ArrayTemplate {
    (arr: any[], ...args: any[]) : string;
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
 * @param {string} templateStr 
 * @param {Array<string>} argNames 
 * @param {string} itemName 
 * @param {string} itemSep 
 * @returns {ArrayTemplate}
 */
export function arrayTemplate(templateStr: string, argNames: Array<string>, itemName: string, itemSep: string): ArrayTemplate {
    if (!argNames) argNames = [];
    if (!itemName) itemName = 'item';
    if (!itemSep) itemSep = '';

    return Function('arr', ...argNames, `
        const result = [];
        for (let ${itemName} of arr) {
            result.push(\`${templateStr}\`);
        }
        return result.join('${itemSep}')
    `) as ArrayTemplate;
}

/**
 * Async equivalent of arrayTemplate. The async template tag ('T' by default) 
 * is applied to the template strings. Use this when there are promises to 
 * resolve.
 * 
 * @param {string} templateStr 
 * @param {Array<string>} argNames 
 * @param {string} itemName 
 * @param {string} itemSep 
 * @param {string} tagName 
 * @returns {ArrayTemplate}
 */
export function asyncArrayTemplate(templateStr: string, argNames: Array<string>, itemName: string, itemSep: string, tagName: string): ArrayTemplate {
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
            result.push(${tagName}\`${templateStr}\`);
        }
        return Promise.all(result).then(resolved => resolved.join('${itemSep}'));
    `);
    return (arr, ...args) => f(tag, arr, ...args);
}

/**
 * Fetches text (typically markup) from the url. Just a shorthand.
 * 
 * @param {string} url 
 * @param {RequestInit} init 
 * @returns {Promise<string>}
 */
export async function get(url: string, init: RequestInit): Promise<string> {
    const r = await fetch(url, init);
    return await r.text();
}

/**
 * Shorthand for creating a DocumentFragment from markup. If the 
 * fragment has only one child, the child is returned instead. 
 * So this is also a shorthand for creating single elements.
 * 
 * @param {string} markup 
 * @returns {Node}
 */
export const createFragment = function(markup: string): Node {
    const temp = document.createElement('template');
    temp.innerHTML = markup;
    let result = temp.content;
    if (result.children.length === 1) return result.children[0];
    return result;
}

/**
 * Returns a DocumentRange between the start and end elements
 * 
 * @param {Node} start The first element in the range
 * @param {Node} end  The last element in the range
 * @returns {Range}
 */
export function createRange(start: Node, end: Node): Range {
    const range = document.createRange();
    range.setStart(start, 0);
    range.setStart(end, 0);
    return range;
}

/**
 * Wraps a document fragment so that it does not lose its children when 
 * they are moved from one parent to another.
 */
export class LastingFragment {
    nodes: Node[];
    /**
     * Creates a new LastingFragment instance with all the input nodes 
     * as children. If any of the nodes is a document fragment, all its 
     * children will be added as children of the new LastingFragment.
     * 
     * @param  {...Node} nodes 
     * @constructor
     */
    constructor(...nodes: Node[]) {
        this.nodes = [];
        for (let node of nodes) {
            if (node instanceof DocumentFragment) this.nodes.push(...Array.from(node.childNodes));
            else this.nodes.push(node);
        }
    }
    /**
     * Dynamically builds and returns a document fragment from the children 
     * of this fragment.
     * @returns {DocumentFragment}
     */
    get(): DocumentFragment {
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

