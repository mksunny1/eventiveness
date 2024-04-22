'use strict';

class Actribute {
    registry = {};          // component instances are added here
    constructor(props, attrs) {
        this.props = props || {};
        this.attrs = attrs || 'c-';
    };
    register(name, component) {
        this.registry[name] = component;
    };
    process(node, props) {
        let compProps = [], comp, propKey, propVal, foundAllProps, processed = false;
        for (let {attr, value} of node.attributes) {
            if (attr.startsWith(this.compAttr)) {
                processed = true;
                comp = attr.substring(this.compAttr.length);
                if (this.registry.hasOwnProperty(comp))  {
                    compProps = [];
                    foundAllProps = true;
                    value = value.trim();
                    if (value) {
                        for (propKey of value.split(' ')) {
                            propKey = propKey.trim();
                            if (!propKey) continue;     // just too much space between prop names/keys.
                            propVal = props[propKey] || this.props[propKey];
                            if (propVal !== undefined) compProps.push(propVal);
                            else {
                                 foundAllProps = false;
                                 break;
                            }
                        }
                    }
                    if (foundAllProps) {
                        this.registry[comp](node, ...compProps);
                    } else {
                        console.error(`Some properties were not found for the component "${comp}."`);
                        break;    // break so we know where it stopped.
                    }
                } else {
                    console.error(`The component  "${comp}" was not found in the registry.`);
                    break;    // break so we know where the error occured (instead of printing the element).
                }
            } 
        }

        if (!processed) for (child of node.children) this.process(node, props);

    }
}


/**
 * This is a module that was designed to be a dropin replacement for extending built-in elements. It is supposed to be 
 * 1. more widely supported (safari does not support 'is' attribute)
 * 2. more concise and flexible :you can register and unregister components and you can attach multiple components at once..
 * 3. easier to pass down props in markup without looking ugly.
 * 
 * The usage pattern is similar to using 'is' attribute but here the attributes name the components and the values 
 * are the names of props to pass to them along with the element.
 * 
 * We have not created examples yet for this yet.
 * 
 * @param {*} props 
 * @param {*} attrs 
 * @returns 
 */
function actribute(props, attrs) {
    const act = new Actribute(props, attrs);
    const comp = (node, props) => act.process(node, props);
    return {comp, act};
}

exports.actribute = actribute;
