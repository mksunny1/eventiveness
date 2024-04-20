/**
 * Wraps a node to present an array-like API for dealing with its children.
 * Most array methods relevant to onetomany use-cases (which are the 
 * originally intended use-cses) have been implemented. Other array methods 
 * will also be implemented if they are later found to be relevant here.
 * 
 * There will often be need to override some behaviors in this class, such 
 * as using the set method to set some fields within the existing node at 
 * the index instead of replacing it with a new node. Thus why this 
 * class is exported and the exported functions have the cls parameter.
 * 
 */
export const indirector = {
    unshift(...items) {
        let first = (this.arrayProp === 'children')? this.node.firstElementChild: this.node.firstChild;
        if (!first) this.node.append(...items);
        else {
            let item;
            for (let i = items.length - 1; i >= 0; i--) {
                item = items[i];
                this.node.insertBefore(items[i], first);
                first = item
            }
            new Element.insertAdjacentElement()
        }
    },
    pop() {
        const last = (this.arrayProp === 'children')? this.node.lastElementChild: this.node.lastChild;
        if (last) this.node.removeChild(last);
        return last;
    },
    shift() {
        let first = (this.arrayProp === 'children')? this.node.firstElementChild: this.node.firstChild;
        if (first) this.node.removeChild(first);
        return first;
    },
    splice(start, deleteCount, ...items) {
        const arr = this.node[this.arrayProp];
        let key = arr[start];;
        
        while (deleteCount) {
            this.node.removeChild(key);
            deleteCount -= 1;
            start += 1;
            key = arr[start];
        }

        let item;
        for (let i = items.length - 1; i >= 0; i--) {
            item = items[i];
            this.node.insertBefore(items[i], key);
            key = item
        }
    },
    /**
     * Notice the special behavior here because DOM elements can only 
     * exist in one place at any given time in the DOM.
     * 
     * @param {*} item 
     * @param {*} index 
     */
    set(parent, value, index, prop) {
        if (value.parentNode === parent) parent.replaceChild(document.createElement('template'), value);
        parent.replaceChild(value, parent[prop || 'children'][index]);
    }
}

/**
 * Wraps the indirector object with a proxy to expose a similar 
 * get/set API as objects and arrays.
 * 
 * Returns both the proxied Indirector and the original Indirector 
 * in an array.
 * 
 * @param {*} node 
 * @param {*} arrayProp 
 * @param {*} cls 
 */
export function indirector(node, arrayProp, cls) {
    const instance = new (cls || Indirector)(node, arrayProp);
    return [new Proxy(instance, proxyTrap), instance];
}

export const proxyTrap = {
    get(target, p) {
        return target.get(int(p));
    },
    set(target, p, value) {
        target.set(int(p), value);
        return true;
    }
}

/**
 * Exposes the node's childNodesin an array-like interface, so that we can 
 * use them in onetomany instances. This will be useful for tying nodes 
 * to array items, a common scenario in many web applications.
 * 
 * @param {*} node 
 * @param {*} cls 
 */
export function childNodes(node, cls) {
    return indirector(node, 'childNodes', cls);
}

/**
 * Exposes the node's children in an array-like interface, so that we can 
 * use them in onetomany instances. This will be useful for tying elements 
 * to array items, a common scenario in many web applications.
 * 
 * @param {*} node 
 * @param {*} cls 
 */
export function children(node, cls) {
    return indirector(node, 'children', cls);
}

