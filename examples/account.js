import { apriori } from '../src/apriori.js';
import { sophistry } from '../src/sophistry.js';
import { call } from '../src/eventivity.js';
import { Fragment, apply, onEnter, preventDefault, addEventListener } from '../src/domitory.js';

const accountSophistry = sophistry();


// Components (notice the nesting, so easy to declare components elsewhere and reuse here.):
const views = {};

let currentView;
const onViewChange = [view => (currentView?.remove() || 1) && (currentView = view)];  // remove existing view when a new one is added

const loginYes = [username => profileView(username)];    // show profile view whenlogged in
const logoutYes = [() => loginView()];    // show login view when logged out

let loginNo = [];


function getView(name, map) {
    const frag = views[name]();
    const view = new Fragment(frag);

    // apply styles within
    const styles = accountSophistry(frag);
    for (let style of styles) style.style(frag);
    apply(map, frag);

    // add this view, simultaneously removing any previously added inverse views.
    call(onViewChange, document.getElementsByTagName('main')[0].appendChild(frag) && view);
    return view;
}


/**
 * Call anytime from anywhere to build, show and setup behavior (components) on the login view. 
 * It is like a LoginView component/custom element.
 * The profile view will be simultaneously removed
 */
function loginView() {
    // create the view
    getView('login', {
        '#loginForm': form => {       // show/hide in response to logout/login event using the display_none css class
            apply({
                input: input => {       // simulate button click when enter is pressed. notice the tag name is the selector here!
                    onEnter(input, () => login(input.value), {before: [preventDefault]});
                    apply({                         // this is nested in here to create a closure around the input
                        '#loginButton': button => {         // invoke login function when clicked
                            addEventListener(button, 'click', () => login(input.value));
                        }
                    }, form);
                },
                // report login error:
                '#loginErrorBox': box => loginNo = [msg => box.textContent = msg || 'What happened?']
            }, form);
        }
    });
}


/**
 * Call anytime from anywhere to build, show and setup behavior (components) on the profile view. 
 * It is like a ProfileView component/custom element.
 * The login view will be simultaneously removed.
 * 
 * The user argument is used within the view to provide obvious context.
 */
function profileView(username) {
    getView('profile', {
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
    if (Math.round(Math.random())) call(loginYes, username);
    else call(loginNo, 'Massive error occured');
}


async function logout() {
    call(logoutYes);
}


