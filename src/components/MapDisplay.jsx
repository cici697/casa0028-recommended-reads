import { useMemo, useState } from "react"
import Map, { Source, Layer, Popup } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"

function normalizeSex(raw) {
  const s = String(raw ?? "").trim().toLowerCase()
  if (!s) return "unknown"
  if (s === "f" || s === "female" || s === "woman" || s === "women") return "female"
  if (s === "m" || s === "male" || s === "man" || s === "men") return "male"
  return s
}

function getSex(p) {
  return (
    p.sex ??
    p.gender ??
    p.person_sex ??
    p.person_gender ??
    p.main_person_sex ??
    p.main_person_gender ??
    p?.person?.sex ??
    p?.person?.gender ??
    p?.people?.[0]?.sex ??
    p?.people?.[0]?.gender
  )
}

function getLngLat(p) {
  const lng = parseFloat(p.longitude ?? p.lng ?? p.lon ?? p.LON ?? p.Longitude)
  const lat = parseFloat(p.latitude ?? p.lat ?? p.LAT ?? p.Latitude)
  if (Number.isFinite(lng) && Number.isFinite(lat)) return [lng, lat]
  return null
}

function toGeoJSON(plaques) {
  return {
    type: "FeatureCollection",
    features: plaques
      .map((p, idx) => {
        const coords = getLngLat(p)
        if (!coords) return null

        const sex = normalizeSex(getSex(p))
        const title = p.title ?? p.person ?? p.name ?? p.inscription ?? "Plaque"
        const inscription = p.inscription ?? p.description ?? ""

        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: coords },
          properties: {
            id: String(p.id ?? p.plaque_id ?? idx),
            title: String(title),
            inscription: String(inscription),
            sex: String(sex),
            isFemale: sex === "female" ? 1 : 0,
            role: String(p.role ?? p.occupation ?? p.category ?? "Unknown"),
          },
        }
      })
      .filter(Boolean),
  }
}

export default function MapDisplay({
  longitude,
  latitude,
  zoom,
  plaqueData,
  sexView,
  showHeatmap,
  onSelectPlaque,
}) {
  const [popup, setPopup] = useState(null)

  const filtered = useMemo(() => {
    if (sexView === "female") {
      return plaqueData.filter((p) => normalizeSex(getSex(p)) === "female")
    }
    return plaqueData
  }, [plaqueData, sexView])

  const geojson = useMemo(() => toGeoJSON(filtered), [filtered])

  const sexViewLabel =
    sexView === "female" ? "Female only" : "All (female highlighted)"

  const heatLayer = {
    id: "plaques-heat",
    type: "heatmap",
    paint: {
      "heatmap-weight": ["interpolate", ["linear"], ["get", "isFemale"], 0, 0.6, 1, 1],
      "heatmap-intensity": 1,
      "heatmap-radius": 18,
      "heatmap-opacity": 0.75,
    },
  }

  const femaleCircleLayer = {
    id: "plaques-female",
    type: "circle",
    filter: ["==", ["get", "sex"], "female"],
    paint: {
      "circle-radius": 6,
      "circle-color": "#e11d48",
      "circle-opacity": 0.85,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#ffffff",
    },
  }

  const otherCircleLayer = {
    id: "plaques-other",
    type: "circle",
    filter: ["!=", ["get", "sex"], "female"],
    paint: {
      "circle-radius": 4,
      "circle-color": "#64748b",
      "circle-opacity": 0.25,
      "circle-stroke-width": 0,
    },
  }

  const interactiveLayerIds =
    sexView === "female"
      ? ["plaques-female"]
      : ["plaques-female", "plaques-other"]

  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-sm">
      <div style={{ height: "70vh", width: "100%" }}>
        <Map
          initialViewState={{ longitude, latitude, zoom }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="https://demotiles.maplibre.org/style.json"
          interactiveLayerIds={interactiveLayerIds}
          onClick={(e) => {
            const f = e.features?.[0]
            if (!f) return
            setPopup({
              lng: e.lngLat.lng,
              lat: e.lngLat.lat,
              properties: f.properties,
            })
          }}
          cursor="default"
        >
          <Source id="plaques" type="geojson" data={geojson}>
            {showHeatmap && <Layer {...heatLayer} />}
            {sexView !== "female" && <Layer {...otherCircleLayer} />}
            <Layer {...femaleCircleLayer} />
          </Source>

          {popup && (
            <Popup
              longitude={popup.lng}
              latitude={popup.lat}
              closeOnClick={false}
              onClose={() => setPopup(null)}
              anchor="top"
              maxWidth="280px"
            >
              <div style={{ fontSize: 12, lineHeight: 1.35 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {popup.properties?.title}
                </div>

                {popup.properties?.inscription ? (
                  <div style={{ opacity: 0.8, marginBottom: 6 }}>
                    {popup.properties.inscription}
                  </div>
                ) : null}

                <div style={{ opacity: 0.8, marginBottom: 6 }}>
                  <div>
                    <b>Sex:</b> {popup.properties?.sex}
                  </div>
                  <div>
                    <b>View:</b> {sexViewLabel}
                  </div>
                  <div>
                    <b>Heatmap:</b> {showHeatmap ? "On" : "Off"}
                  </div>
                </div>

                <button
                  style={{
                    fontSize: 12,
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                  }}
                  onClick={() => onSelectPlaque?.(popup.properties)}
                >
                  Open details
                </button>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  )
}