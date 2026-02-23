import { useState } from "react"
import "./tw-styles.css"

import TitleBar from "./components/TitleBar"
import MapDisplay from "./components/MapDisplay"
import PlaqueModal from "./components/PlaqueModal"

import { plaqueData } from "./data/open-plaques-london-2023-11-10-filtered.js"

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlaque, setSelectedPlaque] = useState(null)

  return (
    <div className="mx-auto max-w-screen-xl bg-gray-50 min-h-screen">
      <TitleBar
        title="📚 Recommended Reading"
        subtitle="CASA0028 – Designing Spatial Data Stories"
      />

      <div className="p-4">
        <MapDisplay
          longitude={-0.1276}
          latitude={51.5074}
          zoom={11}
          geojson={plaqueData}
          selectedPlaque={selectedPlaque}
          setSelectedPlaque={setSelectedPlaque}
          setIsModalOpen={setIsModalOpen}
        />
      </div>

      {isModalOpen ? (
        <PlaqueModal setIsModalOpen={setIsModalOpen} selectedPlaque={selectedPlaque} />
      ) : null}
    </div>
  )
}