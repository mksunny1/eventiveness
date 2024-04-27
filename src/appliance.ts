
export interface AnyObject {
    [key: string]: any;
}

export type Func = (...args: any[]) => any;

export interface FunctionMap {
    [key: string]: Func | Func[];
}

export interface ArrayMap {
    [key: string]: any[];
}

/**
 * Functions similarly to querySelectorAll, but for selecting style rules in 
 * a CSS stylesheet object. All rules that start with any of the selectors are 
 * selected.
 * 
 * @param {string} selectors 
 * @param {HTMLStyleElement} styleElement 
 * @param {boolean} onlyFirst 
 * @returns {Array<CSSRule>}
 */
export function ruleSelectorAll(selectors: string, styleElement: HTMLStyleElement, onlyFirst?: boolean): Array<CSSRule> {
    const arrSelectors = selectors.split(',').map(item => item.trim());
    const result: any[] = [];
    let selector: string;
    for (let rule of Array.from(styleElement.sheet?.cssRules || [])) {
        for (selector of arrSelectors) {
            if (rule.cssText.startsWith(selector)) {
                result.push(rule);
                if (onlyFirst) return result;
            }
        }
    }
    return result;
}

/**
 * Similar to querySelector in the same way ruleSelectorAll is similar to 
 * querySelectorAll.
 * 
 * @param {string} selectors 
 * @param {HTMLStyleElement} styleElement 
 * @returns {CSSRule}
 */
export function ruleSelector(selectors: string, styleElement: HTMLStyleElement): CSSRule {
    return ruleSelectorAll(selectors, styleElement, true)[0];
}

/**
 * Return the first ancestor that matches the selector.
 * 
 * @param {Node} node 
 * @param {string} selector 
 * @returns {Element}
 */
export function parentSelector(node: Node, selector: string): Element|null {
    let parent = node.parentElement;
    while (parent && !(parent.matches(selector))) parent = parent.parentElement;
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
 * @param {FunctionMap } functions 
 * @param {HTMLElement} element 
 * @param {boolean} asComponent 
 */
export function apply(functions: FunctionMap, element?: HTMLElement, asComponent?: boolean) {
    if (!element) element = document.body;
    let elements: unknown[], fn: (...args: any) => void, e: any;
    const selectorAll = (element instanceof HTMLStyleElement)? (selectors: string) => ruleSelectorAll(selectors, element): element.querySelectorAll.bind(element);
    for (let [selectors, fns] of Object.entries(functions)) {
        elements = Array.from(selectorAll(selectors));
        if (!(fns instanceof Array)) fns = [fns];
        if (asComponent) for (e of elements) for (fn of fns) fn(e);
        else for (fn of fns) fn(...elements);
    }
}

/**
 * 
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
 * 
 * @param {string} selectors 
 * @param {number[]|[number[], number[]]} index
 * @param {ArrayMap} values 
 * @param {HTMLElement} element 
 */
export function set(selectors: string, index: number[]|[number[], number[]], values: ArrayMap, element: HTMLElement) {
    let member: string, memberValues: any[], i: number;
    if (!(index instanceof Array)) index = Array.from(index as number[]);

    let elementIndex: number[], valueIndex: number[];
    if (index.length === 2 && index[0] instanceof Array && index[1] instanceof Array) [elementIndex, valueIndex] = index;
    else elementIndex = valueIndex = index as number[];
    const indexLength = elementIndex.length;

    if (!(elementIndex instanceof Array)) elementIndex = Array.from(elementIndex as number[]);
    if (!(valueIndex instanceof Array)) valueIndex = Array.from(valueIndex as number[]);

    apply({
        [selectors]: (...selected: any[]) => {
            if (!index) index = selected.map((s, i) => i);   // just pass 0 to set all items
            for ([member, memberValues] of Object.entries(values)) {
                if (member.startsWith('_'))  {
                    member = member.slice(1);
                    for (i = 0; i < indexLength; i++) {
                        selected[elementIndex[i]].setAttribute(member, memberValues[valueIndex[i]]);
                    }
                } else {
                    for (i = 0; i < indexLength; i++) {
                        selected[elementIndex[i]][member] = memberValues[valueIndex[i]];
                    }
                }
                selected[i]
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
 * @param {Array<Node>} values The replacement nodes.
 * @param {HTMLElement} element Element containing all the elements to replace. Defaults to document.body.
 * @param {number[]|[number[], number[]]} index The children at these indices are replaced with the corresponding values. Can be either index or [index, valueIndex]. Defaults to all indices in values.
 * @param {string} selectors Selectors for what to replace. Defaults to element children
 */
export function replace(values: Array<Node>, element: HTMLElement, index: number[]|[number[], number[]], selectors: string) {
    // nb: the parameter type will already suggest conversion of values to array.
    if (!(values instanceof Array)) values = Array.from(values);
    // so that we don't accidentally change what we want to assign somewhere!

    if (!(index instanceof Array)) index = Array.from(index as number[]);

    if (!element) element = document.body;
    if (!index || !index.length) index = values.map((v, i) => i);

    let children: any[];
    if (selectors) children = Array.from(element.querySelectorAll(selectors));
    else children = Array.from(element.children);

    let elementIndex: number[], valueIndex: number[];
    if (index.length === 2 && index[0] instanceof Array && index[1] instanceof Array) [elementIndex, valueIndex] = index;
    else elementIndex = valueIndex = index as number[];

    if (!(elementIndex instanceof Array)) elementIndex = Array.from(elementIndex as number[]);
    if (!(valueIndex instanceof Array)) valueIndex = Array.from(valueIndex as number[]);

    const length = elementIndex.length;

    let i: number, value: Node, parentNode: Node|null, tempElement: Node;
    const template = document.createElement('template');
    const temps: Array<[Node, Node|null]> = elementIndex.map(i => {
        value = children[i];
        parentNode = value.parentElement;
        tempElement = template.cloneNode(false);
        parentNode?.replaceChild(tempElement, value);
        return [tempElement, parentNode];
    });

    
    for (i = 0; i < length; i++) {
        [tempElement, parentNode] = temps[i];
        parentNode?.replaceChild(values[valueIndex[i]], tempElement);
    }
};

