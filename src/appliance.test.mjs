import { apply } from "./appliance.js";
import { test, describe, it } from 'node:test';


// mock things:
global.CSSStyleSheet = class{
    cssRules = [
        {cssText: 'p {color: white}'},
        {cssText: '#id {color: blue}'},
        {cssText: '.cls {color: purple}'},
    ];
}

const elements = (args) =>  ({
    querySelectorAll(key) {
        return args[key] || [];
    }
});

const args1 = {a: [
    {id: 99},
    {id: 789},
    {id: 34},
    {id: 34}
], b: [
    {id:3349},
    {id: 9},
    {id: 7}
], c: [
    {id: 91},
    {id: 19},
    {id: 3000}
]};

const args2 = {a: [
    {id: 4},
    {id: 456},
    {id: 9128}
], b: [
    {id:45},
    {id: 88},
    {id: 11}
], c: [
    {id: 328783},
    {id: 76},
    {id: 54}
]};

test(`apply properly selects the matched objects and 
runs the correct function`, () => {
    const results1 = {count: 0};
    apply({
        b: (...items) => results1.items1 = items,
        unknown: (...items) => results1.items2 = items
    }, elements(args1));
    if (results1.items1.map(i => args1.b.includes(i)).includes(false)) throw new Error(`${results1.items1} is not ${args1.b}`);
    if (results1.items2.length !== 0) throw new Error(`${results1.items2.length} is not 0`);
});


test('apply without "asComponent" set runs only once', () => {
    const results2 = {count: 0};
    apply({a: () => results2.count++}, elements(args1));
    if (results2.count !== 1) throw new Error(`${results2.count} is not 1`);
});


test('apply with "asComponent" set runs as many times as there are matched objects with the correct matched object', () => {
    const results3 = {count: 0}
    apply({a: () => results3.count++}, elements(args1), true);
    if (results3.count !== args1.a.length) throw new Error(`${results3.count} is not ${args1.a.length}`);
});


