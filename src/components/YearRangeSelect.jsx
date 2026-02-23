export default function YearRangeSelect({ yearRange, setYearRange }) {
  function handleChange(e) {
    const v = Number(e.target.value)
    if (Number.isNaN(v)) return

    if (e.target.id === "start-year") {
      setYearRange({ min: v, max: Number(yearRange.max) })
    }
    if (e.target.id === "end-year") {
      setYearRange({ min: Number(yearRange.min), max: v })
    }
  }

  return (
    <div className="w-full flex items-center justify-between gap-4 mt-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Start</span>
        <input
          type="number"
          id="start-year"
          value={yearRange.min}
          className="h-10 w-28 rounded border border-gray-200 px-2 text-sm"
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">End</span>
        <input
          type="number"
          id="end-year"
          value={yearRange.max}
          className="h-10 w-28 rounded border border-gray-200 px-2 text-sm"
          onChange={handleChange}
        />
      </div>
    </div>
  )
}