import { Map, Source, Layer, Popup } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"

export default function MapDisplay(props) {
  const plaqueLayerStyle = {
    id: "plaques-layer",
    type: "circle",
    source: "plaques-data",
    paint: {
      "circle-radius": 6,
      "circle-color": "#007cbf",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff"
    }
  }

  const handleMapClick = (event) => {
    const features = event.features
    if (features && features.length > 0) {
      const clicked = features[0]
      props.setSelectedPlaque({
        geometry: clicked.geometry,
        properties: clicked.properties
      })
    }
  }

  const sp = props.selectedPlaque

  return (
    <div className="w-full h-[80vh]">
      <Map
        initialViewState={{
          longitude: props.longitude ?? -0.1276,
          latitude: props.latitude ?? 51.5074,
          zoom: props.zoom ?? 11
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://demotiles.maplibre.org/style.json"
        interactiveLayerIds={["plaques-layer"]}
        onClick={handleMapClick}
      >
        <Source id="plaques-data" type="geojson" data={props.geojson}>
          <Layer {...plaqueLayerStyle} />
        </Source>

        {sp ? (
          <Popup
            anchor="bottom"
            longitude={sp.geometry.coordinates[0]}
            latitude={sp.geometry.coordinates[1]}
            onClose={() => props.setSelectedPlaque(null)}
            closeOnClick={false}
          >
            <div className="max-w-xs">
              <h2 className="text-base font-semibold mb-1">
                {sp.properties?.lead_subject_name || "Unknown"}
              </h2>
              <p className="text-xs text-gray-600">
                {(sp.properties?.inscription || "").slice(0, 140)}
              </p>

              <button
                className="mt-3 rounded border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => props.setIsModalOpen(true)}
              >
                Recommended Reading
              </button>
            </div>
          </Popup>
        ) : null}
      </Map>
    </div>
  )
}