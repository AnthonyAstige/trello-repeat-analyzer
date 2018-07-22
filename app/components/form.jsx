const React = require('react');
const re = require('recompose');

const BoardOptions = ({boards}) =>
  <React.Fragment>
    {boards.map(board => 
      <option value={board.id}>{board.name}</option>
    )}
  </React.Fragment>

const Members = ({members, onChangeSelectedMember}) =>
  <React.Fragment>
    {members.map(member => 
      <div className="member">
          <input id={`member-input-${member.id}`} value={member.id} type="checkbox"
            onChange={onChangeSelectedMember} />
          <label for={`member-input-${member.id}`}>{member.fullName} ({member.username})</label>
      </div>
    )}
  </React.Fragment>

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
        <div ref={onSelectedMembersContainerRef}>
          <Members members={members} onChangeSelectedMember={onChangeSelectedMember} />
        </div>
      </form>
  );
}

const enhance = re.compose(
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