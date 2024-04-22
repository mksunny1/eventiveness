'use strict';

/**
 * Functions similarly to querySelectorAll, but for selecting style rules in 
 * a CSS stylesheet object.
 * 
 * @param {*} selectors 
 * @param {*} styleSheet 
 * @param {*} first 
 * @returns 
 */
function ruleSelectorAll(selectors, styleSheet, first) {
    selectors = selectors.split(',').map(item => item.trim());
    const result = [];
    let selector;
    for (let rule of styleSheet.cssRules) {
        for (selector of selectors) {
            if (rule.cssText.startsWith(selector)) {
                if (first) return rule;
                else result.push(rule);
            }
        }
    }
    return result;
}

/**
 * Similar to querySelector in the same way ruleSelectorAll is similar to 
 * querySelectorAll.
 * 
 * @param {*} selectors 
 * @param {*} styleSheet 
 * @returns 
 */
function ruleSelector(selectors, styleSheet) {
    return ruleSelectorAll(selectors, styleSheet, true);
}

/**
 * Return the first ancestor that matches the selector.
 * 
 * @param {*} element 
 * @param {*} selector 
 * @returns 
 */
function parentSelector(element, selector) {
    let parent = element.parentNode;
    while (parent && !(parent.matches(selector))) parent = parent.parentNode;
    return parent;
}

/**
 * Select the elements given by the object (map) keys and run the functions given by the object values over them.
 * Eleminates the many calls to querySelectorAll, which is quite verbose.
 * 
 * Without the third argument (asComponents), all selected elements are 
 * passed to the functions at once. With the argument given as a truthy value, 
 * the elements are passed one by one, so that the behavior is almost like that 
 * of web components.
 * 
 * @param {*} functions 
 * @param {*} element 
 * @param {*} asComponent 
 */
function apply(functions, element, asComponent) {
    if (!element) element = document.body;
    let elements, fn, e;
    const selectorAll = (element instanceof CSSStyleSheet)? (selectors) => ruleSelectorAll(selectors, element): element.querySelectorAll.bind(element);
    for (let [selectors, fns] of Object.entries(functions)) {
        elements = Array.from(selectorAll(selectors));
        if (!(fns instanceof Array)) fns = [fns];
        if (asComponent) for (e of elements) for (fn of fns) fn(e);
        else for (fn of fns) fn(...elements);
    }
}

/**
 * A function to select and set specific properties and/or attributes on 
 * elements. The steps are as follows
 * 
 * 1. Use the selectors to select the appropriate elements. 
 * 
 * 2. the selected elements are filtered by the index (in for...of loop)
 * 
 * 3. the values is an object mapping the name of the property or attribute 
 * to set to values lists which must contain all the indices.
 * 
 * 4. the specified properties and/or attributes of the elements  
 * are set to the values at the same indices.
 * 
 * In the values map, property names are written normally but attribute 
 * names start with underscore (_).
 * 
 * @param {*} selectors 
 * @param {*} index
 * @param {*} values 
 * @param {*} element 
 */
function set(selectors, index, values, element) {
    let member, memberValues, i;
    // index = Array.from(index);

    let valueIndex = index;
    if (index.length === 2 && index[0] instanceof Array) [index, valueIndex] = index;
    const indexLength = index.length;

    apply({
        [selectors]: (...selected) => {
            if (!index) index = selected.map((s, i) => i);   // just pass 0 to set all items
            for ([member, memberValues] of Object.entries(values)) {
                if (member.startsWith('_'))  {
                    member = member.slice(1);
                    for (i = 0; i < indexLength; i++) {
                        selected[index[i]].setAttribute(member, memberValues[valueIndex[i]]);
                    }
                } else {
                    for (i of index) selected[i][member] = memberValues[i];
                }
                selected[i];
            }
        }
    }, element);
}


/**
 * This method is important to prevent boilerplate in code where 
 * we need to replace certain elements in a tree with other elements 
 * within the same tree, such as in 'swap' scenarios.
 * 
 * Replacing an element A with another element B will move B to the location 
 * of A and remove A. If we wanted to set B to another value, such as A, we 
 * need to store its initial location before the move. We also need to use 
 * a different method, such as insertBefore to insert the new element in 
 * B's formar location. This generally requires a lot more attention than 
 * simply calling a function to manage all that, especially when there are 
 * many 'Bs' to move.
 * 
 * This functions makes it very easy to replace multiple elements in a tree 
 * at the same time without any mental overhead.
 * 
 * @param {*} values The replacement nodes.
 * @param {*} element Element containing all the elements to replace. Defaults to document.body.
 * @param {*} index The children at these indices are replaced with the corresponding values. Can be either index or [index, valueIndex]. Defaults to all indices in values.
 * @param {*} selectors Selectors for what to replace. Defaults to element children
 */
function replace(values, element, index, selectors) {
    if (values instanceof NodeList || values instanceof HTMLCollection) values = Array.from(values);
    // so that we don't accidentally change what we want to assign somewhere!

    if (!element) element = document.body;
    if (!index || !index.length) index = values.map((v, i) => i);

    let children;
    if (selectors) children = Array.from(element.querySelectorAll(selectors));
    else children = Array.from(element.children);

    let valueIndex = index;
    if (index.length === 2 && index[0] instanceof Array) [index, valueIndex] = index;

    let i, value, parentNode, tempElement;
    const template = document.createElement('template');
    const length = index.length;
    const temps = index.map(i => {
        value = children[i];
        parentNode = value.parentNode;
        tempElement = template.cloneNode(false);
        parentNode.replaceChild(tempElement, value);
        return [tempElement, parentNode];
    });
    for (i = 0; i < length; i++) {
        [tempElement, parentNode] = temps[i];
        parentNode.replaceChild(values[valueIndex[i]], tempElement);
    }
}

/**
 * Returns a DocumentRange between start and end
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

exports.apply = apply;
exports.createRange = createRange;
exports.parentSelector = parentSelector;
exports.replace = replace;
exports.ruleSelector = ruleSelector;
exports.ruleSelectorAll = ruleSelectorAll;
exports.set = set;
