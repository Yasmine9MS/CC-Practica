export default function StatCard({ label, value, helper, accent }) {
  return (
    <article className="stat-card">
      <p className="stat-label">{label}</p>
      <strong className={accent ? `stat-value ${accent}` : 'stat-value'}>{value}</strong>
      <span className="stat-helper">{helper}</span>
    </article>
  )
}
