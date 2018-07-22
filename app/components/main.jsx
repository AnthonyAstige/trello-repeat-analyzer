const React = require('react');
const Form = require('./form');
const Table = require('./table');
const re = require('recompose');

/* the main page for the index route of this app */
const Main = ({cards, boards, setCards, setMembers, fetchCards, members, password, boardId, setBoardId, setPassword, fetchMembers, selectedMembers, setSelectedMembers}) => {
  return (
    <React.Fragment>
      <h1>Trello Repeat Analyzer!</h1>
      <Form setMembers={setMembers} setCards={setCards} fetchCards={fetchCards} selectedMembers={selectedMembers} setSelectedMembers={setSelectedMembers} fetchMembers={fetchMembers} members={members} boards={boards} password={password} boardId={boardId} setBoardId={setBoardId} setPassword={setPassword}  />
      <Table cards={cards} />
      <div>
        Known issues
        <ul>
          <li>Have to edit code for new projects (idList in .env, and customFieldMapping of 🔁/⏳ in sever.js</li>
          <li>Have to select and unselect all users to get cards without any assigned members</li>
        </ul>
      </div>
    </React.Fragment>
  );
}

const calculateAnnualOccurrences = (card) => {
  var myRegexp = /([0-9\.]+)([dwmy])/g;
  var match = myRegexp.exec(card['🔁']);
  const occurencesPerPeriod = match[1];
  const period = match[2];
  const periodsPerYearMapping = {
    d: 365.25,
    w: 52.1429,
    m: 12,
    y: 1
  }
  return periodsPerYearMapping[period] / occurencesPerPeriod;
}

const enhance = re.compose(
  re.withState('boards', 'setBoards', []),
  re.withState('boardId', 'setBoardId'),
  re.withState('password', 'setPassword', ''),
  re.withState('members', 'setMembers', []),
  re.withState('selectedMembers', 'setSelectedMembers', []),
  re.withState('cards', 'setCards', []),
    
  // TODO: See if these handlers can be moved into Form component?
  // TODO: * Then see if more can
  re.withHandlers({
    fetchMembers: ({password, setMembers}) => (boardId) => {
      const body = JSON.stringify({password, boardId});
      const headers= {"Content-Type": "application/json"};
      const method = 'post';
      fetch('/members.json',  {body, headers, method})
        .then((response) => {
          if (response.status == 200) {
            return response.json();
          }
          throw response;
        })
        .then((members) => setMembers(members))
        .catch(responseWithError => responseWithError.text().then(errMsg => alert(`Bad server response: ${errMsg}`)))
    },
    fetchCards: ({password, boardId, setCards}) => (selectedMembers) => {
      const body = JSON.stringify({password, boardId, selectedMembers});
      const headers= {"Content-Type": "application/json"};
      const method = 'post';
      fetch('/cards.json',  {body, headers, method})
        .then((response) => {
          if (response.status == 200) {
            return response.json();
          }
          throw response;
        })
        .then((cards) => {
          const cardsWithDerivativeFields = cards.map(card => {
            const annualOccurrences = calculateAnnualOccurrences(card);
            const hoursPerYear = annualOccurrences * card['⏳'];
            const newCard = {
              annualOccurrences,
              hoursPerYear,
              ...card
            }
            return newCard;
          });
          setCards(cardsWithDerivativeFields);
        })
        .catch(responseWithError => responseWithError.text().then(errMsg => alert(`Bad server response: ${errMsg}`)))
    }
  }),

  re.lifecycle({
    componentDidMount() {
      fetch('/boards.json')
        .then((response) => response.json())
        .then((boards) => this.props.setBoards(boards));
      }
  })
);

module.exports = enhance(Main);