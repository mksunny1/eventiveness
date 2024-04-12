import { arender } from "./arender.js";


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
    } 
    
    let result;
    let template;
    
    if (typeof tree === 'string' && createTemplate) {
        template = arender(tree);
        result = (...args) => apriori.tree(template(...args)).cloneNode();
    }
    else {
        if (typeof tree === 'string') tree = apriori.tree(tree);
        result = () => tree.cloneNode(true);
    }
    result.tree = tree;
    result.template = template;
    return result; 

};

apriori.tree = function(str) {
    const temp = document.createElement('template');
    temp.innerHTML = str;
    let result = temp.content;
    if (result.children.length === 1) result = result.children[0];
    return result;
}
