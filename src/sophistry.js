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
    const result = (root, replace) => run(root, context, replace);
    result.import = (link) => importStyle(link, context);
    result.set = (key, str) => setStyle(key, str, context);
    result.context = context;
    return result;
}

export function setStyle(key, str, context) {
    if (context.hasOwnProperty(key)) context[key].css.replaceSync(str);
    else {
        const st = document.createElement('style');
        st.innerText = str;
        context[key] = new SophistryStyleSheet(st);
    }
    return context[key];
}

export function run(root, context, replace) {
    const cssStyleSheets = [];
    if (root instanceof HTMLStyleElement || (root instanceof HTMLLinkElement && root.getAttribute('rel') === 'stylesheet')) {
        const rootHash = root.getAttribute('s-ophistry') || root.getAttribute('href') || hash(root.textContent);
        if (context.hasOwnProperty(rootHash) && !replace) cssStyleSheets.push(context[rootHash]);
        else {
            let st, st2;
            if (context.hasOwnProperty(rootHash) ) {
                st2 = context[rootHash];
                st = st2.self;
            } else {
                st = new CSSStyleSheet();
                st2 = new SophistryStyleSheet(st);
                context[rootHash] = st2;
            }
            cssStyleSheets.push(st2);
            if (root instanceof HTMLStyleElement) st.replaceSync(root.textContent);    // style element
            else fetch(root.getAttribute('href')).then(r => r.text()).then(t => st.replaceSync(t));   // link element
        }
    } else {
        let node = root.children[0], node2;
        while (node) {
            node2 = node.nextElementSibling;
            cssStyleSheets.push(...run(node, context, replace));
            if (node instanceof HTMLStyleElement || (root instanceof HTMLLinkElement && root.getAttribute('rel') === 'stylesheet')) root.removeChild(node);
            node = node2;
        }
    }
    return cssStyleSheets;
}


export const importStyle = function(link, context, replace) {
    if (context.hasOwnProperty(link) && !replace) return context[link];
    else {
        const st = new CSSStyleSheet();
        const st2 = new SophistryStyleSheet(st);
        context[link] = st2;
        fetch(link).then(r => r.text()).then(t => st.replaceSync(t));
        return st2;
    }
}

const hash = (str) => {
    let newHash = 0, chr;
    for (let i = 0, len = str.length; i < len; i++) {
        chr = str.charCodeAt(i);
        newHash = (newHash << 5) - newHash + chr;
        newHash |= 0;    // convert to 32 bit int.
    }
    return newHash;
};

export class SophistryStyleSheet{
    constructor(cssStyleSheet) {this.css = cssStyleSheet;}
    /**
     * Adds the CSSStylesheets to the given documents.
     * @param  {...any} documents 
     */
    style(...documents) {
        let st;
        for (let document of documents) {
            if (!document.adoptedStyleSheets?.includes(this.css)) document.adoptedStyleSheets = [...(document.adoptedStyleSheets || []), this.css];
        }
    };
    /**
     * Removes the stylesheets from the documents
     * @param {*} documents 
     */
    remove(...documents) {
        for (let document of documents) {
            if (document.adoptedStyleSheets.includes(this.css)) document.adoptedStyleSheets.splice(document.adoptedStyleSheets.indexOf(this.css));
        }
    }
}

export function wrap(cssStyleSheet) {
    return new SophistryStyleSheet(cssStyleSheet);
}
