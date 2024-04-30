# Eventiveness

This is a group of 8 tiny abstractions created with the goal of simplifying the development of interactive web frontends using vanilla HTML, CSS and JavasSript. This is an inclusive library which caters to the needs of everyone in web development. 

- Frontend JavaScript developers can develop apps without worrying about control, modularity or maintainance. Not only is the framework flexible, modular and compact, it also strives to align with all the familiar semantics we know and love. You still retain the convenience of a declarative API.

- Distributed teams of frontend developers can work freely in their favourite languages without worrying about complexity. HTML experts can write pure HTML. JavaScript developers can write pure JavaScript. Designers can write pure CSS. Eventiveness will ensure that everything works well together once everyone follows the project specifications. Data can be injected into HTML in multiple ways and it is not compulsory to have code tags or component specifiers in markup. The same thing also applies to CSS encapsulation.

- Back-end developers using any technology can stop worrying about front-end complexity. Eventiveness ships modern ES6 modules which can be loaded directly into webpages. Because the framework is modular and compact, you only load the tiny modules you need into your pages. You can also compose them with your favourite back-end template engines to reduce the number of files to load. Finally, the [API](https://mksunny1.github.io/eventiveness/docs/api/) is semantic and minimal; it is very easy to pick up in a few hours.

- Ultimately users, which is another name for *all of us*, will benefit the most when all the industry practitioners have the right tools to be more productive and to perform at their best. HTML, JavaScript and CSS are amazinng technologies and we need to emphasize and consolidate this in modern web development.


Apart from this brief guide and the [API](https://mksunny1.github.io/eventiveness/docs/api/) documentation, there are also some examples which can be used to understand how the parts fit together and to develop a feel for using Eventiveness. If you want to see the output of the exmples, you can run the included server with `npm start` and visit the 'examples' site at http://localhost:8000/docs/examples/index.html. The site is also hosted online [here](https://mksunny1.github.io/eventiveness/docs/examples).


What follows is a brief description of the 8 libraries and how to include them in your projects.


## Appliance
Appliance provides a powerful declarative API for manipulating the DOM and for structuring code. It can be used to attach behavior to HTML elements easily and efficiently. At a basic level it can work work similarly to web components without needing to create the elements. This can produce big gains in accessibility and flexibility. When used in tandem with other powerful primitives like `domitory` and `onetomany`, appiance will also match and exceed advanced component and famework functionality, like data-binding, state management and lifecycle hooks. Some things like 'hydration' are even obtained for free.

![Appliance in action](https://github.com/mksunny1/eventiveness/tree/main/images/appliance.jpg?raw=true)


## Domitory
This provides a painless SQLesque API for manipulating the DOM. The library exports `insert`, `set`, `update` and `remove` (`delete` is a keyword in JavaScript) functions for bulk manipulation of things on the DOM. It is an efficient, consistent and simple API to use. See the examples and the API docs.

![Domitory in action](https://github.com/mksunny1/eventiveness/tree/main/images/domitory.jpg?raw=true)


## Eventivity
This library provides some useful primitives for simiplifying the code that must be included in every page where JavaScript is used to support interactivity. Most JavaScript code can only run in response to an event. Eventivity exports functions for:

- composing event handlers
- creating fewer event hanandlers by taking advantage of event bubbling
- disabling event firing until a running handler completes including handlers that use promises.
- creating handlers for specific key events, like enter.
- creating reusable handler guards to stop event handling at any point.

It is the uninteresting but relevant bits.

![Eventivity in action](https://github.com/mksunny1/eventiveness/tree/main/images/eventivity.jpg?raw=true)


## OneToMany
This is the API for 'reactivity'. OneToMany exports primitives to help us create and manipulate single objects which function as many objects. OneToMany provides methods for getting and setting properties on multiple objects and methods for invoking multiple functions and object methods. The library is simple, concise, explicit and transparent.

![OneToMany in action](https://github.com/mksunny1/eventiveness/tree/main/images/onetomany.jpg?raw=true)


## Apriori
This is a fun library to use if you need to build some or all of your DOM with the help of JavaScript. It includes primitives for template creation, template rendering and document tree building. There are primitives for building the DOM with either in-page resources or dynamically loaded ones. This gives us the flexibility to choose whatever works best for a project.

![Apriori in action](https://github.com/mksunny1/eventiveness/tree/main/images/apriori.jpg?raw=true)


## Sophistry
CSS is a crucial element of nearly every frontend on the web. It makes pages beautiful and improves UX for visual users. CSS is easy to include globally in any page. However, when localising styles with Shadow DOM (which is the officially supported method), one currently has to make the decision between writing duplicitive declarative styles vs writing JavaScript boilerplate to manage styles efficiently. Sophistry will help with efficiently scoping declaratively written styles to specific elements. The library provides an API which simplifies the code needed for such scoping. It will internally create open shadow roots where necessary and  maintains a cache to avoid reloading or re-processing the same styles (unless we request these). Sophistry can also draw styles from anywhere.

![Sophistry in action](https://github.com/mksunny1/eventiveness/tree/main/images/sophistry.jpg?raw=true)


## Generational
Generational exports some useful generators to improve performance and reduce memory footprint. The `range` and `items` generators have been especially useful in the tests and examples. They are meant for best-performance scenarios and should be used with caution. When in doubt, please just use an array.

![Generational in action](https://github.com/mksunny1/eventiveness/tree/main/images/generational.jpg?raw=true)


## Actribute
Actribute aims to provide a more widely supported, flexible and powerful alternative to extending built-in HTML elements, using a similar API. 

*Note: This library should be considered less mature than the others, because it has not been tested or used as much. Currently it exists as a Proof of Concept.*


## Installation

### Direct download
Download or clone the repository and import any libraries you need from the ./src. It contains both JavaScript and TypeScript files.

### From NPM
```npm i eventiveness```

## Usage

### Direct download
```js
    import { apply } from "./eventiveness/src/appliance.js";
    import { One } from "./eventiveness/src/onetomany.js";
    // ...
```

### From NPM
```js
    import { apply } from "eventiveness/appliance";
    import { One } from "eventiveness/onetomany";
    // ...
```

## Contributing
If you like the concept and/or the direction of Eventiveness, feel free to contribute to this project. We are accepting contributions in many areas. Just give us a shout. The discussion area is open, and more channels are in the pipeline.

You can also sponsor this project. That is also in the works. For now you can give us a shout.

Thank you for contributing.


## Ongoing work
- Improving test coverage.


