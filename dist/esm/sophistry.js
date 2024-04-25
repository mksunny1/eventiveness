class Sophistry {
    context = {};
    /**
     * Processes and 'pops' all style tags within the passed root. 
     * Ensures that the same CSSStyleSheet can be reused across trees instead of 
     * duplicated even when they have been created declaratively in the trees. 
     * 
     * If replace is given, any cached stylesheets with the same name as a 
     * styleshhet within the root will be replaced (reactively).
     * 
     * This resolves the stated issue with adding encapsulated styles to 
     * elements when using shadow dom as described here; 
     * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM.
     * 
     * @param {*} root 
     * @param {*} replace 
     * @returns 
     */
    process(root, replace) {
        const cssStyleSheets = [];
        if (root instanceof HTMLStyleElement || (root instanceof HTMLLinkElement && root.getAttribute('rel') === 'stylesheet')) {
            const name = root.getAttribute('s-ophistry') || root.getAttribute('href') || hash(root.textContent);
            if (this.context.hasOwnProperty(name) && !replace) cssStyleSheets.push(this.context[name]);
            else {
                let st, st2;
                if (this.context.hasOwnProperty(name) ) {
                    st2 = this.context[name];
                    st = st2.self;
                } else {
                    st = new CSSStyleSheet();
                    st2 = new SophistryStyleSheet(st);
                    this.context[name] = st2;
                }
                cssStyleSheets.push(st2);
                if (root instanceof HTMLStyleElement) st.replaceSync(root.textContent);    // style element
                else fetch(root.getAttribute('href')).then(r => r.text()).then(t => st.replaceSync(t));   // link element
            }
        } else {
            let node = root.children[0], node2;
            while (node) {
                node2 = node.nextElementSibling;
                cssStyleSheets.push(...this.process(node, replace));
                if (node instanceof HTMLStyleElement || (root instanceof HTMLLinkElement && root.getAttribute('rel') === 'stylesheet')) root.removeChild(node);
                node = node2;
            }
        }
        return cssStyleSheets;
    };
    /**
     * Import a stylesheet defined in an external CSS file.
     * 
     * @param {*} link 
     * @param {*} replace 
     * @returns 
     */
    import(link, replace) {
        if (this.context.hasOwnProperty(link) && !replace) return this.context[link];
        else {
            const st = new CSSStyleSheet();
            const st2 = new SophistryStyleSheet(st);
            this.context[link] = st2;
            fetch(link).then(r => r.text()).then(t => st.replaceSync(t));
            return st2;
        }
    };
    /**
     * 
     * @param {*} name 
     * @param {*} css 
     * @returns 
     */
    set(name, css) {
        if (this.context.hasOwnProperty(name)) this.context[name].css.replaceSync(css);
        else {
            const st = document.createElement('style');
            st.innerText = css;
            this.context[name] = new SophistryStyleSheet(st);
        }
        return this.context[name];
    };
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

class SophistryStyleSheet{
    /**
     * Creates a new CSS stylesheet which contains convenient methods 
     * for styling and 'unstyling' elements.
     * 
     * @param {*} cssStyleSheet 
     */
    constructor(cssStyleSheet) {this.css = cssStyleSheet;}
    /**
     * Adds the CSSStylesheets to the given documents.
     * @param  {...any} documents 
     */
    style(...documents) {
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

/**
 * Wraps a CSSStyleSheet with a SophistryStyleSheet
 * @param {*} cssStyleSheet 
 * @returns 
 */
function wrap(cssStyleSheet) {
    return new SophistryStyleSheet(cssStyleSheet);
}

export { Sophistry, SophistryStyleSheet, wrap };
