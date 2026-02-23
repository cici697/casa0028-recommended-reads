import TitleBar from "./components/TitleBar"
import MapDisplay from "./components/MapDisplay"

export default function App() {
  return (
    <div>
      <TitleBar
        title="Recommended Reads"
        subtitle="CASA0028 – Designing Spatial Data Stories"
      />

      <main style={{ padding: 24 }}>
        <MapDisplay longitude={-0.1276} latitude={51.5072} zoom={11} />
      </main>
    </div>
  )
}
