import { useMemo, useState } from "react"
import Map, { Source, Layer, Popup } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"

function asArray(x) {
  if (Array.isArray(x)) return x
  if (Array.isArray(x?.features)) return x.features
  return []
}

function propsOf(p) {
  return p?.properties && typeof p.properties === "object" ? p.properties : p
}

function normalizeSex(raw) {
  const s = String(raw ?? "").trim().toLowerCase()
  if (!s) return "unknown"
  if (s === "f" || s === "female" || s === "woman" || s === "women") return "female"
  if (s === "m" || s === "male" || s === "man" || s === "men") return "male"
  return s
}

function getSex(p) {
  const o = propsOf(p)
  return (
    o.sex ??
    o.gender ??
    o.person_sex ??
    o.person_gender ??
    o.main_person_sex ??
    o.main_person_gender ??
    o?.person?.sex ??
    o?.person?.gender ??
    o?.people?.[0]?.sex ??
    o?.people?.[0]?.gender
  )
}

function getLngLat(p) {
  // GeoJSON Feature
  if (Array.isArray(p?.geometry?.coordinates) && p.geometry.coordinates.length >= 2) {
    const [lng, lat] = p.geometry.coordinates
    if (Number.isFinite(lng) && Number.isFinite(lat)) return [lng, lat]
  }

  const o = propsOf(p)
  const lng = parseFloat(o.longitude ?? o.lng ?? o.lon ?? o.LON ?? o.Longitude)
  const lat = parseFloat(o.latitude ?? o.lat ?? o.LAT ?? o.Latitude)
  if (Number.isFinite(lng) && Number.isFinite(lat)) return [lng, lat]
  return null
}

function toGeoJSON(input) {
  const plaques = asArray(input)

  return {
    type: "FeatureCollection",
    features: plaques
      .map((p, idx) => {
        const coords = getLngLat(p)
        if (!coords) return null

        const o = propsOf(p)
        const sex = normalizeSex(getSex(p))

        const title = o.title ?? o.person ?? o.name ?? o.inscription ?? "Plaque"
        const inscription = o.inscription ?? o.description ?? ""

        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: coords },
          properties: {
            id: String(o.id ?? o.plaque_id ?? idx),
            title: String(title),
            inscription: String(inscription),
            sex: String(sex),
            isFemale: sex === "female" ? 1 : 0,
            role: String(o.role ?? o.occupation ?? o.category ?? "Unknown"),
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

  const safePlaqueData = useMemo(() => asArray(plaqueData), [plaqueData])

  const filtered = useMemo(() => {
    if (sexView === "female") {
      return safePlaqueData.filter((p) => normalizeSex(getSex(p)) === "female")
    }
    return safePlaqueData
  }, [safePlaqueData, sexView])

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