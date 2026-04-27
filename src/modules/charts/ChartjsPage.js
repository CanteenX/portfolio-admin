import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut, PolarArea, Radar, Scatter } from "react-chartjs-2";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useTheme } from "../../core/theme/ThemeContext";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Tooltip, Legend, Filler);

const BREADCRUMB_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Charts" },
  { label: "Chart.js" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function baseScaleColor(isDark) {
  return isDark ? "rgba(148,163,184,0.3)" : "rgba(100,116,139,0.2)";
}

function textColor(isDark) {
  return isDark ? "#e2e8f0" : "#1e293b";
}

function lineChartData() {
  return {
    labels: MONTHS,
    datasets: [{
      label: "Monthly Sales ($K)",
      data: [28, 35, 42, 38, 50, 46, 55, 60, 52, 65, 58, 72],
      borderColor: "#6366f1",
      backgroundColor: "rgba(99,102,241,0.15)",
      fill: true,
      tension: 0.4,
    }],
  };
}

function barChartData() {
  return {
    labels: ["Q1", "Q2", "Q3"],
    datasets: [
      { label: "2024", data: [120, 150, 180], backgroundColor: "#6366f1" },
      { label: "2025", data: [140, 170, 210], backgroundColor: "#22c55e" },
      { label: "2026", data: [160, 190, 230], backgroundColor: "#f59e0b" },
    ],
  };
}

function doughnutData() {
  return {
    labels: ["Direct", "Social", "Referral", "Organic"],
    datasets: [{
      data: [35, 25, 20, 20],
      backgroundColor: ["#6366f1", "#f97316", "#22c55e", "#ec4899"],
      borderWidth: 0,
    }],
  };
}

function polarAreaData() {
  return {
    labels: ["Engineering", "Marketing", "Sales", "Design", "Support"],
    datasets: [{
      data: [85, 60, 70, 55, 45],
      backgroundColor: [
        "rgba(99,102,241,0.6)", "rgba(249,115,22,0.6)",
        "rgba(34,197,94,0.6)", "rgba(236,72,153,0.6)", "rgba(245,158,11,0.6)",
      ],
      borderWidth: 1,
    }],
  };
}

function radarData() {
  return {
    labels: ["Communication", "Technical", "Leadership", "Teamwork", "Creativity", "Problem Solving"],
    datasets: [
      { label: "Self", data: [80, 90, 65, 85, 75, 88], borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,0.2)", pointBackgroundColor: "#6366f1" },
      { label: "Manager", data: [70, 85, 75, 80, 70, 82], borderColor: "#f97316", backgroundColor: "rgba(249,115,22,0.2)", pointBackgroundColor: "#f97316" },
    ],
  };
}

function scatterData() {
  const points = [];
  for (let i = 0; i < 40; i++) {
    points.push({ x: Math.round((Math.random() * 100 + 10) * 100) / 100, y: Math.round((Math.random() * 5 + 1) * 10) / 10 });
  }
  return {
    datasets: [{
      label: "Price vs Rating",
      data: points,
      backgroundColor: "rgba(99,102,241,0.6)",
      borderColor: "#6366f1",
    }],
  };
}

function makeOptions(isDark, extra = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor(isDark) } },
    },
    scales: extra.scales
      ? Object.fromEntries(
          Object.entries(extra.scales).map(([key, val]) => [
            key,
            { ...val, ticks: { color: textColor(isDark), ...val?.ticks }, grid: { color: baseScaleColor(isDark), ...val?.grid } },
          ])
        )
      : undefined,
    ...extra,
  };
}

const CHARTS = [
  { title: "Line Chart - Monthly Sales", Component: Line, data: lineChartData, scales: { x: {}, y: { beginAtZero: true } } },
  { title: "Bar Chart - Quarterly Comparison", Component: Bar, data: barChartData, scales: { x: {}, y: { beginAtZero: true } } },
  { title: "Doughnut - Revenue by Source", Component: Doughnut, data: doughnutData },
  { title: "Polar Area - Department Budgets", Component: PolarArea, data: polarAreaData },
  { title: "Radar - Employee Performance", Component: Radar, data: radarData },
  { title: "Scatter - Price vs Rating", Component: Scatter, data: scatterData, scales: { x: { title: { display: true, text: "Price ($)" } }, y: { title: { display: true, text: "Rating" } } } },
];

export default function ChartjsPage() {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div>
      <Breadcrumb title="Chart.js" items={BREADCRUMB_ITEMS} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {CHARTS.map(({ title, Component, data, scales }) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: 350 }} role="img" aria-label={title}>
                <Component data={data()} options={makeOptions(isDark, scales ? { scales } : {})} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
