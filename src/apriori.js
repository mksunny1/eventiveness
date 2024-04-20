/**
 * This is a template tag that will resolve only after all 
 * interpolated promises have been resolved, finally returning the 
 * intended string.
 * 
 * async`I will wait for this ${Promise.resolve("promise")}!!!`
 * 
 * @param {*} strings 
 * @param  {...any} expressions 
 * @returns 
 */
export async function asyncLiteral(strings, ...expressions) {
    const promiseExpressions = [];

    for (let [i, exp] of expressions.entries()) {
        if (exp instanceof Promise) promiseExpressions.push(exp);
        else promiseExpressions.push(Promise.resolve(exp));
    }
    
    const resolvedExpressions = await Promise.all(promiseExpressions);
    return resolvedExpressions.map((exp, i) => `${strings[i]}${exp}`).join('') + strings[resolvedExpressions.length];
};



/**
 * Effectively makes a template literal out of an existing template string and wraps it in a function 
 * which can be called multiple times to 'render' the template with the given arguments.
 * Additionally the built template is 'promise-aware' and will allow them to resolve to string values 
 * before interpolating them.
 * 
 * template = arender(templateString);
 * template(arg1, arg2, ...argRest);
 * .
 * @param {*} str 
 * @param {*} argNames 
 * @param {*} renderName 
 * @returns 
 */
export function asyncTemplate(str, argNames, renderName) {
    if (!renderName) renderName = 'async';
    if (!(argNames instanceof Array)) argNames = [argNames];
    if (argNames.includes(renderName)) {
        throw new Error(`Render name ${renderName} clashes with the name of one of the arguments. 
        Please change the rendername or the argument name to resolve this.`);
    }
    const mainFunction = Function(renderName, ...argNames, "return " + renderName + "`" + str + "`;")
    return (...args) => mainFunction(asyncLiteral, ...args);
}


/**
 * Resolves the tree to a node/fragment type and returns a cloner function containing a tree property pointing to 
 * the resolved tree. Depending on the usage scenario, the returned function may be called repeatedly or the tree 
 * property can simply be fetched. This obviates the need for manually caching the tree for later cloning, a potentially 
 * common use-case.
 *  
 * The tree can be a ready-made node or fragment, markup or a promise or function that 
 * resolves to or returns any of these. These will be processed until we get a de-facto tree that can be added to 
 * another node. 
 * 
 * @param {*} tree 
 * @param {*} createTemplate 
 * @returns 
 */
export const apriori = async (tree,  createTemplate) => {
    while (typeof tree !== "string" && !(tree instanceof Node)) {
        if (tree instanceof Promise) tree = await tree;
        if (typeof tree === 'function') tree = tree();
        if (tree instanceof Response) tree = tree.text();
    } 
    
    let result;
    let template;
    
    if (typeof tree === 'string' && createTemplate) {
        template = asyncTemplate(tree);
        result = (...args) => createTree(template(...args)).cloneNode();
    }
    else {
        if (typeof tree === 'string') tree = createTree(tree);
        result = () => tree.cloneNode(true);
    }
    result.tree = tree;
    if (template) result.template = template;
    return result; 
};

/**
 * Shorthand for creating a DOM tree from markup.
 * 
 * @param {*} markup 
 * @returns 
 */
export const createTree = function(markup) {
    const temp = document.createElement('template');
    temp.innerHTML = markup;
    let result = temp.content;
    if (result.children.length === 1) result = result.children[0];
    return result;
}
/**
 * Wraps a document fragment so that it does not lose its children when 
 * they are moved from one parent to another.
 */
export class LastingFragment {
    constructor(...nodes) {
        this.nodes = [];
        for (let node of nodes) {
            if (node instanceof DocumentFragment) this.nodes.push(...node.childNodes);
            else this.nodes.appendChild(node);
        }
    }
    get() {
        const fragment = new DocumentFragment();
        fragment.append(...this.nodes);
        return fragment;
    }
    remove() {
        for (let node of this.nodes) node.parentNode?.removeChild(node);
    }
}

