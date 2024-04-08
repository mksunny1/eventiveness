import { eventivity } from '../eventivity.js';
import { Fragment, apply, onEnter, addEventListener } from '../domitory.js';
import { apriori } from '../apriori.js'
import { sophistry } from '../sophistry.js'

const accountEventivity = eventivity();
const e = accountEventivity.event();
const h = accountEventivity.handler();
window.event = e;              // so it can be accessed from other windows if needed.
window.handler = h;            // so it can be accessed from other windows if needed.

const accountSophistry = sophistry();


// Components (notice the nesting, so easy to declare components elsewhere and reuse here.):
const views = {};


function getView(name, inverse, map) {
    console.log(accountEventivity.handlers);

    const frag = views[name]();
    const view = new Fragment(frag);

    console.log('view');

    // apply styles within
    const styles = accountSophistry(frag);
    for (let style of styles) style.style(frag);

    apply(map, frag);

    // add this view, simultaneously removing any previously added inverse views.
    e[name + 'View'](document.getElementsByTagName('main')[0].appendChild(frag));

    // ensure this view is removed when inverse view is added. the handler is cleared (removed) after it runs 
    // because it only runs once.
    h[[inverse + 'View']](() => view.remove(), { clear: true });

    return view;
}


/**
 * Call anytime from anywhere to build, show and setup behavior (components) on the login view. 
 * It is like a LoginView component/custom element.
 * The profile view will be simultaneously removed
 */
function loginView() {
    // create the view
    const view = getView('login', 'profile', {
        '#loginForm': form => {       // show/hide in response to logout/login event using the display_none css class
            apply({
                input: input => {       // simulate button click when enter is pressed. notice the tag name is the selector here!
                    onEnter(input, () => login(input.value), true);
                    apply({                         // this is nested in here to create a closure around the input
                        '#loginButton': button => {         // invoke login function when clicked
                            addEventListener(button, 'click', () => login(input.value));
                        }
                    }, form);
                },
                // report login error:
                '#loginErrorBox': box => h.loginNo($ => box.textContent = $.args[0] || 'What happened?')
            }, form);
        }
    });

    // when login succeeds, show profile view
    // h.loginYes(resp => resp.json().then(j => profileView(j.user)));
    h.loginYes(j => profileView(j.args[0]), {clear: true});
}


/**
 * Call anytime from anywhere to build, show and setup behavior (components) on the profile view. 
 * It is like a ProfileView component/custom element.
 * The login view will be simultaneously removed.
 * 
 * The user argument is used within the view to provide obvious context.
 */
function profileView(username) {
    const view = getView('profile', 'login', {
        '#profileBox': box => {
            // views:
            // code to setup profile info and the 2 tabs.


            // logout handler
            apply({
                '#userHeading': h2 => {
                    h2.textContent = 'Welcome ' + username;    
                    // bind content. can also bind attributes and if we dont rerender, just wrap with h.loginYes...
                },
                '#logoutButton': button => {
                    addEventListener(button, 'click', logout);
                }
            }, box);
        }
    });

    // when logout is successful, show login view
    h.logoutYes(() => loginView(), {clear: true});
}

/**
 * Set up the apriory tree factory functions used for building the views dynamically
 */
apply({
    '#loginTemplate': async template => {
        views.login = await apriori(template.content);
        if (!window.page?.username) loginView();
    },
    '#profileTemplate': async template => {
        views.profile = await apriori(template.content);
        if (window.page?.username) profileView(window.page.username);
    }
});


/**
 * Tries to login if account already exists, else calls signin
 * @param {*} username 
 */
async function login(username) {
    console.log('Called.');
    if (Math.round(Math.random())) e.loginYes(username, {esc: true});
    else e.loginNo('Massive error occured');
}


async function logout() {
    console.log('logout!');
    e.logoutYes({});
}


