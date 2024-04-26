"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replace = exports.set = exports.apply = exports.parentSelector = exports.ruleSelector = exports.ruleSelectorAll = void 0;
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
function ruleSelectorAll(selectors, styleElement, onlyFirst) {
    var _a;
    var arrSelectors = selectors.split(',').map(function (item) { return item.trim(); });
    var result = [];
    var selector;
    for (var _i = 0, _b = Array.from(((_a = styleElement.sheet) === null || _a === void 0 ? void 0 : _a.cssRules) || []); _i < _b.length; _i++) {
        var rule = _b[_i];
        for (var _c = 0, arrSelectors_1 = arrSelectors; _c < arrSelectors_1.length; _c++) {
            selector = arrSelectors_1[_c];
            if (rule.cssText.startsWith(selector)) {
                result.push(rule);
                if (onlyFirst)
                    return result;
            }
        }
    }
    return result;
}
exports.ruleSelectorAll = ruleSelectorAll;
/**
 * Similar to querySelector in the same way ruleSelectorAll is similar to
 * querySelectorAll.
 *
 * @param {string} selectors
 * @param {HTMLStyleElement} styleElement
 * @returns {CSSRule}
 */
function ruleSelector(selectors, styleElement) {
    return ruleSelectorAll(selectors, styleElement, true)[0];
}
exports.ruleSelector = ruleSelector;
/**
 * Return the first ancestor that matches the selector.
 *
 * @param {Node} node
 * @param {string} selector
 * @returns {Element}
 */
function parentSelector(node, selector) {
    var parent = node.parentElement;
    while (parent && !(parent.matches(selector)))
        parent = parent.parentElement;
    return parent;
}
exports.parentSelector = parentSelector;
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
function apply(functions, element, asComponent) {
    if (!element)
        element = document.body;
    var elements, fn, e;
    var selectorAll = (element instanceof HTMLStyleElement) ? function (selectors) { return ruleSelectorAll(selectors, element); } : element.querySelectorAll.bind(element);
    for (var _i = 0, _a = Object.entries(functions); _i < _a.length; _i++) {
        var _b = _a[_i], selectors = _b[0], fns = _b[1];
        elements = Array.from(selectorAll(selectors));
        if (!(fns instanceof Array))
            fns = [fns];
        if (asComponent)
            for (var _c = 0, elements_1 = elements; _c < elements_1.length; _c++) {
                e = elements_1[_c];
                for (var _d = 0, fns_1 = fns; _d < fns_1.length; _d++) {
                    fn = fns_1[_d];
                    fn(e);
                }
            }
        else
            for (var _e = 0, fns_2 = fns; _e < fns_2.length; _e++) {
                fn = fns_2[_e];
                fn.apply(void 0, elements);
            }
    }
}
exports.apply = apply;
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
 * @param {string} selectors
 * @param {number[]|[number[], number[]]} index
 * @param {ArrayMap} values
 * @param {HTMLElement} element
 */
function set(selectors, index, values, element) {
    var _a;
    var member, memberValues, i;
    // index = Array.from(index);
    var elementIndex, valueIndex;
    if (index.length === 2 && index[0] instanceof Array && index[1] instanceof Array)
        elementIndex = index[0], valueIndex = index[1];
    else
        elementIndex = valueIndex = index;
    var indexLength = elementIndex.length;
    apply((_a = {},
        _a[selectors] = function () {
            var _a;
            var selected = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                selected[_i] = arguments[_i];
            }
            if (!index)
                index = selected.map(function (s, i) { return i; }); // just pass 0 to set all items
            for (var _b = 0, _c = Object.entries(values); _b < _c.length; _b++) {
                _a = _c[_b], member = _a[0], memberValues = _a[1];
                if (member.startsWith('_')) {
                    member = member.slice(1);
                    for (i = 0; i < indexLength; i++) {
                        selected[elementIndex[i]].setAttribute(member, memberValues[valueIndex[i]]);
                    }
                }
                else {
                    for (i = 0; i < indexLength; i++) {
                        selected[elementIndex[i]][member] = memberValues[valueIndex[i]];
                    }
                }
                selected[i];
            }
        },
        _a), element);
}
exports.set = set;
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
function replace(values, element, index, selectors) {
    var _a;
    // nb: the parameter type will already suggest conversion of values to array.
    if (values instanceof NodeList || values instanceof HTMLCollection)
        values = Array.from(values);
    // so that we don't accidentally change what we want to assign somewhere!
    if (!element)
        element = document.body;
    if (!index || !index.length)
        index = values.map(function (v, i) { return i; });
    var children;
    if (selectors)
        children = Array.from(element.querySelectorAll(selectors));
    else
        children = Array.from(element.children);
    var elementIndex, valueIndex;
    if (index.length === 2 && index[0] instanceof Array && index[1] instanceof Array)
        elementIndex = index[0], valueIndex = index[1];
    else
        elementIndex = valueIndex = index;
    var Length = elementIndex.length;
    var i, value, parentNode, tempElement;
    var template = document.createElement('template');
    var temps = elementIndex.map(function (i) {
        value = children[i];
        parentNode = value.parentElement;
        tempElement = template.cloneNode(false);
        parentNode === null || parentNode === void 0 ? void 0 : parentNode.replaceChild(tempElement, value);
        return [tempElement, parentNode];
    });
    for (i = 0; i < length; i++) {
        _a = temps[i], tempElement = _a[0], parentNode = _a[1];
        parentNode === null || parentNode === void 0 ? void 0 : parentNode.replaceChild(values[valueIndex[i]], tempElement);
    }
}
exports.replace = replace;
;
