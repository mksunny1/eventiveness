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
 * @param {any} context
 * @returns
 */
export function one(many, recursive, context) {
    return new Proxy(new One(many, recursive, context, one), oneTrap);
}
const PURE = Symbol();
/**
 * Return a 'pure' One from a proxied One.
 *
 * @param one
 * @returns
 */
export function unWrap(one) {
    return one[PURE] || one;
}
const oneTrap = {
    get(target, p) {
        if (p === PURE)
            return target;
        let result = target.get(p, true);
        if (result.length && typeof result[0] === 'function') {
            return (...args) => target.call(args, p);
        }
        else if (target.recursive) {
            if (target.ctor)
                return target.ctor(result, true, target.context, target.ctor);
            else
                return new One(result, true, target.context);
        }
        return result;
    },
    set(target, p, value) {
        target.set(p, value);
        return true;
    }
};
export class One {
    many;
    recursive;
    ctor;
    context;
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
    constructor(many, recursive, context, ctor) {
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
    get(prop, forceArray) {
        const results = [];
        const length = this.many.length;
        if (prop !== undefined && prop !== null) {
            for (let i = 0; i < length; i++)
                results.push(this.many[i][prop]);
        }
        else {
            for (let i = 0; i < length; i++)
                results.push(this.many[i]);
        }
        const args = [results, this.recursive, this.context];
        return (this.recursive) && !forceArray ? (this.ctor) ? this.ctor(...args, this.ctor) : new One(...args) : results;
    }
    ;
    /**
     * Sets corresponding property values in the objects in many.
     * 'values' are treated similarly to 'args' in the call method.
     *
     * @param {string | number | symbol | null} [prop]
     * @param {any[]} [values]
     */
    set(prop, values) {
        if (values === undefined)
            return this.set(prop, this.get(prop, true));
        // simply reset existing values, probably to trigger proxy handlers or setters
        const length = this.many.length;
        const j = values.length;
        if (prop !== undefined && prop !== null) {
            for (let i = 0; i < length; i++)
                this.many[i][prop] = values[Math.min(i, j - 1)];
        }
        else {
            for (let i = 0; i < length; i++)
                this.many[i] = values[Math.min(i, j - 1)];
        }
    }
    ;
    /**
     * Delete the property from all objects in many.
     *
     * @param {string | number | symbol} prop
     */
    delete(prop) {
        for (let many of this.many)
            delete many[prop];
    }
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
    call(args, method) {
        if (args === undefined)
            args = [[]];
        const results = [];
        const length = this.many.length;
        const j = args.length;
        let iArgs, result;
        if (method !== undefined) {
            for (let i = 0; i < length; i++) {
                iArgs = args[Math.min(i, j - 1)] || [];
                result = this.many[i][method](...iArgs, this.context);
                results.push(result);
            }
        }
        else {
            for (let i = 0; i < length; i++) {
                iArgs = args[Math.min(i, j - 1)] || [];
                result = this.many[i](...iArgs, this.context);
                results.push(result);
            }
        }
        return results;
    }
    ;
}
// nb: need to fix the issue with Symbol index.
