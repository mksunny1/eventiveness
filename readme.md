# Eventiveness
This is a bunch of tiny abstractions created with the goal of simplifying the developement of interactive web frontends using vanilla HTML, CSS and JavasSript. Everything is the way they look and there is no hidden magic. The framework consists of 7 independent libraries which tackle unique concerns in front-end development. We avoid repeating standard functions in JavaScript and focus on new primitives which complement and enhance them. After reading this guide, the API docs and playing with a few examples (included in the docs folder), there is nothing left to learn except more standard HTML, CSS and JavaScript.


## The Libraries

1. **Apriori**
    Apriori is about things related to building the DOM, including template creation, template rendering and document tree building. There are primitives for building the DOM with either in-page resources or dynamically loaded ones. This gives us the flexibility to choose whatever works best for a project. 

    *Note: In preveous versions this concern was handled by 2 libraries: apriori and arender. Now they have been merged and the API has become more intuitive and stable.*


2. **Sophistry**
    Sophistry will help with scoping declaratively written styles to specific elements. The library provides an API which simplifies the code needed for such scoping. It will internally create open shadow roots where necessary. It also maintains a cache to avoid reloading or re-processing the same styles (unless we request these).


3. **OneToMany**
    OneToMany enables a simple and explicit form of 'reactivity' where we perform an operation on one object which propagates the effects to many objects. OneToMany provides methods for getting and setting properties on multiple objects in addition to methods for invoking multiple functions and object methods.

    *Note: OneToMany was found to be a cleaner and more versatile abstraction than Eventivity released in some previous versions and therefore replaces it.*


4. **Appliance**
    Appliance provides a powerful declarative API for manipulating the DOM and for structuring code, providing functionality that matches the benefits of building JavaScript components, but without many of the limitations. We apply component logic through 'hydration' because the documents can be created anywhere and with any technology available. There is no need for JavaScript on the backend. 

    This model is also good for accessibility (both for users and for devs). Frameworks that limit the use of HTML, CSS and even JavaScript miss out out on big advancements in these technologies in many areas, accessibility being a prime example. It takes a lot to replace natural behavior of the browser with JavaScript code and attempting to do this will bloat the codebase without offering much in return.
    
    Appliance also exposes some new `selectors` for style rules and contaaining elements.

    *Note: This library used to be a part of *domitory* released earlier, but now the concerns have become more distinctive.*


5. **Domitory**
    Domitory is all about DOM event handlers. It exposes API for simplifying and better structuring efficient event handler code. For example, some handlers create long-running tasks (like promises) and need to briefly 'disable' the DOM until the tasks finish. Some handlers take advantage of event bubbling to increase efficiency of the code. Domitory is meant to provide useful abstractions for simplifying the code in these scenarios.


6. **Actribute**
    Actribute provides a more widely supported, flexible and powerful alternative to extending built-in HTML elements, using a similar API. 

    *Note: This library should be considered less mature than the others, because it has not been used as much. Currently it exists as a Proof of Concept.*


7. **Generational**
    Generational is a tiny new addition to the stack which is intended to provide useful generator functionality to: simplify JavaScript code, reduce memory footprint and improve performance. The first export is the elusive `range` generator for JavaScript. You are welcome.


## Installation
```npm i eventiveness```

Alternatively, clone this repository into your projects that do not use npm dependencies and import any libraries you like from your JavaScript modules using relative paths. Note that Eventiveness is more of a namespace than a library or framework. The real libraries are the 7 described earliear and you should import from those modules (as shown in the usage section).


## Usage

### Apriori
Import apriori:
```js
    import { get, tag, template, asyncTemplate, createFragment, LastingFragment } from "eventiveness/apriori";
```

Create a 'raw' async template literal:
```js
    const text = await tag`This text will be returned only after ${Promise.resolve("I")} get resolved `;
```

Create an async template literal from existing text (such as text dynamically loaded from HTML files):
```js
    const str = 'This text ${arg1} be returned only after ${arg2} get resolved';       
    // not a template literal.

    const at = asyncTemplate(str, ['arg1', 'arg2']);  
    // now a template literal wrapped with a function for reuse.

    const renderedA = at('will', Promise.resolve("I"));   
    // returns 'This text will be returned only after I get resolved'

    const renderedB = at('shall', Promise.resolve("we"));
    // returns 'This text shall be returned only after we get resolved'
```

Create view factories:
```js
    const viewFactory = template(await get('html-fragment.html'), ['arg']);
    const args = [1, 2, 3];
    const differentViews = [viewFactory(args[0]), viewFactory(args[1])];
```

