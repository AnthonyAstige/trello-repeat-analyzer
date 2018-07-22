const React = require('react');
const Form = require('./form');
const Table = require('./table');
const re = require('recompose');

/* the main page for the index route of this app */
const Main = ({cards, setBoards, boards, setCards, setMembers, fetchCards, members, password, boardId, setBoardId, setPassword, fetchMembers, selectedMembers, setSelectedMembers}) => {
  return (
    <React.Fragment>
      <h1>Trello Repeat Analyzer</h1>
      <Form setBoards={setBoards} setMembers={setMembers} setCards={setCards} fetchCards={fetchCards} selectedMembers={selectedMembers} setSelectedMembers={setSelectedMembers} fetchMembers={fetchMembers} members={members} boards={boards} password={password} boardId={boardId} setBoardId={setBoardId} setPassword={setPassword}  />
      <Table cards={cards} />
      <div>
        <h2>Known issues</h2>
        <ul>
          <li>Have to edit code for new projects (idList in .env, and customFieldMapping of 🔁/⏳ in sever.js)</li>
          <li>Have to select and unselect all users to get cards without any assigned members</li>
        </ul>
      </div>
    </React.Fragment>
  );
}

const enhance = re.compose(
  // TODO: See if can move a bunch of this state into form ... probably only need cards up here.
  re.withState('boards', 'setBoards', []),
  re.withState('boardId', 'setBoardId'),
  re.withState('password', 'setPassword', ''),
  re.withState('members', 'setMembers', []),
  re.withState('selectedMembers', 'setSelectedMembers', []),
  re.withState('cards', 'setCards', []),
);

module.exports = enhance(Main);