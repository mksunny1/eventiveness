ev = eventivity()
// {handlers: {…}, hc: 0, handler: ƒ, event: ƒ}
handler = ev.handler()
// Proxy(Function) {length: 0, name: ''}
event = ev.event()
// Proxy(Function) {length: 0, name: ''}
first = handler.first($=>console.log('first event'))();
// eventivity.HandlerContext {scope: {…}, options: undefined, prefix: 'first', eventName: 'first', #createProxy: Proxy(Function), …}
second = handler.second($=>console.log('second event'))();
// eventivity.HandlerContext {scope: {…}, options: undefined, prefix: 'second', eventName: 'second', #createProxy: Proxy(Function), …}
tf = handler.third.fourth($=>console.log('Third-fourth event'))();
// eventivity.HandlerContext {scope: {…}, options: undefined, prefix: 'third.fourth', eventName: 'third.fourth', #createProxy: Proxy(Function), …}
ff = handler.first.fifth($=>console.log('First-fifth event'))();
// eventivity.HandlerContext {scope: {…}, options: undefined, prefix: 'first.fifth', eventName: 'first.fifth', #createProxy: Proxy(Function), …}
event.first.fifth()
// eventivity.EventContext {scope: {…}, options: undefined, prefix: 'first.fifth', events: Array(2), #createProxy: Proxy(Function), …}
event.first.fifth(1)
// VM2095:1 first event
// VM2198:1 First-fifth event
// Proxy(Function) {length: 1, name: ''}
event.first.fifth(1)
// VM2095:1 first event
// VM2198:1 First-fifth event
// Proxy(Function) {length: 1, name: ''}
event.first(1)
// VM2095:1 first event
// Proxy(Function) {length: 1, name: ''}

third = handler.third($=>console.log('Third event'))();
// eventivity.HandlerContext {scope: {…}, options: undefined, prefix: 'third', eventName: 'third', #createProxy: Proxy(Function), …}
event.third(tf)
// VM2483:1 Third event
// Proxy(Function) {length: 1, name: ''}
event.third.fourth(tf)
// VM2483:1 Third event
// VM2429:1 Third-fourth event
// Proxy(Function) {length: 1, name: ''}
tf.delete()
// undefined
event.third.fourth(tf)
// VM2483:1 Third event
// Proxy(Function) {length: 1, name: ''}

// left to test: correct behavior of $ (to clear everything and start afresh) and assignment and reuse of results (for aliasing).


