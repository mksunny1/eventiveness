/**
 * Returns a function which can processes and 'pop' all script tags within its 'root' argument. 
 * Ensures that the same CSSStyleSheet can be reused reused across trees instead of 
 * duplicated even when they have been created declaratively in the tree. This resolves the stated 
 * issue with adding styles to encapsulated elements when using shadow dom as described here; 
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM.
 * 
 * See the attached example (account.html and account.js) for how it is used in practice.
 * 
 */
export function sophistry() {
    const context = {};
    const result = (root, replace) => runSophistry(root, context, replace);
    result.import = (link) => importStyle(link, context);
    result.set = (key, str) => setStyle(key, str, context);
    result.styles = context;
    return result;
}

function setStyle(key, str, context) {
    if (context.hasOwnProperty(key)) context[key].self.replaceSync(str);
    else {
        const st = document.createElement('style');
        st.innerText = str;
        context[key] = new sophistry.StyleSheet(st);
    }
    return context[key];
}

function runSophistry(root, context, replace) {
    const css = [];
    if (root instanceof HTMLStyleElement || (root instanceof HTMLLinkElement && root.getAttribute('rel') === 'stylesheet')) {
        const hash = root.getAttribute('o-name') || root.getAttribute('href') || sophistry.hash(root.textContent);
        if (context.hasOwnProperty(hash) && !replace && !root.hasAttribute('o-replace')) css.push(context[hash]);
        else {
            let st, st2;
            if (context.hasOwnProperty(hash) ) {
                st2 = context[hash];
                st = st2.self;
            } else {
                st = new CSSStyleSheet();
                st2 = new (sophistry.StyleSheet)(st);
                context[hash] = st2;
            }
            css.push(st2);
            if (root instanceof HTMLStyleElement) st.replaceSync(root.textContent);    // style element
            else fetch(root.getAttribute('href')).then(r => r.text()).then(t => st.replaceSync(t));   // link element
        }
    } else {
        let node = root.children[0];
        let node2;
        while (node) {
            node2 = node.nextElementSibling;
            css.push(...runSophistry(node, context, replace));
            if (node instanceof HTMLStyleElement || (root instanceof HTMLLinkElement && root.getAttribute('rel') === 'stylesheet')) root.removeChild(node);
            node = node2;
        }
    }
    return css;
}


const importStyle = function(link, context) {
    if (context.hasOwnProperty(link)) return context[link];
    else {
        const st = new CSSStyleSheet();
        const st2 = new (sophistry.StyleSheet)(st);
        context[link] = st2;
        fetch(link).then(r => r.text()).then(t => st.replaceSync(t));
        return st2;
    }
}

sophistry.hash = (str) => {
    let hash = 0;
    let chr;
    for (let i = 0, len = str.length; i < len; i++) {
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;    // convert to 32 bit int.
    }
    return hash;
};

sophistry.StyleSheet = class{
    constructor(self) {
        this.self = self;
    }
    /**
     * Adds the CSSStylesheets to the given documents.
     * @param  {...any} documents 
     */
    style(...documents) {
        let st;
        for (let document of documents) {
            if (!document.adoptedStyleSheets?.includes(this.self)) document.adoptedStyleSheets = [...(document.adoptedStyleSheets || []), this.self];
        }
    };
    /**
     * Removes the stylesheets from the documents
     * @param {*} documents 
     */
    remove(...documents) {
        let st;
        for (let document of documents) {
            if (document.adoptedStyleSheets.includes(this.self)) document.adoptedStyleSheets.splice(document.adoptedStyleSheets.indexOf(this.self));
        }
    }
}

