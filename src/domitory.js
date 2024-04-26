"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onEnter = exports.keys = exports.onKey = exports.preventDefault = exports.stopPropagation = exports.matchEventListener = exports.END = exports.eventListener = void 0;
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
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, _a;
            return __generator(this, function (_b) {
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
                        if (result === exports.END)
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
exports.eventListener = eventListener;
exports.END = Symbol();
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
exports.matchEventListener = matchEventListener;
var stopPropagation = function (e) { return e.stopPropagation(); };
exports.stopPropagation = stopPropagation;
var preventDefault = function (e) { return e.preventDefault(); };
exports.preventDefault = preventDefault;
/**
 * This will stop an event (typically keyup, keydown etc) from continuing
 * if it has not been triggered by the specified key.
 *
 * @returns
 */
var onKey = function (key) { return function (e) { return (e.key !== key) ? exports.END : ''; }; };
exports.onKey = onKey;
exports.keys = { enter: 'Enter' };
/**
 * This will stop a key(up or down...) event from continuing if
 * it has not been triggered by the enter key.
 */
exports.onEnter = (0, exports.onKey)(exports.keys.enter);
