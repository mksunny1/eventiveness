import { apriori, apply, setEventListener, querySelectorAll, eventivity, applyAll, preventDefault, stopPropagation} from '../src/eventiveness.js';

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
    'tbody': table => {
        const myEventivity = eventivity();
        const handler = myEventivity.handler();
        const event = myEventivity.event();
        const object = myEventivity.object;

        let startIndex = 0, maxStartIndex = 0;

        handler.add($ => addRows($.args));   

        function buildData(count) {
            let data = [];
            for (let i = 0; i < count; i++) {
                data.push(adjectives[_random(adjectives.length)] + " " + colours[_random(colours.length)] + " " + nouns[_random(nouns.length)]);
            }
            event.add(data);
            startIndex += count;
            maxStartIndex += count;
        }

        function clear() {startIndex = 0; table.innerHTML = ''}

        function setValues(labels, data, nodes) {
            const length = data.length;
            let label, index;
            for (let i = 0; i < length; i++) {
                label = labels[i];
                index = maxStartIndex + i + 1;
                nodes[i].firstElementChild.textContent = index;
                label.textContent = data[i];
            }
        }

        function addRows(data) {
            const newRows = [];
            for (let i = 0; i < data.length; i++) {
                newRows.push(rowTemplate());
            }
            table.append(...newRows);

            const removeListener = (e, node) => node.parentNode.removeChild(node);
            
            const selectKey = {};

            applyAll({
                '.lbl': labels => {
                    labels = labels.slice(startIndex);
                    setValues(labels, data, newRows);
                    setEventListener(labels.map((lbl, i) => [lbl, newRows[i]]), 'click', (lbl, node) => {
                        object.event([node, node.classList.toggle( 'danger')], selectKey);
                        object.handler([$ => {
                            if ($.args[0] !== node) node.className = '';
                        }, selectKey], selectKey);
                    }, {before: [stopPropagation]});
                },
                'span.remove': rems => {
                    setEventListener(rems.slice(startIndex).map((rem, i) => [rem, newRows[i]]), 
                    'click', removeListener, {before: [preventDefault, stopPropagation]});
                }
            }, table);
            return newRows;
        }

        function runN(n) { clear(); buildData(n); }
        const btnListener = (fn) => btn => setEventListener(btn, 'click', fn);

        apply({
            '#run': btnListener(() => runN(1000)),
            '#runlots': btnListener(() => runN(10000)),
            '#add': btnListener(() => buildData(1000)),
            '#update': btnListener(() => {
                const children = Array.from(querySelectorAll('.lbl', table));
                for (let child of children) child.textContent += ' !!!';
            }),
            '#clear': btnListener(clear),
            '#swaprows': btnListener(() => {
                const children = Array.from(table.children);
                const length = children.length;
                const c1 = children[1], c998 = children[998];
                const c2 = c1.nextSibling, c999 = c998.nextSibling;
                
                if (length > 998) {
                    if (c999) table.insertBefore(c1, c999)
                    else table.appendChild(c1);
                    table.insertBefore(c998, c2);
                }
            })
        });
    }
});
