# Eventiveness

This is bunch of tiny abstractions created with the goal of simplifying the developement of highly interactive web frontends using vanilla HTML, CSS and JavasSript. Everything is exactly the way they look and there is no hidden magic. The framework consists of 7 independent libraries which tackle unique concerns in front-end development. We avoid repeating standard functions in the JavaScript language and instead focus on new primitives which complement and enhance them. After reading this guide to the framework along with their inline documentation and the attached examples, there is nothing left to learn except more standard HTML, CSS and JavaScript.


## The Libraries


1. **Apriori**

Apriori caters to things related to building the DOM, including template creation, template rendering and document tree building. All the exports are async by default, so that the DOM can be built with either in-page resources or dynamically loaded ones. This gives us the flexibility to choose whatever works best for a project. 

In preveous versions this concern was handled by 2 libraries: apriori and arender. Now they have been merged and the API has become more intuitive and stable.


2. **Sophistry**

Sophistry will help with scoping styles whether or not we use shadow DOM. The library provides an API which simplifies the code needed to scope declaratively written styles to specific elements.


3. **OneToMany**

OneToMany enables a simple and explicit form of 'reactivity' where we perform an operation on one object which propagates the effects to many objects. It has been found to be a more versatile abstraction than *eventivity* released in previous versions and therefore replaces it. 

OneToMany provides methods for getting and setting properties on multiple objects in addition to methods for invoking multiple functions and object methods.


4. **Appliance**

Appliance provides a powerful declarative API for manipulating the DOM and for structuring code, providing functionality that matches the benefits of building DOM JavaScript components, but without many of the limitations. For instance, this also matches and exceeds the benefits of hydration because the document can be created anywhere and with any technology available; there is no need for JavaScript on the backend. 

**Accessibility** (both for users and for devs).

Appliance also exposes some new `selectors` for style rules and contaaining elements.

This library used to be a part of *domitory* released earlier, but now the concerns have become more distinctive.


5. **Domitory**


Domitory is all about DOM event handlers. It exposes API for simplifying and better structuring efficient event handler code. For example, some handlers create long-running tasks (like promises) and need to briefly 'disable' the DOM until the tasks finish. Some handlers take advantage of event bubbling to increase efficiency of the code. Domitory is meant to provide useful abstractions for simplifying the code in these instances.


6. **Actribute**

Actribute provides a more widely supported, flexible and powerful alternative to extending built-in HTML elements, exposing an using similar API.


7. **Generational**

Generation is a tiny new addition to the library stack which is intended to provide useful generator functionality to, simplify JavaScript code, reduce memory footprint and improve performance. The first export is the elusive `range` generator for JavaScript. You are welcome.


## Installation

```npm i eventiveness```

Alternatively, simply clone this repository into your projects that do not use npm dependencies and import any libraries you like from your JavaScript modules using relative paths.


## Usage

1. **Apriori**

Import apriori:
```js
    import { apriori, asyncLiteral as A, asyncTemplate, createTree, LastingFragment } from "eventiveness/apriori";
```

Create a 'raw' async template literal:
```js
    const text = await A`This text will be returned only after ${Promise.resolve("I")} get resolved `;
```

Create an async template literal from existing text:
```js
    const str = 'This text ${arg1} be returned only after ${arg2} get resolved';       // not a template literal.
    const template = asyncTemplate(str, ['arg1', 'arg2']);  // now a template literal wrapped with a function for reuse.
    const renderedA = template('will', Promise.resolve("I"));
    const renderedB = template('shall', Promise.resolve("we"));
```

Create view factories:
```js
    const viewFactory = await apriori(fetch('html-fragment.html'), true);
    const args = [1, 2, 3];
    const differentViews = [viewFactory(), viewFactory(...args)];
```

Create DOM trees:
```js
    const tree = createTree(`
        <h3>Component Label</h3>
        <Article>What's  in this component</article>
    `);
    
```

