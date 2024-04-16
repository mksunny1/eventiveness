import { createTree } from '../src/apriori.js';
import { apply, setEventListener, querySelectorAll, preventDefault, stopPropagation,  parentSelector, matchEventListener} from '../src/domitory.js';

function _random(max) {return Math.round(Math.random() * 1000) % max;}
const adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
const colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
const nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];

apply({
    'tbody': table => {
        let startIndex = 0, maxStartIndex = 0;

        function buildData(count) {
            let lbl;
            let markup = '';
            const minI = maxStartIndex + 1, maxI = count + maxStartIndex + 1;
            for (let i = minI; i < maxI; i++) {
                lbl = adjectives[_random(adjectives.length)] + " " + colours[_random(colours.length)] + " " + nouns[_random(nouns.length)];
                markup += `<tr><td class='col-md-1'>${i}</td><td class='col-md-4'><a class='lbl'>${lbl}</a></td><td class='col-md-1'><a class='remove'><span class='remove glyphicon glyphicon-remove' aria-hidden='true'></span></a></td><td class='col-md-6'></td></tr>`;
            }
            table.append(createTree(markup));
            startIndex += count;
            maxStartIndex += count;
        }

        function clear() {startIndex = 0; table.innerHTML = ''}

        const removeListener = (e) => {
            const node = parentSelector(e.target, 'tr');
            node.parentNode.removeChild(node);
            startIndex -= 1;
        }

        let selected;
        matchEventListener('click', {
            'a.lbl': e => {
                const node = parentSelector(e.target, 'tr');
                if (node === selected) selected.classList.toggle( 'danger');
                else {
                    if (selected) selected.className = '';
                    node.className = 'danger';
                    selected = node;
                }
            },
            'span.remove': [removeListener, {before: [preventDefault, stopPropagation]}]
        }, table);

        function runN(n) { clear(); buildData(n); }
        const btnListener = (fn) => btn => setEventListener(btn, 'click', fn);

        apply({
            '#run': btnListener(() => runN(1000)),
            '#runlots': btnListener(() => runN(10000)),
            '#add': btnListener(() => buildData(1000)),
            '#update': btnListener(() => {
                const children = Array.from(querySelectorAll('a.lbl', table));
                const length = children.length;
                const data = [];
                for (let i = 0; i < length; i += 10) data.push(children[i].textContent);
                for (let [index, value] of data.entries()) children[index * 10].textContent = value + ' !!!';
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
