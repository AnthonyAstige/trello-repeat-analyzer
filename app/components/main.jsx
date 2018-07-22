const React = require('react');
const Form = require('./form');
const Table = require('./table');
const re = require('recompose');

/* the main page for the index route of this app */
const Main = ({cards, setCards}) => {
  return (
    <React.Fragment>
      <h1>Trello Repeat Analyzer</h1>
      <Form setCards={setCards} />
      <Table cards={cards} />
      <div>
        <h2>Known issues</h2>
        <ul>
          <li>Must edit code for each new project (See .env)</li>
          <li>Must select and unselect all users to get cards without any assigned members</li>
        </ul>
      </div>
    </React.Fragment>
  );
}

const enhance = re.compose(
  re.withState('cards', 'setCards', []),
);

module.exports = enhance(Main);