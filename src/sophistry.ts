
export class Sophistry {
    context = {};
    /**
     * Processes and 'pops' all style tags within the passed root. 
     * Ensures that the same CSSStyleSheet can be reused across document trees (maindocument 
     * and shadow roots) instead of duplicated even when they have been 
     * created declaratively in the trees. 
     * 
     * If replace is given, any cached stylesheets with the same name as a 
     * styleshhet within the root will be replaced (reactively).
     * 
     * This resolves the stated issue with adding encapsulated styles to 
     * elements when using shadow dom as described here; 
     * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM.
     * 
     * @param {T} root 
     * @param {boolean} [replace] 
     * @returns {SophistryStyleSheet[]}
     */
    process<T extends Element>(root: T, replace?: boolean): SophistryStyleSheet[] {
        const cssStyleSheets: SophistryStyleSheet[] = [];
        if ((root instanceof HTMLLinkElement && root.getAttribute('rel') === 'stylesheet') || (root instanceof HTMLStyleElement)) {
            const name = root.getAttribute('s-ophistry') || root.getAttribute('href') || hash(root.textContent || '');
            if (this.context.hasOwnProperty(name) && !replace) cssStyleSheets.push(this.context[name]);
            else {
                let st, st2;
                if (this.context.hasOwnProperty(name) ) {
                    st2 = this.context[name];
                    st = st2.css;
                } else {
                    if (root instanceof HTMLLinkElement) {
                        st = new CSSStyleSheet();
                        fetch(root.getAttribute('href') as string).then(r => r.text()).then(t => st.replaceSync(t));
                    } else if (root instanceof HTMLStyleElement) {
                        st = root.sheet;
                    }
                    st2 = new SophistryStyleSheet(st);
                    this.context[name] = st2;
                }
                cssStyleSheets.push(st2);
            }
        } else {
            let node: Element | null = root.children[0], node2: Element | null;
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
     * @param {string} link 
     * @param {boolean} [replace]
     * @returns {SophistryStyleSheet}
     */
    import(link: string, replace?: boolean): SophistryStyleSheet {
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
     * @param {string} name 
     * @param {string} css 
     * @returns 
     */
    set(name: string, css: string): SophistryStyleSheet {
        if (this.context.hasOwnProperty(name)) this.context[name].css.replaceSync(css);
        else {
            const st = document.createElement('style');
            st.innerText = css;
            this.context[name] = new SophistryStyleSheet(st);
        }
        return this.context[name];
    };
}


const hash = (str: string) => {
    let newHash = 0, chr;
    for (let i = 0, len = str.length; i < len; i++) {
        chr = str.charCodeAt(i);
        newHash = (newHash << 5) - newHash + chr;
        newHash |= 0;    // convert to 32 bit int.
    }
    return newHash;
};

export class SophistryStyleSheet{
    css: CSSStyleSheet;
    /**
     * Creates a new CSS stylesheet which contains convenient methods 
     * for styling and 'unstyling' elements.
     * 
     * @param {CSSStyleSheet} cssStyleSheet 
     * @constructor
     */
    constructor(cssStyleSheet: any) {this.css = cssStyleSheet;}
    /**
     * Adds the CSSStylesheets to the given documents.
     * @param  {...any} documents 
     */
    style<T extends (Document|ShadowRoot)>(...documents: T[]) {
        for (let document of documents) {
            if (!document.adoptedStyleSheets?.includes(this.css)) document.adoptedStyleSheets = [...(document.adoptedStyleSheets || []), this.css];
        }
    };
    /**
     * Removes the stylesheets from the documents
     * @param {*} documents 
     */
    remove<T extends (Document|ShadowRoot)>(...documents: T[]) {
        for (let document of documents) {
            if (document.adoptedStyleSheets.includes(this.css)) document.adoptedStyleSheets.splice(document.adoptedStyleSheets.indexOf(this.css));
        }
    }
}

/**
 * Wraps a CSSStyleSheet with a SophistryStyleSheet
 * @param {CSSStyleSheet} cssStyleSheet 
 * @returns 
 */
export function wrap(cssStyleSheet: CSSStyleSheet) {
    return new SophistryStyleSheet(cssStyleSheet);
}
