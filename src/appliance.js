/**
 * Functions similarly to querySelectorAll, but for selecting style rules in 
 * a CSS stylesheet object.
 * 
 * @param {*} selectors 
 * @param {*} styleSheet 
 * @param {*} first 
 * @returns 
 */
export function ruleSelectorAll(selectors, styleSheet, first) {
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
export function ruleSelector(selectors, styleSheet) {
    return ruleSelectorAll(selectors, styleSheet, true);
}

/**
 * Return the first ancestor that matches the selector.
 * 
 * @param {*} element 
 * @param {*} selector 
 * @returns 
 */
export function parentSelector(element, selector) {
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
export function apply(functions, element, asComponent) {
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
export function set(selectors, index, values, element) {
    let member, memberValues, i;
    // index = Array.from(index);
    apply({
        [selectors]: (...selected) => {
            if (!index) index = selected.map((s, i) => i);   // just pass 0 to set all items
            for ([member, memberValues] of Object.entries(values)) {
                if (member.startsWith('_'))  {
                    member = member.slice(1);
                    for (i of index) {
                        selected[i].setAttribute(member, memberValues[i]);
                    }
                } else {
                    for (i of index) selected[i][member] = memberValues[i];
                }
                selected[i]
            }
        }
    }, element);
}

export function createRange(start, end) {
    const range = document.createRange();
    range.setStart(start, 0);
    range.setStart(end, 0);
    return range;
}