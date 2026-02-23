import { useMemo } from "react"

function normalizeSex(raw) {
  const s = String(raw ?? "").trim().toLowerCase()
  if (!s) return "unknown"
  if (s === "f" || s === "female" || s === "woman" || s === "women") return "female"
  if (s === "m" || s === "male" || s === "man" || s === "men") return "male"
  return s
}

export default function RoleChart({ plaqueData, sexFilter }) {
  const filteredData = useMemo(() => {
    if (sexFilter !== "female") return plaqueData
    return plaqueData.filter(
      (p) => normalizeSex(p.sex ?? p.gender ?? p.person_sex ?? p.person_gender) === "female"
    )
  }, [plaqueData, sexFilter])

  // plaqueData 全部替换成 filteredData
  // const counts = ...
  // const chartData = ...

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      {/* 保留图表 JSX */}
    </div>
  )
}