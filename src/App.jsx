import { useState } from "react"
import "./tw-styles.css"

import TitleBar from "./components/TitleBar"
import MapDisplay from "./components/MapDisplay"
import PlaqueModal from "./components/PlaqueModal"
import RoleChart from "./components/RoleChart"

import { plaqueData } from "./data/open-plaques-london-2023-11-10-filtered.js"

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlaque, setSelectedPlaque] = useState(null)

  const [sexFilter, setSexFilter] = useState("all") // "all" | "female"
  const [showHeatmap, setShowHeatmap] = useState(false)

  function handleSelectPlaque(plaqueProps) {
    setSelectedPlaque(plaqueProps)
    setIsModalOpen(true)
  }

  return (
    <div className="mx-auto max-w-screen-xl bg-gray-50 min-h-screen">
      <TitleBar
        title="📚 Recommended Reading"
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
              All (female highlighted)
            </label>

            <label className="text-sm flex items-center gap-2">
              <input
                type="radio"
                name="sexView"
                value="female"
                checked={sexFilter === "female"}
                onChange={() => setSexFilter("female")}
              />
              Female only
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
        </div>

        <MapDisplay
          longitude={-0.1276}
          latitude={51.5072}
          zoom={11}
          plaqueData={plaqueData}
          sexView={sexFilter}
          showHeatmap={showHeatmap}
          onSelectPlaque={handleSelectPlaque}
        />

        <RoleChart plaqueData={plaqueData} sexFilter={sexFilter} />
      </div>

      <PlaqueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plaque={selectedPlaque}
      />
    </div>
  )
}