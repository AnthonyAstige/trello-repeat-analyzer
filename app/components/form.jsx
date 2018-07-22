const React = require('react');
const re = require('recompose');

const BoardOptions = ({boards}) =>
  <React.Fragment>
    {boards.map(board => 
      <option value={board.id}>{board.name}</option>
    )}
  </React.Fragment>

const Members = ({members, onChangeSelectedMember, onSelectedMembersContainerRef}) =>
  <div ref={onSelectedMembersContainerRef}>
    {members.map(member => 
      <div className="member">
          <input id={`member-input-${member.id}`} value={member.id} type="checkbox"
            onChange={onChangeSelectedMember} />
          <label for={`member-input-${member.id}`}>{member.fullName} ({member.username})</label>
      </div>
    )}
  </div>

const Form = ({password, onSelectedMembersContainerRef, onChangeSelectedMember, members, onPasswordRef, onChangePassword, boardId, boards, onBoardRef, onChangeBoard, onSelectMember}) => {
  return (
      <form>
        <label>Password</label>
        <input onChange={onChangePassword} ref={onPasswordRef} type="password" />

        <label>Board</label>
        <select data-board-id={boardId} ref={onBoardRef} disabled={password.length === 0 || boards.length === 0} onChange={onChangeBoard}>
          <option>{boards.length ? 'Select a board' : '(Loading boards...)'}</option>
          <BoardOptions boards={boards} />
        </select>

        <label>Members</label>
        <Members onSelectedMembersContainerRef={onSelectedMembersContainerRef} members={members} onChangeSelectedMember={onChangeSelectedMember} />
      </form>
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
  re.withState('password', 'setPassword', ''),
  re.withState('boards', 'setBoards', []),
  re.withState('boardId', 'setBoardId'),
  re.withState('members', 'setMembers', []),
  re.withState('selectedMembers', 'setSelectedMembers', []),

  re.lifecycle({
    componentDidMount() {
      fetch('/boards.json')
        .then((response) => response.json())
        .then((boards) => this.props.setBoards(boards));
      }
  }),
  
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
  
  // Password
  re.withHandlers(() => {
    let passwordRef = null;
    return {
      onPasswordRef: () => (ref) => passwordRef = ref,
      onChangePassword: ({setPassword}) => () => setPassword(passwordRef.value)
    }
  }),
  
  // Board
  re.withHandlers(() => {
    let boardRef = null;
    return {
      onBoardRef: () => (ref) => boardRef = ref,
      onChangeBoard: ({setBoardId, fetchMembers, setMembers, setCards}) => () => {
        const boardId = boardRef.value;
        setBoardId(boardId);
        setMembers([]);
        setCards([]);
        fetchMembers(boardId);
      }
    }
  }),
  
  // Members
  re.withHandlers(() => {
    let selectedMembersRef = null;
    return {
      onSelectedMembersContainerRef: () => (ref) => selectedMembersRef = ref,
      onChangeSelectedMember: ({setCards, setSelectedMembers, fetchCards}) => () => {
        const checkedInputBoxesNodeList = selectedMembersRef.querySelectorAll('input:checked');
        const selectedMemberIds = [...checkedInputBoxesNodeList].map(input => input.value);
        setSelectedMembers(selectedMemberIds);
        setCards([]);
        fetchCards(selectedMemberIds);
      }
    };
  })
);

module.exports = enhance(Form);