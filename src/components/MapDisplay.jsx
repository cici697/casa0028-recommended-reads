import Map from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"

export default function MapDisplay({ longitude, latitude, zoom }) {
  return (
    <div style={{ height: "70vh", width: "100%", marginTop: 16 }}>
      <Map
        initialViewState={{ longitude, latitude, zoom }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://demotiles.maplibre.org/style.json"
      />
    </div>
  )
}
