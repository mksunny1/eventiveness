"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.One = exports.unWrap = exports.one = void 0;
/**
 * Creates a One object which transmits a call, method dispatch, property
 * get or set applied to the 'one' object to the 'many' objects.
 *
 * The recursive arg is used to ensure that getting properties always
 * wraps the array results with One also.
 *
 * The context arg will be passed to all delegated calls. A new object
 * is created if it is not provided.
 *
 * @param {any[]} many
 * @param {boolean} recursive
 * @param {AnyObject} context
 * @returns
 */
function one(many, recursive, context) {
    return new Proxy(new One(many, recursive, context, one), oneTrap);
}
exports.one = one;
var PURE = Symbol();
/**
 * Return a 'pure' One from a proxied One.
 *
 * @param one
 * @returns
 */
function unWrap(one) {
    return one[PURE] || one;
}
exports.unWrap = unWrap;
var oneTrap = {
    get: function (target, p) {
        if (p === PURE)
            return target;
        var result = target.get(p, true);
        if (result.length && typeof result[0] === 'function') {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return target.call(args, p);
            };
        }
        else if (target.recursive) {
            if (target.ctor)
                return target.ctor(result, true, target.context, target.ctor);
            else
                return new One(result, true, target.context);
        }
        return result;
    },
    set: function (target, p, value) {
        target.set(p, value);
        return true;
    }
};
var One = /** @class */ (function () {
    /**
     * Creates a new One instance for propagating operations to all the items
     * in many. Property get, set , delete and method call operations are
     * propagated. Each of these operations has a corresponding method in One.
     *
     * @param {any[]} many
     * @param {boolean} [recursive] Whether to wrap the arrays returned by get with another One.
     * @param {any} context An optional shared context to be passed to all propagated method calls
     * @param {OneCtor} [ctor] The constructor used to create the recursively created Ones.This parameter is used internally;
     * no need to supply an argument.
     * @constructor
     */
    function One(many, recursive, context, ctor) {
        this.many = many;
        this.recursive = recursive, this.ctor = ctor;
        this.context = context || {};
    }
    ;
    /**
     * Gets corresponding properties from all the objects in many
     *
     * @param {string | number | symbol | null} [prop]
     * @param {boolean} [forceArray]
     * @returns {any[]|One}
     */
    One.prototype.get = function (prop, forceArray) {
        var results = [];
        var length = this.many.length;
        if (prop !== undefined && prop !== null) {
            for (var i = 0; i < length; i++)
                results.push(this.many[i][prop]);
        }
        else {
            for (var i = 0; i < length; i++)
                results.push(this.many[i]);
        }
        var args = [results, this.recursive, this.context];
        return (this.recursive) && !forceArray ? (this.ctor) ? this.ctor.apply(this, __spreadArray(__spreadArray([], args, false), [this.ctor], false)) : new (One.bind.apply(One, __spreadArray([void 0], args, false)))() : results;
    };
    ;
    /**
     * Sets corresponding property values in the objects in many.
     * 'values' are treated similarly to 'args' in the call method.
     *
     * @param {string | number | symbol | null} [prop]
     * @param {any[]} [values]
     */
    One.prototype.set = function (prop, values) {
        if (values === undefined)
            return this.set(prop, this.get(prop, true));
        // simply reset existing values, probably to trigger proxy handlers or setters
        var length = this.many.length;
        var j = values.length;
        if (prop !== undefined && prop !== null) {
            for (var i = 0; i < length; i++)
                this.many[i][prop] = values[Math.min(i, j - 1)];
        }
        else {
            for (var i = 0; i < length; i++)
                this.many[i] = values[Math.min(i, j - 1)];
        }
    };
    ;
    /**
     * Delete the property from all objects in many.
     *
     * @param {string | number | symbol} prop
     */
    One.prototype.delete = function (prop) {
        for (var _i = 0, _a = this.many; _i < _a.length; _i++) {
            var many = _a[_i];
            delete many[prop];
        }
    };
    ;
    /**
     * Calls all the items in many (if method is not specified) or the
     * corresponding methods in many (if  method is specified).
     *
     * args will be (or be coerced into) an array of argument for
     * corresponding items in many:
     *
     * args = [many1Args, many2Args, many3Args, ...].
     *
     * When One is created with the one function, the outer array can
     * be omitted in the calls since there is no explicit need to
     * secify a method in this case (it is infered by the wrapping proxy)
     *
     *
     * @param {any[]} args
     * @param {string | number | symbol} [method]
     * @returns {any[]}
     */
    One.prototype.call = function (args, method) {
        var _a, _b;
        if (args === undefined)
            args = [[]];
        var results = [];
        var length = this.many.length;
        var j = args.length;
        var iArgs, result;
        if (method !== undefined) {
            for (var i = 0; i < length; i++) {
                iArgs = args[Math.min(i, j - 1)] || [];
                result = (_a = this.many[i])[method].apply(_a, __spreadArray(__spreadArray([], iArgs, false), [this.context], false));
                results.push(result);
            }
        }
        else {
            for (var i = 0; i < length; i++) {
                iArgs = args[Math.min(i, j - 1)] || [];
                result = (_b = this.many)[i].apply(_b, __spreadArray(__spreadArray([], iArgs, false), [this.context], false));
                results.push(result);
            }
        }
        return results;
    };
    ;
    return One;
}());
exports.One = One;
// nb: need to fix the issue with Symbol index.
