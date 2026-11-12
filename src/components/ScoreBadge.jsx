const DOT = { green: '🟢', yellow: '🟡', red: '🔴' }

export default function ScoreBadge({ score, level, big = false }) {
  return (
    <span className={`score score-${level} ${big ? 'score-big' : ''}`}>
      <span aria-hidden="true">{DOT[level]}</span> {score}
    </span>
  )
}
