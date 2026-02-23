export default function TitleBar({ title, subtitle }) {
  return (
    <header style={{ padding: "16px 24px", borderBottom: "1px solid #eee" }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <p style={{ margin: "6px 0 0 0", color: "#666" }}>{subtitle}</p>
    </header>
  )
}
