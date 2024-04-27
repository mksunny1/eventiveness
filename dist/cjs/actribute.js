'use strict';

var tslib_es6 = require('./tslib.es6-CC9N89Ys.js');

/**
 * This is a module that was designed to be a dropin replacement for extending built-in elements. It is supposed to be
 * 1. more widely supported (safari does not support 'is' attribute)
 * 2. more concise and flexible :you can register and unregister components and you can attach multiple components to the same element..
 * 3. easier to pass down props in markup without looking ugly.
 *
 * The usage pattern is similar to using 'is' attribute but here the attributes name the components and the values
 * are the names of props to pass to them along with the element.
 *
 * We have not created examples yet for this.
 *
 */
var Actribute = /** @class */ (function () {
    // component instances are added here
    /**
     * Construct a new Actribute instance with the fallback props and
     * attribute prefix.
     *
     * When it is used to process markup, attributes with names starting
     * with compAttr ('c-' by default) are assumed to be component specifiers.
     * A component specifier is of the form [compAttr][componentName]="[propertyName] [propertyName] ..."
     *
     * When a component specifier is encountered, the component (registerd with the
     * 'register' method) will be invoked with the element and any specified
     * properties as arguments.
     *
     * The props object passed to this initializer behave like a global
     * from which component props may be obtained if they are not found in
     * the props object passed to the 'process' method.
     *
     * @param {any} props
     * @param {string} compAttrPrefix
     * @constructor
     */
    function Actribute(props, compAttrPrefix) {
        this.registry = {};
        this.props = props || {};
        this.compAttr = compAttrPrefix || 'c-';
    }
    /**
     * Registers a function as a component bearing the given name.
     * The components can thus be referenced in processed markup using
     * the name.
     *
     * Returns the same actribute to support chaining.
     *
     * @param {string} name
     * @param {Function} component
     * @returns {Actribute}
     */
    Actribute.prototype.register = function (name, component) {
        this.registry[name] = component;
        return this;
    };
    /**
     * Recursively processes the node to identify and apply components.
     *
     * At elements where any components are encountered, the components
     * are called with the element and any specified props. The decendants
     * are not processed.
     *
     * At elements without a component, the descendants are processed
     * recursively.
     *
     * Returns the same actribute to support call chaining.
     *
     * @param {HTMLElement} element
     * @param {any} props
     * @returns {Actribute}
     */
    Actribute.prototype.process = function (element, props) {
        var _a;
        var compProps = [], comp, propKey, propVal, foundAllProps, processed = false;
        for (var _i = 0, _b = Array.from(element.attributes); _i < _b.length; _i++) {
            var _c = _b[_i], name_1 = _c.name, value = _c.value;
            if (name_1.startsWith(this.compAttr)) {
                processed = true;
                comp = name_1.substring(this.compAttr.length);
                if (this.registry.hasOwnProperty(comp)) {
                    compProps = [];
                    foundAllProps = true;
                    value = value.trim();
                    if (value) {
                        for (var _d = 0, _e = value.split(' '); _d < _e.length; _d++) {
                            propKey = _e[_d];
                            propKey = propKey.trim();
                            if (!propKey)
                                continue; // just too much space between prop names/keys.
                            propVal = props[propKey] || this.props[propKey];
                            if (propVal !== undefined)
                                compProps.push(propVal);
                            else {
                                foundAllProps = false;
                                break;
                            }
                        }
                    }
                    if (foundAllProps) {
                        (_a = this.registry)[comp].apply(_a, tslib_es6.__spreadArray([element], compProps, false));
                    }
                    else {
                        console.error("Some properties were not found for the component \"".concat(comp, ".\""));
                        break; // break so we know where it stopped.
                    }
                }
                else {
                    console.error("The component  \"".concat(comp, "\" was not found in the registry."));
                    break; // break so we know where the error occured (instead of printing the element).
                }
            }
        }
        if (!processed)
            for (var _f = 0, _g = Array.from(element.children); _f < _g.length; _f++) {
                _g[_f];
                this.process(element, props);
            }
        return this;
    };
    return Actribute;
}());

exports.Actribute = Actribute;
