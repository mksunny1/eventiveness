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


class Actribute {
    registry = {};          // component instances are added here

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
     * @param {*} props 
     * @param {*} compAttr 
     */
    constructor(props, compAttr) {
        this.props = props || {};
        this.compAttr = compAttr || 'c-';
    };
    /**
     * Registers a function as a component bearing the given name.
     * The components can thus be referenced in processed markup using 
     * the name.
     * 
     * @param {*} name 
     * @param {*} component 
     */
    register(name, component) {
        this.registry[name] = component;
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
     * @param {*} node 
     * @param {*} props 
     */
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

export { Actribute };
