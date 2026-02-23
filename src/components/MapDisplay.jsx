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
    const features = event?.features
    if (features && features.length > 0) {
      const clicked = features[0]
      props.setSelectedPlaque({
        geometry: clicked.geometry,
        properties: clicked.properties
      })
    }
  }

  const sp = props.selectedPlaque
  const name = sp?.properties?.lead_subject_name || "Unknown"
  const inscription = (sp?.properties?.inscription || "").slice(0, 160)
  const plaqueId = sp?.properties?.id1
  const wiki = sp?.properties?.lead_subject_wikipedia

  return (
    <div className="w-full h-[80vh] rounded-lg overflow-hidden border border-gray-200">
      <Map
        initialViewState={{
          longitude: props.longitude ?? -0.1276,
          latitude: props.latitude ?? 51.5074,
          zoom: props.zoom ?? 11
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
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
              <h2 className="text-base font-semibold mb-1">{name}</h2>

              {inscription ? (
                <p className="text-xs text-gray-600">{inscription}</p>
              ) : null}

              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                {plaqueId ? (
                  <a
                    className="text-blue-600 hover:underline"
                    href={`https://openplaques.org/plaques/${plaqueId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    OpenPlaques
                  </a>
                ) : null}

                {wiki ? (
                  <a
                    className="text-blue-600 hover:underline"
                    href={wiki}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Wikipedia
                  </a>
                ) : null}
              </div>

              <button
                className="mt-3 w-full rounded border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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