const React = require('react');

const Rows = ({cards}) =>
  <React.Fragment>
    {cards.map(card =>
      <tr>
        <td>{card.name}</td>
        <td>{card['⏳']}</td>
        <td>{card.annualOccurrences} ({card['🔁']})</td>
        <td>{card.hoursPerYear}</td>
      </tr>
    )}
  </React.Fragment>

const Table = ({cards}) => {
  return (
      <table>
        <thead>
          <tr>
            <td>Card Title</td>
            <td>Estimate (⏳)</td>
            <td>Annual Occurences (🔁)</td>
            <td>Hours/Year \/</td>
          </tr>
        </thead>
        <tbody>
          <Rows cards={cards} />
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td>N/A</td>
            <td>-</td>
            <td>-</td>
          </tr>
        </tfoot>
      </table>
  );
}

module.exports = Table;