# Running the tests

For now please run the tests by running `npm start` to launch the included server and visiting ['eventiveness.html'](http://localhost:8000/docs/test/eventiveness.html'). Currently only apriori and domitory tests have been implemented (but domitory also indirectly tests parts of appliance and generational). The remaining tests are on the way, though the examples currectly act as a 'second-class' test suite. This is a lot of work...

The `npm test` command will always fail at this time because we have not included necessary dependencies like jsdom. I am not sure how similar the behavior will be to chrome, for example whther the innerHTML of the entire page body will match when they are effectively showing the same thing.


