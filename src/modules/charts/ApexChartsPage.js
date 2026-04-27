import ReactApexChart from "react-apexcharts";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useTheme } from "../../core/theme/ThemeContext";

const BREADCRUMB_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Charts" },
  { label: "ApexCharts" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function baseOptions(isDark) {
  return {
    theme: { mode: isDark ? "dark" : "light" },
    chart: { background: "transparent", toolbar: { show: false } },
    grid: { borderColor: isDark ? "#334155" : "#e2e8f0" },
    tooltip: { theme: isDark ? "dark" : "light" },
  };
}

function lineChartConfig(isDark) {
  return {
    options: {
      ...baseOptions(isDark),
      chart: { ...baseOptions(isDark).chart, type: "line" },
      xaxis: { categories: MONTHS },
      stroke: { curve: "smooth", width: 3 },
      colors: ["#6366f1"],
      title: { text: undefined },
    },
    series: [{ name: "Revenue ($K)", data: [32, 45, 38, 52, 48, 61, 55, 72, 68, 74, 62, 78] }],
  };
}

function areaChartConfig(isDark) {
  return {
    options: {
      ...baseOptions(isDark),
      chart: { ...baseOptions(isDark).chart, type: "area" },
      xaxis: { categories: MONTHS },
      stroke: { curve: "smooth", width: 2 },
      fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
      colors: ["#3b82f6", "#f59e0b"],
    },
    series: [
      { name: "Desktop", data: [31, 40, 28, 51, 42, 55, 47, 60, 53, 58, 49, 63] },
      { name: "Mobile", data: [11, 32, 45, 32, 34, 52, 41, 48, 55, 42, 60, 58] },
    ],
  };
}

function barChartConfig(isDark) {
  return {
    options: {
      ...baseOptions(isDark),
      chart: { ...baseOptions(isDark).chart, type: "bar" },
      xaxis: { categories: ["Electronics", "Clothing", "Food", "Books", "Sports", "Home"] },
      plotOptions: { bar: { borderRadius: 4, columnWidth: "55%" } },
      colors: ["#8b5cf6"],
    },
    series: [{ name: "Sales ($K)", data: [44, 55, 41, 37, 22, 43] }],
  };
}

function pieChartConfig(isDark) {
  return {
    options: {
      ...baseOptions(isDark),
      labels: ["Chrome", "Firefox", "Safari", "Edge"],
      colors: ["#3b82f6", "#f97316", "#a855f7", "#22c55e"],
      legend: { position: "bottom" },
    },
    series: [65, 15, 12, 8],
  };
}

function donutChartConfig(isDark) {
  return {
    options: {
      ...baseOptions(isDark),
      labels: ["Delivered", "Pending", "Processing", "Cancelled"],
      colors: ["#22c55e", "#f59e0b", "#3b82f6", "#ef4444"],
      legend: { position: "bottom" },
      plotOptions: { pie: { donut: { size: "60%" } } },
    },
    series: [45, 25, 20, 10],
  };
}

function radialBarConfig(isDark) {
  return {
    options: {
      ...baseOptions(isDark),
      labels: ["Revenue", "Users", "Orders", "Tickets"],
      colors: ["#6366f1", "#22c55e", "#f59e0b", "#ec4899"],
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: { fontSize: "14px", color: isDark ? "#e2e8f0" : "#1e293b" },
            value: { fontSize: "16px", color: isDark ? "#e2e8f0" : "#1e293b" },
            total: {
              show: true,
              label: "Overall",
              color: isDark ? "#94a3b8" : "#64748b",
            },
          },
        },
      },
    },
    series: [75, 85, 65, 90],
  };
}

function radarChartConfig(isDark) {
  return {
    options: {
      ...baseOptions(isDark),
      chart: { ...baseOptions(isDark).chart, type: "radar" },
      xaxis: { categories: ["Design", "Dev", "Marketing", "Sales", "Support", "Research"] },
      colors: ["#6366f1", "#f97316"],
      stroke: { width: 2 },
      fill: { opacity: 0.2 },
      markers: { size: 3 },
      yaxis: { show: false },
    },
    series: [
      { name: "Team A", data: [80, 90, 70, 60, 75, 85] },
      { name: "Team B", data: [60, 75, 85, 80, 70, 65] },
    ],
  };
}

function heatmapChartConfig(isDark) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const generateData = (count) => {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({ x: `${i + 8}:00`, y: Math.floor(Math.random() * 90) + 10 });
    }
    return data;
  };
  return {
    options: {
      ...baseOptions(isDark),
      chart: { ...baseOptions(isDark).chart, type: "heatmap" },
      colors: ["#6366f1"],
      dataLabels: { enabled: false },
      plotOptions: { heatmap: { radius: 2 } },
    },
    series: days.map((day) => ({ name: day, data: generateData(12) })),
  };
}

const CHARTS = [
  { title: "Line Chart - Monthly Revenue", type: "line", config: lineChartConfig },
  { title: "Area Chart - Website Visits", type: "area", config: areaChartConfig },
  { title: "Bar Chart - Sales by Category", type: "bar", config: barChartConfig },
  { title: "Pie Chart - Browser Market Share", type: "pie", config: pieChartConfig },
  { title: "Donut Chart - Order Status", type: "donut", config: donutChartConfig },
  { title: "Radial Bar - Goal Completion", type: "radialBar", config: radialBarConfig },
  { title: "Radar Chart - Team Skills", type: "radar", config: radarChartConfig },
  { title: "Heatmap - Activity Hours", type: "heatmap", config: heatmapChartConfig },
];

export default function ApexChartsPage() {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div>
      <Breadcrumb title="ApexCharts" items={BREADCRUMB_ITEMS} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {CHARTS.map(({ title, type, config }) => {
          const { options, series } = config(isDark);
          return (
            <Card key={title}>
              <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div role="img" aria-label={title}>
                  <ReactApexChart options={options} series={series} type={type} height={350} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
