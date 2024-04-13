import { apriori, apply, addEventListener, eventivity, applyAll, preventDefault, stopPropagation } from '../src/eventiveness.js';

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
        let startIndex = 0;

        handler.add($ => addRows($.args));   

        function buildData(count) {
            let data = [];
            for (let i = 0; i < count; i++) {
                data.push(adjectives[_random(adjectives.length)] + " " + colours[_random(colours.length)] + " " + nouns[_random(nouns.length)]);
            }
            event.add(data);
            startIndex += count;
        }

        function clear() {startIndex = 0; table.innerHTML = ''}

        const values = new WeakMap();
        function setValues(nodes, data, append, labels) {
            const length = data.length;
            let label
            if (labels) {
                for (let i = 0; i < length; i++) {
                    label = labels[i];
                    label.textContent = (!append)? data[i]: label.textContent + data[i];
                    values.set(nodes[i], label);
                }
            } else {
                for (let i = 0; i < length; i++) {
                    label = values.get(nodes[i]);
                    label.textContent = (!append)? data[i]: label.textContent + data[i];
                }
            }
        }

        function addRows(data) {
            const newRows = [];
            for (let i = 0; i < data.length; i++) {
                newRows.push(rowTemplate());
            }
            table.append(...newRows);

            const removeListener = (e, node) => node.parentNode.removeChild(node);

            applyAll({
                '.lbl': labels => {
                    setValues(newRows, data, false, labels.slice(startIndex));
                },
                'span.remove': rems => {
                    addEventListener(rems.slice(startIndex).map((rem, i) => [rem, newRows[i]]), 
                    'click', removeListener, {before: [preventDefault, stopPropagation]});
                }
            }, table);
            return newRows;
        }

        function runN(n) { clear(); buildData(n); }
        const btnListener = (fn) => btn => addEventListener(btn, 'click', fn);

        apply({
            '#run': btnListener(() => runN(1000)),
            '#runlots': btnListener(() => runN(10000)),
            '#add': btnListener(() => buildData(1000)),
            '#update': btnListener(() => {
                const children = Array.from(table.children);
                const length = children.length;
                let tenth = [], data = [], child;
                for (let i = 0; i < length; i += 10) {
                    child = children[i];
                    tenth.push(child); data.push(' !!!');
                }
                setValues(tenth, data, true);
            }),
            '#clear': btnListener(clear),
            '#swaprows': btnListener(() => {
                const children = Array.from(table.children);
                const length = children.length;
                if (length > 998) {
                    setValues([children[1], children[998]], 
                        [values.get(children[998]).textContent, values.get(children[1]).textContent]);
                }
            })
        });
    }
});
