const re = require('recompose');
const React = require('react');

const fixed = (x) => Number.parseFloat(x).toFixed(2);

const Rows = ({cards}) =>
  <React.Fragment>
    {cards.map(card =>
      <tr>
        <td>{card.name}</td>
        <td>{card['⏳']}</td>
        <td>{fixed(card.annualOccurrences)} ({card['🔁']})</td>
        <td>{fixed(card.hoursPerYear)}</td>
      </tr>
    )}
  </React.Fragment>

const Table = ({cards, totalHoursPerYear, totalAnnualOccurrences}) => {
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
            <td>{fixed(totalAnnualOccurrences)}</td>
            <td>{fixed(totalHoursPerYear)}</td>
          </tr>
        </tfoot>
      </table>
  );
}

const enhance = re.compose(
  re.mapProps(({cards}) => ({
    cards: [...cards].sort((a, b) => b.hoursPerYear - a.hoursPerYear),
    totalHoursPerYear: cards.reduce((acc, curr) => acc + curr.hoursPerYear, 0),
    totalAnnualOccurrences: cards.reduce((acc, curr) => acc + curr.hoursPerYear, 0)
  }))
);

module.exports = enhance(Table);