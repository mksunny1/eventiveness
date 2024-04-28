/**
 * Creates a One object which transmits a call, method dispatch, property
 * get or set applied to the 'one' object to the 'many' objects.
 *
 * The recursive arg is used to ensure that getting properties always
 * wraps the array results with `one` also.
 *
 * The context arg will be passed to all delegated calls. A new object
 * is created if it is not provided.
 *
 * @example
 *
 *
 * @param {any[]} many An array of objects to delegat actios to
 * @param {boolean} [recursive] Whether to return One instances in `get` calls
 * @param {any} [context] Shared context for the 'many' functions or object methods
 * @returns
 */
function one(many, recursive, context) {
    return new Proxy(new One(many, recursive, context, one), oneTrap);
}
const PURE = Symbol();
/**
 * Return a 'pure' One from a proxied One.
 *
 * @param one
 * @returns
 */
function unWrap(one) {
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
/**
 * An object which delegates actions on it to other objects
 *
 * @example
 *
 *
 */
class One {
    /**
     * The many objects this One delegates to.
     */
    many;
    /**
     * Whether this One will return other 'One's in calls to `get`.
     */
    recursive;
    /**
     * The constructor function used for creating new 'One's in calls to `get`.
     */
    ctor;
    /**
     * The context shared by the many functions or methods of the objects in many.
     * They all receive it as their last argument.
     */
    context;
    /**
     * Creates a new One instance for propagating operations to all the items
     * in many.
     *
     * @param {any[]} many The many objects or functions this One will delegate to.
     * @param {boolean} [recursive] Whether to wrap the arrays returned by `get` with another One.
     * @param {any} context An optional shared context to be passed to all propagated method or function calls
     * @param {OneConstructor} [ctor] The constructor used to create the `get` Ones. This parameter is used internally;
     * no need to supply an argument.
     *
     * @example
     *
     *
     * @constructor
     */
    constructor(many, recursive, context, ctor) {
        this.many = many;
        this.recursive = recursive, this.ctor = ctor;
        this.context = context || {};
    }
    ;
    /**
     * Gets corresponding properties from all the objects in many. If this is
     * a recursive One and forceArray is falsy, the array result will be
     * used as the 'many' argument in a call to this.ctor and the created One
     * is returned instead of the array.
     *
     * @example
     *
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
     * @example
     *
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
     * @example
     *
     *
     * @param {string | number | symbol} prop
     */
    delete(prop) {
        for (let many of this.many)
            delete many[prop];
    }
    ;
    /**
     * Calls all the items in many (if method is not specified) or their
     * corresponding methods (if  method is specified). All the calls will
     * receive `this.context` as their final arguments to enable communication.
     *
     * args can be specified as follows:
     * `[[a1, a2], [a1, a2], [a1, a2]]`
     *
     * If `this.many` has 3 items, they will receive their own args. If there
     * are more items in `this.many`, they will all get the last provided args array
     * (here the one passed to the third item).
     *
     * The `one` function wraps created 'One's with a proxy to allow methods
     * to be called directly on them. Assuming we want to pass the same args
     * as above to such a method, the call will look like:
     *
     * `object.method([a1, a2], [a1, a2], [a1, a2])`.
     *
     * There is no need to wrap with the outer array in such cases.
     *
     * Call returns an array containing the return values of the individual
     * calls to many items.
     *
     * @example
     *
     *
     * @param {any[]} args The function or method arguments
     * @param {string | number | symbol} [method] The name of a method to call.
     * A function call is assumed if not specified.
     *
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

export { One, one, unWrap };
