import { apriori, apply, addEventListener, eventivity } from '../src/eventiveness.js';

function _random(max) {
    return Math.round(Math.random() * 1000) % max;
}

const rowTemplate = await apriori(`
    <tr>
        <td class='col-md-1'></td>
        <td class='col-md-4'><a class='lbl'></a></td>
        <td class='col-md-1'>
            <a class='remove'>
                <span class='remove glyphicon glyphicon-remove' aria-hidden='true'></span>
            </a>
        </td>
        <td class='col-md-6'></td>
    </tr>
`);

const adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
const colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
const nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];

apply({
    '.table': table => {
        const myEventivity = eventivity();
        const handler = myEventivity.handler();
        const event = myEventivity.event();

        handler.add($ => table.appendChild(row(...$.args)) , {raf: true});   
        
        function buildData(count) {
            let item;
            for (let i = 0; i < count; i++) {
                item = adjectives[_random(adjectives.length)] + " " + colours[_random(colours.length)] + " " + nouns[_random(nouns.length)];
                event.add([item, rowTemplate()]);
            }
        }

        function clear() {table.innerHTML = ''}

        const values = new WeakMap();
        function setValue(node, text) {
            values.set(node, text);
            apply({'.lbl': lbl => lbl.textContent = text}, node);
        }
        const getValue = (node) => values.get(node);

        function row(item, node) {
            setValue(node, item);
            apply({
                '.remove': rem => {
                    addEventListener(rem, 'click', () => {
                        console.log('Called');
                        node.parentNode.removeChild(node);
                    }, true, true);
                }
            }, node);
            return node;
        }

        function runN(n) { clear(); buildData(n); }
        const listener = (fn) => btn => addEventListener(btn, 'click', fn);

        apply({
            '#run': listener(() => runN(1000)),
            '#runlots': listener(() => runN(10000)),
            '#add': listener(() => buildData(1000)),
            '#update': listener(() => {
                const children = Array.from(table.children);
                const length = children.length;
                let child;
                for (let i = 0; i < length; i+= 10) {
                    child = children[i];
                    setValue(child, getValue(child) + ' !!!');
                }
            }),
            '#clear': listener(clear),
            '#swaprows': listener(() => {
                const children = Array.from(table.children);
                const length = children.length;
                if (length > 998) {
                    const temp = getValue(children[1]);
                    setValue(children[1], getValue(children[998]));
                    setValue(children[998], temp);
                }
            })
        });
    }
});
