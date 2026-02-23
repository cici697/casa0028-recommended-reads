import { useEffect, useMemo, useState } from "react"
import "./tw-styles.css"

import TitleBar from "./components/TitleBar"
import MapDisplay from "./components/MapDisplay"
import PlaqueModal from "./components/PlaqueModal"
import RoleChart from "./components/RoleChart"

import { plaqueData } from "./data/open-plaques-london-2023-11-10-filtered.js"

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

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlaque, setSelectedPlaque] = useState(null)

  const [sexFilter, setSexFilter] = useState("all") // "all" | "female"
  const [showHeatmap, setShowHeatmap] = useState(false)

  const plaques = useMemo(() => asArray(plaqueData), [])

  const sexStats = useMemo(() => {
    let female = 0
    let male = 0
    let unknown = 0
    for (const p of plaques) {
      const s = normalizeSex(getSex(p))
      if (s === "female") female++
      else if (s === "male") male++
      else unknown++
    }
    return { total: plaques.length, female, male, unknown }
  }, [plaques])

  const hasFemale = sexStats.female > 0

  useEffect(() => {
    if (sexFilter === "female" && !hasFemale) setSexFilter("all")
  }, [sexFilter, hasFemale])

  function handleSelectPlaque(plaqueProps) {
    setSelectedPlaque(plaqueProps)
    setIsModalOpen(true)
  }

  return (
    <div className="mx-auto max-w-screen-xl bg-gray-50 min-h-screen">
      <TitleBar
        title="📚 Female-highlighted Reading List"
        subtitle="CASA0028 – Designing Spatial Data Stories"
      />

      <div className="p-4 space-y-4">
        <div className="rounded-xl bg-white p-4 shadow-sm flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">Sex view</span>

            <label className="text-sm flex items-center gap-2">
              <input
                type="radio"
                name="sexView"
                value="all"
                checked={sexFilter === "all"}
                onChange={() => setSexFilter("all")}
              />
              Female highlighted (All)
            </label>

            <label
              className={`text-sm flex items-center gap-2 ${hasFemale ? "" : "opacity-50"}`}
              title={hasFemale ? "" : "No female records detected in dataset"}
            >
              <input
                type="radio"
                name="sexView"
                value="female"
                checked={sexFilter === "female"}
                onChange={() => setSexFilter("female")}
                disabled={!hasFemale}
              />
              Female only ({sexStats.female})
            </label>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">Heatmap</span>
            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={showHeatmap}
                onChange={(e) => setShowHeatmap(e.target.checked)}
              />
              Show heatmap
            </label>
          </div>

          <div className="text-xs text-gray-600">
            Total: {sexStats.total} · Female: {sexStats.female} · Male: {sexStats.male} · Unknown:{" "}
            {sexStats.unknown}
          </div>
        </div>

        <MapDisplay
          longitude={-0.1276}
          latitude={51.5072}
          zoom={11}
          plaqueData={plaques}
          sexView={sexFilter}
          showHeatmap={showHeatmap}
          onSelectPlaque={handleSelectPlaque}
        />

        <RoleChart plaqueData={plaques} sexFilter={sexFilter} />
      </div>

      <PlaqueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plaque={selectedPlaque}
      />
    </div>
  )
}