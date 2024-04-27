'use strict';

var tslib_es6 = require('./tslib.es6-CC9N89Ys.js');

var Sophistry = /** @class */ (function () {
    function Sophistry() {
        this.context = {};
    }
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
    Sophistry.prototype.process = function (root, replace) {
        var cssStyleSheets = [];
        if ((root instanceof HTMLLinkElement && root.getAttribute('rel') === 'stylesheet') || (root instanceof HTMLStyleElement)) {
            var name_1 = root.getAttribute('s-ophistry') || root.getAttribute('href') || hash(root.textContent || '');
            if (this.context.hasOwnProperty(name_1) && !replace)
                cssStyleSheets.push(this.context[name_1]);
            else {
                var st_1, st2 = void 0;
                if (this.context.hasOwnProperty(name_1)) {
                    st2 = this.context[name_1];
                    st_1 = st2.css;
                }
                else {
                    if (root instanceof HTMLLinkElement) {
                        st_1 = new CSSStyleSheet();
                        fetch(root.getAttribute('href')).then(function (r) { return r.text(); }).then(function (t) { return st_1.replaceSync(t); });
                    }
                    else if (root instanceof HTMLStyleElement) {
                        st_1 = root.sheet;
                    }
                    st2 = new SophistryStyleSheet(st_1);
                    this.context[name_1] = st2;
                }
                cssStyleSheets.push(st2);
            }
        }
        else {
            var node = root.children[0], node2 = void 0;
            while (node) {
                node2 = node.nextElementSibling;
                cssStyleSheets.push.apply(cssStyleSheets, this.process(node, replace));
                if (node instanceof HTMLStyleElement || (root instanceof HTMLLinkElement && root.getAttribute('rel') === 'stylesheet'))
                    root.removeChild(node);
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
    Sophistry.prototype.import = function (link, replace) {
        if (this.context.hasOwnProperty(link) && !replace)
            return this.context[link];
        else {
            var st_2 = new CSSStyleSheet();
            var st2 = new SophistryStyleSheet(st_2);
            this.context[link] = st2;
            fetch(link).then(function (r) { return r.text(); }).then(function (t) { return st_2.replaceSync(t); });
            return st2;
        }
    };
    /**
     *
     * @param {string} name
     * @param {string} css
     * @returns
     */
    Sophistry.prototype.set = function (name, css) {
        if (this.context.hasOwnProperty(name))
            this.context[name].css.replaceSync(css);
        else {
            var st = document.createElement('style');
            st.innerText = css;
            this.context[name] = new SophistryStyleSheet(st);
        }
        return this.context[name];
    };
    return Sophistry;
}());
var hash = function (str) {
    var newHash = 0, chr;
    for (var i = 0, len = str.length; i < len; i++) {
        chr = str.charCodeAt(i);
        newHash = (newHash << 5) - newHash + chr;
        newHash |= 0; // convert to 32 bit int.
    }
    return newHash;
};
var SophistryStyleSheet = /** @class */ (function () {
    /**
     * Creates a new CSS stylesheet which contains convenient methods
     * for styling and 'unstyling' elements.
     *
     * @param {CSSStyleSheet} cssStyleSheet
     * @constructor
     */
    function SophistryStyleSheet(cssStyleSheet) {
        this.css = cssStyleSheet;
    }
    /**
     * Adds the CSSStylesheets to the given documents.
     * @param  {...T} documents
     */
    SophistryStyleSheet.prototype.style = function () {
        var _a;
        var documents = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            documents[_i] = arguments[_i];
        }
        var root;
        for (var _b = 0, documents_1 = documents; _b < documents_1.length; _b++) {
            var document_1 = documents_1[_b];
            if (!(document_1 instanceof Document) && !(document_1 instanceof ShadowRoot)) {
                Array.from(document_1.childNodes);
                root = document_1.attachShadow({ mode: 'open' });
                root.innerHTML = '<slot></slot>';
            }
            else
                root = document_1;
            if (!((_a = root.adoptedStyleSheets) === null || _a === void 0 ? void 0 : _a.includes(this.css)))
                root.adoptedStyleSheets = tslib_es6.__spreadArray(tslib_es6.__spreadArray([], (root.adoptedStyleSheets || []), true), [this.css], false);
        }
    };
    /**
     * Removes the stylesheets from the documents
     * @param {*} documents
     */
    SophistryStyleSheet.prototype.remove = function () {
        var documents = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            documents[_i] = arguments[_i];
        }
        for (var _a = 0, documents_2 = documents; _a < documents_2.length; _a++) {
            var document_2 = documents_2[_a];
            if (document_2.adoptedStyleSheets.includes(this.css))
                document_2.adoptedStyleSheets.splice(document_2.adoptedStyleSheets.indexOf(this.css));
        }
    };
    return SophistryStyleSheet;
}());
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
