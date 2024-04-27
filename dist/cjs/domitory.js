'use strict';

var tslib_es6 = require('./tslib.es6-CC9N89Ys.js');

var defaultRunContext = { running: false };
/**
 * Composes a listener from the functions in ops which will prevent
 * itself from running multiple times concurrently. This is particularly
 * useful when promises need to be awaited.
 *
 * The function returns an object containing the created listerner and
 * the monitor for whether it is running
 *
 * Note that the ops can communicate with their return value and
 * second args.
 *
 * @param {Function[] | Function} ops
 * @param {any} runContext
 * @returns
 */
function eventListener(ops, runContext) {
    if (!runContext)
        runContext = defaultRunContext;
    if (!(ops instanceof Array))
        ops = [ops];
    var op;
    function listener(e) {
        return tslib_es6.__awaiter(this, void 0, void 0, function () {
            var result, _i, _a;
            return tslib_es6.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (runContext.running)
                            return [2 /*return*/];
                        runContext.running = true;
                        _i = 0, _a = ops;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        op = _a[_i];
                        return [4 /*yield*/, op(e, runContext)];
                    case 2:
                        result = _b.sent();
                        if (result === END)
                            return [3 /*break*/, 4];
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        runContext.running = false;
                        return [2 /*return*/, result];
                }
            });
        });
    }
    return listener;
}
var END = Symbol();
/**
 * Takes advantage of event bubbling to listen for events on descendant
 * elements to reduce the number of listeners to create.
 *
 * @param {FunctionMap2} map
 * @param {boolean} wrapListeners
 */
function matchEventListener(map, wrapListeners) {
    var listenerMap = {};
    for (var _i = 0, _a = Object.entries(map); _i < _a.length; _i++) {
        var _b = _a[_i], selector = _b[0], args = _b[1];
        if (wrapListeners || args instanceof Array) {
            var args2 = void 0;
            if (!(args instanceof Array) || typeof args.at(-1) === 'function')
                args2 = [args, undefined];
            listenerMap[selector] = args2 ? eventListener((args2[0], args2[1])) : eventListener(args[0], args[1]);
        }
        else
            listenerMap[selector] = args;
    }
    function listener(e) {
        for (var _i = 0, _a = Object.entries(listenerMap); _i < _a.length; _i++) {
            var _b = _a[_i], selector = _b[0], fn = _b[1];
            if (e.target.matches(selector))
                return fn(e);
        }
    }
    return listener;
}
var stopPropagation = function (e) { return e.stopPropagation(); };
var preventDefault = function (e) { return e.preventDefault(); };
/**
 * This will stop an event (typically keyup, keydown etc) from continuing
 * if it has not been triggered by the specified key.
 *
 * @returns
 */
var onKey = function (key) { return function (e) { return (e.key !== key) ? END : ''; }; };
var keys = { enter: 'Enter' };
/**
 * This will stop a key(up or down...) event from continuing if
 * it has not been triggered by the enter key.
 */
var onEnter = onKey(keys.enter);

exports.END = END;
exports.eventListener = eventListener;
exports.keys = keys;
exports.matchEventListener = matchEventListener;
exports.onEnter = onEnter;
exports.onKey = onKey;
exports.preventDefault = preventDefault;
exports.stopPropagation = stopPropagation;
