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
        const o = myEventivity.object;

        function clear() {
            table.innerHTML = '';
        }

        function buildData(count) {
            let item;
            for (let i = 0; i < count; i++) {
                item = adjectives[_random(adjectives.length)] + " " + colours[_random(colours.length)] + " " + nouns[_random(nouns.length)];
                const t = rowTemplate();
                event.add([item, t]);
            }
        }

        function setText(node, text) {
            apply({
                '.lbl': lbl => {
                    lbl.textContent = text;
                }
            }, node);
        }

        let c = 0;
        function row(item, node) {
            // this function is like a component and we can make it as 
            // simple or as complex as we want.
            // implemented this way so that we could change mappings 
            // without recreating nodes.
            // console.log(c++);
            apply({
                '.lbl': lbl => {
                    lbl.textContent = item;
                },
                '.remove': rem => {
                    addEventListener(rem, 'click', () => {
                        console.log('Called');
                        node.parentNode.removeChild(node);
                    }, true, true);
                }
            }, node);
            return node;
        }

        handler.add($ => {
            // here the handler is used largely for raf (request animation frame)
            table.appendChild(row(...$.args));
        });   // , {raf: true});

        function runN(n) {
            clear();
            buildData(n);
        }

        apply({
            '#run': btn => {
                addEventListener(btn, 'click', () => runN(1000));
            },
            '#runlots': btn => {
                addEventListener(btn, 'click', () => runN(10000));
            },
            '#add': btn => {
                addEventListener(btn, 'click', () => {
                    buildData(1000);
                });
            },
            '#update': btn => {
                addEventListener(btn, 'click', () => {
                    const children = Array.from(table.children);
                    const length = children.length;
                    let child;
                    for (let i = 0; i < length; i+= 10) {
                        child = children[i];
                        setText(child, child.textContent + ' !!!');
                    }
                });
            },
            '#clear': btn => {
                addEventListener(btn, 'click', clear);
            },
            '#swaprows': btn => {
                addEventListener(btn, 'click', () => {
                    const children = Array.from(table.children);
                    const length = children.length;
                    if (length > 998) {
                        const temp = children[1].textContent;
                        setText(children[1], children[998].textContent);
                        setText(children[998], temp);
                    }
                });
            }
        });
    }
});
