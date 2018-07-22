require('isomorphic-fetch');
const React = require('react');
const ReactDOM = require('react-dom');

/* Import Components */
const Main = require('./components/main');

ReactDOM.render(<Main/>, document.getElementById('main'));