Create DOM trees:
```js
    const tree = createFragment(`
        <h3>Component Label</h3>
        <article>What's in this component</article>
    `);
    // returns a fragment with 2 children: h3 and article

    const element = createFragment(`
        <article>What's in this component</article>
    `);
    // returns the article element. the fragment is unnecessary if it 
    // has only 1 child, therefore the child is returned instead.
    
```

Create lasting fragments (they will not lose their children on you):
```js
    const lasting = new LastingFragment(tree);
    document.body.append(lasting.get());   
    // view  does not lose its tree here
    
    lasting.remove();     
    // view can still act powerfully over its nodes. Here it removes them from their containing elements.
```

Note that the fragment nodes can be added to different elements but still remain a part of the same fragment, creating many interesting possibilities.


### Sophistry
Import sophistry:
```js
    import { Sophistry, wrap } from 'eventiveness/sophistry'
```

Initialize your sophistry (context for processing and storing stylesheets):
```js
    const mySophistry = new Sophistry();
```

Encapsulate stylesheets:
```js
    const element = (await apriori(`
    <div>
        <p>I have encapsulated styles</p>
        <style>/* encapsulatedd styles */</style>
    </div>
    `)).tree;
    const styles = mySophistry.process(element); 
    // the styles will get popped here.

    document.body.append(element);
    // you must add elements to the DOM before styling. browsers 
    // do not allow styling otherwise.
    
    for (let style of styles) style.style(element, document.body.firstElementChild);  
    // uses adopted stylesheets. If the element is not a document (main document or shadow root), one will be created in this call as necessary..
```

Import stylesheets which can be applied to elements:
```js
    const myLinkStyle = mySophistry.import('./my-style-link.css', true);
    myLinkStyle.style(element);
```

Reuse existing stylesheets:
```js
    const myStyleAlready = mySophistry.context.already;
    for (let element of tree) myLinkStyle.style(element);
```

Update or create a stylesheet (Any elements that adopted an updated stylesheet will *react naturally*):
```js
    mySophistry.set('./my-style-link.css', (await get('new-style-link.css', true)) || 'p {font-size: 1000em;}');
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

### Onetomany
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
    aOne.push([1, 2, 3, 4, 5], ['a', 'b', 'c']);   

    // Call with the smae set of args
    aOne.push([1, 2, 3, 4, 5, 6, 7]);   

    // Call with no args.
    aOne.pop();
```


The reactive functions can communicate via a context object:
```js
    const f1 = (...args, context) => console.log(args) || context.text = 'I ran!';
    const f2 = (...args, context) => console.log(args) || console.log(context.text  + ' and I also ran');

    const fOne = new One([f1, f2]);    
    // use the class for functions.

    // Call with different sets of args
    fOne.call([['f1', 'f1'], ['f2', 'f2', 2]]);   

    // Call with the smae set of args
    fOne.call([['f1-2', 'f1-2']]);   

    // Call with no args
    fOne.call();
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


### Appliance
Import appliaces:
```js
    import { apply, set, createRange } from 'eventiveness/onetomany';
```

Set up components (it is more performant to do things in bulk):
```js
    function app(footerComponent) {
        apply({
            header: (...headers) => SSS.style(...headers),
            footer: footerComponent   
            // footerComponent will take care of footers.
        }, document.body, false);  
        // both document.body and false are the sensible defaults, so the 
        // action is the same as if we omit them.
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


### Domitory
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


### Actribute
Import actribute:
```js
    import { Actribute } from 'eventiveness/actribute';
```

Initialize actribute:
```js
    const fallbackProps = {prop1: 'Fallback', prop4: 'Last resort'};
    const act = new Actribute(fallbackProps);
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
    act.process(document.body, {prop2: 1, prop3: 2});
```

Unregister components:
```js
  delete act.registry.comp2;
```


### Generational
Import generational:
```js
    import { range } from 'eventiveness/generational';
```

Create a range:
```js
    for (let i of range(100)) console.log(i);
```


*Note: To get a good feel for how eventiveness pans out in practice, have a look at the included examples in the repository. you can play wit them by running the included server with `npm start` and then pointing your browser to the link 'http://localhost:8000/docs/examples/index.html'.*


## Contributing
If you like the concept and/or the direction of Eventiveness, feel free to contribute to this project. You can contribute however you want. You can star this repository. You can start or join discussions about the project, here or anywhere. You can contribute some of your use-cases to the list of examples. You can help improve the documentation or complete the site (domitoryjs.com). You can contribute to issues and pull requests. There is still a long development journey ahead for this library. The normal requirement of positiveness and courtesy goes without saying.

Another cool way to contribute is to sponsor the project. You can sponsor us as a 'thank you' or as a way of showing your support for the direction we have chosen and giving Eventiveness the best opportunity to thrive. 

Thank you for contributing.


## Ongoing work
- Improving test coverage.
- Ongoing general maintenance.


