const re = require('recompose');
const React = require('react');

const fixed = (number, precision) => Number.parseFloat(number).toFixed(precision);

const TableHead = () =>
  <thead>
    <tr>
      <td>Card Title</td>
      <td>⏳ Estimate</td>
      <td>Annual Occurences (🔁)</td>
      <td>Hours/Year \/</td>
      <td>% of annual time</td>
    </tr>
  </thead>

const TableBody = ({cards}) =>
  <tbody>
    {cards.map(card =>
      <tr>
        <td>{card.name}</td>
        <td>{fixed(card['⏳'], 2)}</td>
        <td>{fixed(card.annualOccurrences, 0)} ({card['🔁']})</td>
        <td>{fixed(card.hoursPerYear, 1)}</td>
        <td>{fixed(card.percentOfAnnualTime, 1)}%</td>
      </tr>
    )}
  </tbody>

const TableFooter = ({totalAnnualOccurrences, totalHoursPerYear}) =>
  <tfoot>
    <tr>
      <td>Total</td>
      <td>N/A</td>
      <td>{fixed(totalAnnualOccurrences, 0)}</td>
      <td>{fixed(totalHoursPerYear, 0)}</td>
      <td>100%</td>
    </tr>
  </tfoot>

const Table = ({cards, totalHoursPerYear, totalAnnualOccurrences}) => {
  return (
      <table>
        <TableHead />
        <TableBody cards={cards} />
        <TableFooter totalAnnualOccurrences={totalAnnualOccurrences} totalHoursPerYear={totalHoursPerYear} />
      </table>
  );
}

const enhance = re.compose(
  re.mapProps(({cards}) => ({
    cards: [...cards].sort((a, b) => b.hoursPerYear - a.hoursPerYear),
    totalAnnualOccurrences: cards.reduce((acc, curr) => acc + curr.annualOccurrences, 0),
    totalHoursPerYear: cards.reduce((acc, curr) => acc + curr.hoursPerYear, 0)
  })),
  re.mapProps(({cards, totalHoursPerYear, ...rest}) => ({
    cards: cards.map(card => ({
      percentOfAnnualTime: 100 * (card.hoursPerYear / totalHoursPerYear),
      ...card
    })),
    totalHoursPerYear,
    ...rest
  }))
);

module.exports = enhance(Table);