/**
 * Effectively makes a template literal out of an existing template string and wraps it in a function 
 * which can be called multiple times to 'render' the template with the given arguments.
 * Additionally the built template is 'promise-aware' and will allow them to resolve to string values 
 * before interpolating them.
 * 
 * template = arender(templateString);
 * template(arg1, arg2, ...argRest);
 * .
 * @param {*} template 
 * @param {*} argNames 
 * @param {*} renderName 
 * @returns 
 */
export function arender(template, argNames, renderName) {
    if (!renderName) renderName = 'P';
    if (!(argNames instanceof Array)) argNames = [argNames];
    if (argNames.includes(renderName)) {
        throw new Error(`Render name ${renderName} clashes with the name of one of the arguments. 
        Please change the rendername or the argument name to resolve this.`);
    }
    const mainFunction = Function(renderName, ...argNames, "return " + renderName + "`" + template + "`;")
    return (...args) => mainFunction(arender.promise, ...args);
}

/**
 * This is the template tag that enables the arender to wait for promises to resolve:
 * 
 * p`I will wait for this ${Promise.resolve("promise")}!!!`
 * 
 * @param {*} strings 
 * @param  {...any} expressions 
 * @returns 
 */
arender.promise = async function(strings, ...expressions) {
    const promisedExpressions = [];

    for (let [i, exp] of expressions.entries()) {
        if (exp instanceof Promise) promisedExpressions.push(exp);
        else promisedExpressions.push(Promise.resolve(exp));
    }
    
    const resolvedExpressions = await Promise.all(promisedExpressions);
    return resolvedExpressions.map((exp, i) => `${strings[i]}${exp}`).join('') + strings[resolvedExpressions.length];
};
