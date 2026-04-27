import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Graph = () => {
  const data = {
    labels: ["Aug 01", "Aug 08", "Aug 15", "Aug 22", "Aug 29"],
    datasets: [
      {
        label: "This Period",
        data: [12000, 15000, 18000, 20000, 22000],
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.1)",
      },
      {
        label: "Last Period",
        data: [10000, 14000, 17000, 19000, 21000],
        borderColor: "#ffa500",
        backgroundColor: "rgba(255, 165, 0, 0.1)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { boxWidth: 20, padding: 15 },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white p-4 rounded-md shadow h-72">
      <Line data={data} options={options} />
    </div>
  );
};

export default Graph;
