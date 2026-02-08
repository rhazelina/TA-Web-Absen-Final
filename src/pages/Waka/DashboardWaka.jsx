import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { FaUser } from "react-icons/fa";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import "./DashboardWaka.css";
import { useNavigate } from "react-router-dom";
import NavbarWaka from "../../components/Waka/NavbarWaka";

import CustomAlert from "../../components/Common/CustomAlert";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function DashboardWaka() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  // Custom Alert State
  const [alertState, setAlertState] = useState({
    show: false,
    type: 'confirm',
    title: '',
    message: ''
  });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const [statistik, setStatistik] = useState({
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpha: 0,
    pulang: 0,
  });

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  const fetchData = async () => {
    try {
      // Dynamic import to avoid circular dependencies if any, though direct import is fine here
      // const { default: apiClient } = await import('../../services/api');
      // Using global apiClient import at top would be better, but let's stick to pattern
      const { default: apiClient } = await import("../../services/api");

      const response = await apiClient.get('waka/dashboard/summary');
      const { statistik: stats, trend } = response.data;

      setStatistik(stats);

      // Process trend data for chart
      const labels = trend.map(t => t.label);
      const hadirData = trend.map(t => t.hadir);
      const izinData = trend.map(t => t.izin);
      const sakitData = trend.map(t => t.sakit);
      const alphaData = trend.map(t => t.alpha);
      const pulangData = trend.map(t => t.terlambat); // Using terlambat for pulang column for now based on backend map

      setChartData({
        labels,
        datasets: [
          {
            label: "Hadir",
            data: hadirData,
            backgroundColor: "#1FA83D",
          },
          {
            label: "Izin",
            data: izinData,
            backgroundColor: "#d8bf1a",
          },
          {
            label: "Sakit",
            data: sakitData,
            backgroundColor: "#9A0898",
          },
          {
            label: "Alpha",
            data: alphaData,
            backgroundColor: "#D90000",
          },
          {
            label: "Terlambat",
            data: pulangData,
            backgroundColor: "#FF5F1A",
          },
        ],
      });

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const data = chartData.labels.length > 0 ? chartData : {
    // Fallback/Loading state
    labels: ["Loading..."],
    datasets: [{ label: "Loading", data: [0], backgroundColor: "#ccc" }]
  };

  const tanggal = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleLogoutClick = () => {
    setAlertState({
      show: true,
      type: 'confirm',
      title: 'Konfirmasi Keluar',
      message: 'Apakah Anda yakin ingin keluar?'
    });
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate('/login');
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, show: false }));
  };

  const jam = now.toLocaleTimeString("id-ID");

  return (
    <div className="waka-dashboard-page">
      <NavbarWaka />
      <div className="waka-dashboard-container">
        {/* SIDEBAR */}
        <aside className="waka-dashboard-sidebar">
          <div className="waka-dashboard-profile">
            <div className="waka-dashboard-avatar">
              <FaUser />
            </div>
            <p>
              WAKA
              <br />
              KESISWAAN
            </p>
          </div>
          <button className="waka-btn-logout" onClick={handleLogoutClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
            Keluar
          </button>
        </aside>

        {/* CONTENT */}
        <main className="waka-dashboard-content">
          {/* TOP ROW */}
          <div className="waka-dashboard-top">
            {/* DATE BOX */}
            <div className="waka-dashboard-datebox">
              <div className="waka-dashboard-date">{tanggal}</div>
              <div className="waka-dashboard-clock">{jam}</div>
              <div className="waka-dashboard-semester">Semester Genap</div>
            </div>

            {/* MINI STATS */}
            <div className="waka-dashboard-mini-wrapper">
              <Mini title="Hadir" value={statistik.hadir} cls="hadir" />
              <Mini title="Izin" value={statistik.izin} cls="izin" />
              <Mini title="Sakit" value={statistik.sakit} cls="sakit" />
              <Mini title="Alpha" value={statistik.alpha} cls="alpha" />
              <Mini title="Terlambat" value={statistik.terlambat} cls="pulang" />
            </div>
          </div>

          {/* CHART */}
          <div className="waka-dashboard-chart">
            <Bar
              data={data}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 5,
                    },
                  },
                },
              }}
            />
          </div>
        </main>
      </div>

      <CustomAlert
        isOpen={alertState.show}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onConfirm={handleConfirmLogout}
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
      />
    </div>
  );
}

function Mini({ title, value, cls }) {
  return (
    <div className={`waka-dashboard-mini ${cls}`}>
      <span>{title}</span>
      <b>{value}</b>
    </div>
  );
}