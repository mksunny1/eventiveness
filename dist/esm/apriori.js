import { _ as __awaiter, b as __spreadArray, a as __generator } from './tslib.es6-DpMc_yT1.js';

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
function tag(strings) {
    var expressions = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        expressions[_i - 1] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
        var promiseExpressions, _a, _b, _c, exp, resolvedExpressions;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    promiseExpressions = [];
                    for (_a = 0, _b = Array.from(expressions.entries()); _a < _b.length; _a++) {
                        _c = _b[_a], _c[0], exp = _c[1];
                        if (exp instanceof Promise)
                            promiseExpressions.push(exp);
                        else
                            promiseExpressions.push(Promise.resolve(exp));
                    }
                    return [4 /*yield*/, Promise.all(promiseExpressions)];
                case 1:
                    resolvedExpressions = _d.sent();
                    return [2 /*return*/, resolvedExpressions.map(function (exp, i) { return "".concat(strings[i]).concat(exp); }).join('') + strings[resolvedExpressions.length]];
            }
        });
    });
}
/**
 * Effectively creates a template literal out of an existing template string and wraps it in a function
 * which can be called multiple times to 'render' the template with the given arguments.
 *
 * @param {string} templateStr the template string
 * @param {Array<string>} argNames the names of the arguments inside the template literal
 * @returns {(...any): string}
 */
function template(templateStr, argNames) {
    if (!argNames)
        argNames = [];
    return Function.apply(void 0, __spreadArray(__spreadArray([], argNames, false), ["return `".concat(templateStr, "`;")], false));
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
function asyncTemplate(templateStr, argNames, tagName) {
    if (!argNames)
        argNames = [];
    if (!tagName)
        tagName = 'T';
    if (argNames.includes(tagName)) {
        throw new Error("The tag name ".concat(tagName, " clashes with the name of one of the arguments. \n        Please change the tag name or the argument name to resolve this."));
    }
    var f = Function.apply(void 0, __spreadArray(__spreadArray([tagName], argNames, false), ["return ".concat(tagName, "`").concat(templateStr, "`;")], false));
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return f.apply(void 0, __spreadArray([tag], args, false));
    };
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
function arrayTemplate(templateStr, argNames, itemName, itemSep) {
    if (!argNames)
        argNames = [];
    if (!itemName)
        itemName = 'item';
    if (!itemSep)
        itemSep = '';
    return Function.apply(void 0, __spreadArray(__spreadArray(['arr'], argNames, false), ["\n        const result = [];\n        for (let ".concat(itemName, " of arr) {\n            result.push(`").concat(templateStr, "`);\n        }\n        return result.join('").concat(itemSep, "')\n    ")], false));
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
function asyncArrayTemplate(templateStr, argNames, itemName, itemSep, tagName) {
    if (!argNames)
        argNames = [];
    if (!itemName)
        itemName = 'item';
    if (!itemSep)
        itemSep = '';
    if (!tagName)
        tagName = 'T';
    if (itemName === tagName) {
        throw new Error("The tag name ".concat(tagName, " is the same as the item name. \n        Please change the tag name or the item name to resolve this."));
    }
    if (argNames.includes(tagName)) {
        throw new Error("The tag name ".concat(tagName, " clashes with the name of one of the arguments. \n        Please change the tag name or the argument name to resolve this."));
    }
    var f = Function.apply(void 0, __spreadArray(__spreadArray([tagName, 'arr'], argNames, false), ["\n        const result = [];\n        for (let ".concat(itemName, " of arr) {\n            result.push(").concat(tagName, "`").concat(templateStr, "`);\n        }\n        return Promise.all(result).then(resolved => resolved.join('").concat(itemSep, "'));\n    ")], false));
    return function (arr) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return f.apply(void 0, __spreadArray([tag, arr], args, false));
    };
}
/**
 * Fetches text (typically markup) from the url. Just a shorthand.
 *
 * @param {string} url
 * @param {boolean} [suppressErrors]
 * @param {RequestInit} [init]
 * @returns {Promise<string>}
 */
function get(url, suppressErrors, init) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            result = fetch(url, init).then(function (r) { return r.text(); });
            if (suppressErrors)
                result = result.catch(function (r) { return ''; });
            return [2 /*return*/, result];
        });
    });
}
/**
 * Shorthand for creating a DocumentFragment from markup. If the
 * fragment has only one child, the child is returned instead.
 * So this is also a shorthand for creating single elements.
 *
 * @param {string} markup
 * @returns {Node}
 */
var createFragment = function (markup) {
    var temp = document.createElement('template');
    temp.innerHTML = markup;
    var result = temp.content;
    if (result.children.length === 1)
        return result.children[0];
    return result;
};
/**
 * Returns a DocumentRange between the start and end elements
 *
 * @param {Node} start The first element in the range
 * @param {Node} end  The last element in the range
 * @returns {Range}
 */
function createRange(start, end) {
    var range = document.createRange();
    range.setStart(start, 0);
    range.setStart(end, 0);
    return range;
}
/**
 * Wraps a document fragment so that it does not lose its children when
 * they are moved from one parent to another.
 */
var LastingFragment = /** @class */ (function () {
    /**
     * Creates a new LastingFragment instance with all the input nodes
     * as children. If any of the nodes is a document fragment, all its
     * children will be added as children of the new LastingFragment.
     *
     * @param  {...Node} nodes
     * @constructor
     */
    function LastingFragment() {
        var _a;
        var nodes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            nodes[_i] = arguments[_i];
        }
        this.nodes = [];
        for (var _b = 0, nodes_1 = nodes; _b < nodes_1.length; _b++) {
            var node = nodes_1[_b];
            if (node instanceof DocumentFragment)
                (_a = this.nodes).push.apply(_a, Array.from(node.childNodes));
            else
                this.nodes.push(node);
        }
    }
    /**
     * Dynamically builds and returns a document fragment from the children
     * of this fragment.
     * @returns {DocumentFragment}
     */
    LastingFragment.prototype.get = function () {
        var fragment = new DocumentFragment();
        fragment.append.apply(fragment, this.nodes);
        return fragment;
    };
    /**
     * Removes the children of this fragment from their current parent
     */
    LastingFragment.prototype.remove = function () {
        var _a;
        for (var _i = 0, _b = this.nodes; _i < _b.length; _i++) {
            var node = _b[_i];
            (_a = node.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(node);
        }
    };
    return LastingFragment;
}());

export { LastingFragment, arrayTemplate, asyncArrayTemplate, asyncTemplate, createFragment, createRange, get, tag, template };