Create lasting fragments (they won't lose their children on you):
```js
    const view = new LastingFragment(tree);
    document.body.append(view.get());   
    // view  does not lose its tree here
    
    view.remove();     
    // view can still act powerfully over its tree!
```


2. **Sophistry**

Import sophistry:
```js
    import { sophistry, importStyle, setStyle, wrap } from 'eventiveness/sophistry'
```

Initialize your sophistry (context for processing and storing stylesheets):
```js
    const mySophistry = sophistry();
```

Encapsulate stylesheets:
```js
    const element = (await apriori(`
    <div>
        <p>I have encapsulated styles</p>
        <style>/* encapsulatedd styles */</style>
    </div>
    `)).tree;
    const styles = mySophistry(element); 
    // the styles will get popped here.
    
    for (let style of styles) style.style(element, document.body.firstElementChild);  
    // uses adopted stylesheets.
```

Import stylesheets with encapsulation:
```js
    const myLinkStyle = importStyle('./my-style-link.css', mySophistry.context, true);
```

Reuse existing stylesheets:
```js
    const myStyleAlready = mySophistry.context.already;
```

Update or create a stylesheet (Any elements that adopted it will *react naturally*):
```js
    settStyle('myStyle', 'p {font-size: 1000em;}', mySophistry.context);
```

Wrap CSS stylesheet with Sophistry stylesheet (this is important!):
```js
    const SSS = wrap(CSS);
```

Replace stylesheets (nothing will react please):
```js
    mySophistry.context.styeName = SSS;
```

Remove stylesheet from elements (track them yourself):
```js
    const elements = [element, document.body.firstElementChild];
    SSS.remove(...elements);
```

Remove stylesheet from sophistry:
```js
    delete mySophistry.context.styeName;
```

3. **Onetomany**

Import onetomany:
```js
    import { One, one, unWrap } from 'eventiveness/onetomany';
```

Call multiple functions:
```js
    const f1 = (...args) => console.log(args) || 'I ran!';
    const f2 = (...args) => console.log(args) || 'I also ran';

    const fOne = new One([f1, f2]);    
    // use the class for functions.

    // Call with different sets of args
    fOne.call([['f1', 'f1'], ['f2', 'f2', 2]]);   

    // Call with the smae set of args
    fOne.call([['f1-2', 'f1-2']]);   

    // Call with no args
    fOne.call();
```

Call multiple methods:
```js
    const arr1 = [];
    const arr2 = [];

    const aOne = one([arr1, arr2]);  
    // prefer the factory for members

    // Call with different sets of args
    aOne.push([[1, 2, 3, 4, 5], ['a', 'b', 'c']]);   

    // Call with the smae set of args
    aOne.push([[1, 2, 3, 4, 5, 6, 7]]);   

    // Call with no args.
    aOne.pop();
```

Get, set and delete multiple properties:
```js
    const obj1 = [p: 1];
    const obj2 = [p: 2];

    const oOne = one([obj1, obj2]);  
    // prefer the factory for members

    // Set with different sets of args
    oOne.q = [[1, 2, 3, 4, 5], ['a', 'b', 'c']];   

    // Set with the smae set of args
    oOne.r = [[1, 2, 3, 4, 5, 6, 7]];

    // Get props.
    const ps = oOne.p;

    // delete props
    oOne.delete('r');

```


4. **Appliance**

Import appliaces:
```js
    import { apply, set, createRange } from 'eventiveness/onetomany';
```

Set up components (it is more performant to do things in bulk):
```js
    function app(component) {
        const btnListener = (fn) => btn => btn.addEventListener('click', fn);

        apply({
            '#run': btnListener(() => component.create(1000)),
            '#runlots': btnListener(() => component.create(10000)),
            '#add': btnListener(() => component.append(1000)),
            '#update': btnListener(() => component.update()),
            '#clear': btnListener(() => component.clear()),
            '#swaprows': btnListener(() => component.swap())
        });
    }
```

Update components:
```js
    function setFirstSpansInMain(at, values) {
        set('span:first-child', at, {textContent: values, className: values}, document.body.children[1]);
    }
```


Create a range (one line is better than 3):
```js
    const main = document.body.children[1];
    const powerfulRange = createRange(main.children[4], main.children[9]);
```


5. **Domitory**

Import domitory:
```js
    import { onEnter, eventListener, preventDefault, stopPropagation, matchEventListener } from 'eventiveness/domitory';
```

Compose a handler:
```js
    const form = window.form;
    apply({
        input: input => { 
            input.onkeyup = eventListener([onEnter, () => login(input.value), preventDefault]);
        },
    }, form);
```

Use a shared running context (the handlers *and their long-running tasks* run mutually exclusively):
```js
    function app(component) {
        const exclusiveRunContext = {};
        const btnListener = (fn) => btn => btn.addEventListener('click', eventListener(fn, exclusiveRunContext));

        apply({
            '#run': btnListener(() => component.create(1000)),
            '#runlots': btnListener(() => component.create(10000)),
            '#add': btnListener(() => component.append(1000)),
            '#update': btnListener(() => component.update()),
            '#clear': btnListener(() => component.clear()),
            '#swaprows': btnListener(() => component.swap())
        });
    }
```

'Meta' handlers based on event bubbling (thank you krausest benhmarks!):
```js
    function select(element) {/* selection code */}
    main.addEventListener('click', matchEventListener({
        'a.lbl': e => select(e.target.parentNode.parentNode),
        'span.remove': eventListener([removeListener, preventDefault, stopPropagation], {})
    }));
```


6. **Actribute**

Import actribute:
```js
    import { actribute } from 'eventiveness/actribute';
```

Initialize actribute:
```js
    const fallbackProps = {prop1: 'Fallback', prop4: 'Last resort'};
    const {comp, act} = actribute(fallbackProps);
```

Register components:
```js
    act.register('comp1', (node, prop1) => node.textContent = prop1);
    act.register('comp2', (node, prop2) => node.style.left = prop2);
```

Use components:
```html
    <main>
        <section o-comp1="prop1"  o-comp2="prop2" >
            First section
        </section>
        <section o-comp3  o-comp4="prop2" >
            Second section
        </section>
    </main>
```

Process components:
```js
    comp(document.body, {a: 1, b: 2});
```

Unregister components:
```js
  delete act.registry.comp2;
```


7. **Generational**

Import generational:
```js
    import { range } from 'eventiveness/generational';
```

Create a range:
```js
    for (let i of range(100)) console.log(i);
```


## Contributing

If you like the concept and/or the direction of Eventiveness framework, please contribute to this project. Contribution starts with a simple starring of this repository. Next you can start or join discussions about this project, here or anywhere. You can contribute some of your use-cases to the list of examples. You can still help improve the documentation, complete the site (eventivejs.com),  
consolidate features and fix bugs. There is still a long development journey ahead for this library.

Another really cool way to contribute is to sponsor the project. You can sponsor the project as a 'thank you' or as a way of showing your support for the direction we have chosen and giving Eventivity the best opportunity to thrive. 

Thank you for contributing.


## Ongoing Work

Increasing test coverage  and improving the documentation. The API is now stable.

