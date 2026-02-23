import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function SimpleChart({ data }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Plaques erected per year (filtered)" }
    },
    scales: {
      x: { ticks: { autoSkip: true, maxTicksLimit: 12 } }
    }
  }

  return (
    <div className="w-full h-64">
      <Bar data={data} options={options} />
    </div>
  )
}