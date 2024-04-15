import { apriori } from '../src/apriori.js';
import { apply, setEventListener, matchEventListener, querySelectorAll, applyAll, preventDefault, stopPropagation, parentSelector, querySelector} from '../src/domitory.js';
import { eventivity } from '../src/eventivity.js';


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
        const handler = myEventivity.handler;
        const event = myEventivity.event;

        let startIndex = 0, maxStartIndex = 0;

        handler($ => addRows($[0])).handleAll('add');   

        function buildData(count) {
            let data = [];
            for (let i = 0; i < count; i++) {
                data.push(adjectives[_random(adjectives.length)] + " " + colours[_random(colours.length)] + " " + nouns[_random(nouns.length)]);
            }
            event(data).raiseAll('add');
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
                querySelector('td', nodes[i]).textContent = index;
                label.textContent = data[i];
            }
        }

        const removeListener = (e) => {
            const node = parentSelector(e.target, 'tr');
            node.parentNode.removeChild(node);
            startIndex -= 1;
        }

        matchEventListener('click', {
            'a.lbl': e => {
                const node = e.target.parentNode.parentNode;
                event(node, node.classList.toggle( 'danger')).raiseAll('select');
                handler($ => {if ($[0] !== node) node.className = '';}).handle('select');
            },
            'span.remove': [removeListener, {before: [preventDefault, stopPropagation]}]
        }, table);

        function addRows(data) {
            const newRows = [];
            for (let i = 0; i < data.length; i++) newRows.push(rowTemplate());
            table.append(...newRows);
            
            applyAll({
                '.lbl': labels => {
                    labels = labels.slice(startIndex);
                    setValues(labels, data, newRows);
                    newRows.length = 0;
                }
            }, table);
        }

        function runN(n) { clear(); buildData(n); }
        const btnListener = (fn) => btn => setEventListener(btn, 'click', fn);

        apply({
            '#run': btnListener(() => runN(1000)),
            '#runlots': btnListener(() => runN(10000)),
            '#add': btnListener(() => buildData(1000)),
            '#update': btnListener(() => {
                const children = Array.from(querySelectorAll('.lbl', table));
                const length = children.length;
                for (let i = 0; i < length; i += 10) children[i].textContent += ' !!!';
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
