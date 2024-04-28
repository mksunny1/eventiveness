
const files = ['../src/domitory.js', '../src/eventivity.js', '../src/appliance.js', '../src/actribute.js', '../src/apriori.js', '../src/generational.js', '../src/sophistry.js', '../src/onetomany.js'];

window.mods = {};

for (let file of files) {
    import(file).then(m => window.mods[file.slice(7).split('.')[0]] = m);
}

