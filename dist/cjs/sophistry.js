'use strict';

class Sophistry {
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
    process(root, replace) {
        const cssStyleSheets = [];
        if ((root instanceof HTMLLinkElement && root.getAttribute('rel') === 'stylesheet') || (root instanceof HTMLStyleElement)) {
            const name = root.getAttribute('s-ophistry') || root.getAttribute('href') || hash(root.outerHTML);
            if (this.context.hasOwnProperty(name) && !replace)
                cssStyleSheets.push(this.context[name]);
            else {
                let st, st2;
                if (this.context.hasOwnProperty(name)) {
                    st2 = this.context[name];
                    st = st2.css;
                }
                else {
                    if (root instanceof HTMLLinkElement) {
                        st = new CSSStyleSheet();
                        fetch(root.getAttribute('href')).then(r => r.text()).then(t => st.replaceSync(t));
                    }
                    else if (root instanceof HTMLStyleElement) {
                        st = new CSSStyleSheet(); // root.sheet will not work if style has not been added to DOM!!!
                        st.replaceSync(root.textContent);
                    }
                    st2 = new SophistryStyleSheet(st);
                    this.context[name] = st2;
                }
                cssStyleSheets.push(st2);
            }
            root.parentNode?.removeChild(root);
        }
        else {
            let node = root.children[0], node2;
            while (node) {
                node2 = node.nextElementSibling;
                cssStyleSheets.push(...this.process(node, replace));
                node = node2;
            }
        }
        return cssStyleSheets;
    }
    ;
    /**
     * Import a stylesheet defined in an external CSS file.
     *
     * @param {string} link
     * @param {boolean} [replace]
     * @returns {SophistryStyleSheet}
     */
    import(link, replace) {
        if (this.context.hasOwnProperty(link) && !replace)
            return this.context[link];
        else {
            const st = new CSSStyleSheet();
            const st2 = new SophistryStyleSheet(st);
            this.context[link] = st2;
            fetch(link).then(r => r.text()).then(t => st.replaceSync(t));
            return st2;
        }
    }
    ;
    /**
     *
     * @param {string} name
     * @param {string} css
     * @returns
     */
    set(name, css) {
        if (this.context.hasOwnProperty(name))
            this.context[name].css.replaceSync(css);
        else {
            const st = document.createElement('style');
            st.innerText = css;
            this.context[name] = new SophistryStyleSheet(st);
        }
        return this.context[name];
    }
    ;
}
const hash = (str) => {
    let newHash = 0, chr;
    for (let i = 0, len = str.length; i < len; i++) {
        chr = str.charCodeAt(i);
        newHash = (newHash << 5) - newHash + chr;
        newHash |= 0; // convert to 32 bit int.
    }
    return newHash;
};
class SophistryStyleSheet {
    css;
    /**
     * Creates a new CSS stylesheet which contains convenient methods
     * for styling and 'unstyling' elements.
     *
     * @param {CSSStyleSheet} cssStyleSheet
     * @constructor
     */
    constructor(cssStyleSheet) { this.css = cssStyleSheet; }
    /**
     * Adds the CSSStylesheets to the given documents.
     * @param  {...T} elements
     */
    style(...elements) {
        let root;
        const allElements = [];
        for (let element of elements) {
            if (element instanceof DocumentFragment)
                allElements.push(...Array.from(element.children));
            else
                allElements.push(element);
        }
        for (let element of allElements) {
            if (!(element instanceof Document) && !(element instanceof ShadowRoot)) {
                const childNodes = Array.from(element.childNodes);
                root = element.shadowRoot || element.attachShadow({ mode: 'open' });
                element.innerHTML = '';
                root.append(...childNodes);
            }
            else
                root = element;
            if (!root.adoptedStyleSheets?.includes(this.css))
                root.adoptedStyleSheets = [...(root.adoptedStyleSheets || []), this.css];
        }
    }
    ;
    /**
     * Removes the stylesheets from the documents
     * @param {...T} elements
     */
    remove(...elements) {
        let root;
        const allElements = [];
        for (let element of elements) {
            if (element instanceof DocumentFragment)
                allElements.push(...Array.from(element.children));
            else
                allElements.push(element);
        }
        for (let element of allElements) {
            root = element.shadowRoot || element;
            if (root.adoptedStyleSheets.includes(this.css))
                root.adoptedStyleSheets.splice(root.adoptedStyleSheets.indexOf(this.css));
        }
    }
}
/**
 * Wraps a CSSStyleSheet with a SophistryStyleSheet
 * @param {CSSStyleSheet} cssStyleSheet
 * @returns
 */
function wrap(cssStyleSheet) {
    return new SophistryStyleSheet(cssStyleSheet);
}

exports.Sophistry = Sophistry;
exports.SophistryStyleSheet = SophistryStyleSheet;
exports.wrap = wrap;
