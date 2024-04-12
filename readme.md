# Eventiveness

This is bunch of tiny abstractions created with the goal of simplifying the developement of highly interactive web frontends using vanilla HTML, CSS and Javascript. Everything is exactly the way they look and there is no hidden magic. The framework consists of 5.5 independent libraries which tackle unique concerns in front-end development. We avoid repeating standard functions in the javascript language and instead focus on new primitives which complement and enhance them. After reading this guide to the framework along with their inline documentation and the attached examples (2), there is nothing left to learn except more standard HTML, CSS and Javascript.

## The Libraries

1. Arender

Arender is an async templating library which supports promises. Rendering will naturally await all interpolated promises 
before returning a result.

2. Apriori

Apriori is used to create template DOM trees out of things that can be converted to DOM trees, such as existing trees, 
markup or promises or functions that can return them. It is a convenient abstraction for avoiding repetitive coding.

3. Sophistry

Sophistry will help with scoping styles whether or not we use shadow DOM.

4. Eventivity

This is the main library of this framework. Eventivity enables simple and explicit reactivity by simply wrapping 
normal functions and statements with appropriate calls. See the usage notes.

5. Domitory

Domitory exports a set of pragmatic functions (and a class) for enhancing some traditional DOM apparatus. Some of these 
may likely be assimilated into the Javascript standard eventually.

6. Actribute

Actribute provides a more widely supported, flexible and powerful alternative to extending built-in HTML elements.

## Installation

```npm i eventiveness```

## Usage

1. Arender

```js
    import { arender } from "eventiveness.js";
    const template = arender("<div>${arg1}</div>${arg2}", ['arg1', 'arg2']);
    const renderedA = template('Arg 1a', Promise.resolve('Arg 2a'));
    const renderedB = template('Arg 1b', Promise.resolve('Arg 2b'));
```

2. Apriori

```js
    import { apriori } from 'eventiveness.js'
    const viewFactory = await apriori(fetch('html-fragment.html').then(r => r.text()));
    const differentViews = [viewFactory(), viewFactory()];
```

3. Sophistry

```js
    import { sophistry } from 'eventiveness.js'
    const mySophistry = sophistry();
    const element = (await apriori(`
    <div>
        <p>I have encapsulated styles</p>
        <style>/* encapsulatedd styles */</style>
    </div>
    `)).tree;
    const styles = mySophistry(element); // the styles get popped here.
    for (let style of styles) style.style(element);
```

4. Eventivity

```js
    import { eventivity } from 'eventiveness.js';
    const myEventivity = eventivity();
    const e = myEventivity.event();
    const h = myEventivity.handler();
    const handlerFunction = (...args) => 'I reacted!';
    h.eventName(handlerFunction);
    let variable;
    e.eventName(variable = 'handlerFunction' + 'RunsAfterMe!');
```

5. Domitory

```js
    import { Fragment, apply, onEnter, addEventListener } from 'eventiveness.js';

    const form = window.myForm;    // form with id myForm.

    apply({
        input: input => { 
            onEnter(input, () => login(input.value), true);
            apply({ 
                '#loginButton': button => { 
                    addEventListener(button, 'click', () => login(input.value));
                }
            }, form);
        }
    }, form);

```

6. Actribute

```js
import { actribute } from 'eventiveness.js';
const fallbackProps = {prop1: 'Fallback', prop4: 'Last resort'};
const {comp, act} = actribute(fallbackProps);
act.register('comp1', (node, prop1) => node.textContent = prop1);
act.register('comp2', (node, prop2) => node.style.left = prop2);
// ... other components.
delete act.registry.comp2;
```

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


## Contributing

If you like the concept and/or the direction of Eventiveness framework, please contribute to this project. Contribution starts with a simple starring of this repository. Next you can start or join discussions about this project, here or anywhere. You can contribute some of your use-cases to the list of examples. You can still help improve the documentation, complete the site (eventivejs.com),  
consolidate features and fix bugs. There is still a long development journey ahead for this library.

Another really cool way to contribute is to sponsor the project. You can sponsor the project as a 'thank you' or as a way of showing your support for the direction we have chosen and giving Eventivity the best opportunity to thrive. 

Thank you for contributing.

## Ongoing Work

Increasing the test coverage for the library and improving the documentation

