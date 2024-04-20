
/**
 * NB: Just experiments for now.
 * 
 * 
 * 
 * This method attempts to represent functions as objects. The goal is to 
 * make 'compasable functions' without 
 * incurring the performance and semantic penaalties of building and rebuilding 
 * from string using Function constructor.
 * 
 * The first argument is the function 'code' and the second argument provides 
 * the parameter and variable scope. Note that depending on the implementation, 
 * the functions can be stateful or stateless.
 * 
 * To interprete code as a set, write the args as s_ARGNAME, to interprete as 
 * a method call use c_ARGNAME and to interpret as a get, use g_ARGNAME. 
 * Using just a refers to the entire arg. 
 * 
 * Note that these can be nested to go deeper into the args object. So the 
 * arg search starts from the innermost level, just like nested scopes.
 * 
 * 
 * The code object is given as an array object to enforce the order of 
 * operations. Other arrays can be nested within them. To include function 
 * calls in the chain we can trivially wrap the functions with objects.
 * 
 * rhs are the values to be set, usually supplied inline with the call to set:
 * {arg1: 'new computation', arg2: await (fetch('something-remote')), 
 * arg3: call(event, 'we can' + 'also nest things here ', 1, 2, 3)}
 * 
 * 
 * NB: it is good practice to not have too many similar reactive functions.
 * Either write a single function with parameters or use this function.
 * 
 */




/**
 * This function senables us to create functions as interpreted objects 
 * with minimal loss of performance. The benefit is that the functions are 
 * easily composable without the need for a compilation step, as we have with 
 * the Function constructor. 
 * 
 * Anyways it is experimental. Feedback will determine whether or not to 
 * move forward with the idea.
 * 
 * 
 * @param {*} code 
 * @param {*} args 
 * @returns 
 */
export function run(code, args) {
    let scope = Object.assign({}, args);
    const scopes = [];
    runInScope(code, scope, scopes);
    return args;
}


function resolveStr(value, scopes) {
    if (value.startsWith('=')) {
        value = value.slice(1);
        let parts = value.split('.');
        const offset = int(parts[0]);
        value = undefined;
        i = scopes.length - 1 - offset;
        while (value === undefined && i >= 0) {
            value = scopes[i];
            for (j = 1; j < parts.length && value !== undefined; j++) value = value[parts[j]];
            i--;
        } 
    }
    return value;
}

function resolveArr(values, scopes) {
    const resolved = [];
    let value;
    for (value of values) {
        resolved.push(resolve(value, scopes));
    }
    return resolved;
}

function resolveObject(values, scopes) {
    const resolved = {};
    let key, value;
    for ([key, value] of Object.entries(values)) {
        resolved[key] = resolve(value, scopes)
    }
    return resolved;
}

export function resolve(value, scopes) {
    if (typeof value === "string") {
        return resolveStr(value, scopes);
    } else if (typeof value === 'object') {
        if (value instanceof Array) return resolveArr(value, scopes);
        else return resolveObject(value, scopes);
    }
    return value;
}

export function runInScope(code, scope, scopes) {
    scopes.push(scope);
    for (let line of code) {
        if (typeof line === 'function') line(scope, scopes);
        else if (line instanceof Array) runInScope(line, scope, scopes);
        else if (typeof line === 'object') {
            for (let [key, value] of Object.entries(line)) {
                if (key.startsWith('f_')) {
                    scope[key.slice(2)] = value(scope, scopes);
                } else if (key.startsWith('c_')) {
                    runInScope(value, scope[key.slice(2)], scopes);
                } else if (key.startsWith('m_')) {
                    scope[key.slice(2)](value, scopes);
                } else if (key.startsWith('s_')) {
                    set(scope[key.slice(2)], value);
                } else if (key.startsWith('g_')) {
                    set(scope[value, key.slice(2)]);
                } else if (key.startsWith('r_')) {
                    scope[key.slice(2)] = resolve(value, scopes);
                } else {
                    scope[key] = value;
                }
            }
        }
    }
    scopes.prop();
}
