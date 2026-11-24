import React, { useState, useRef, useEffect } from 'react';
import { Dataset, AppView } from './types';
import { parseCSV, analyzeDataset, DEMO_CSV_CONTENT } from './utils/analytics';
import { Dashboard } from './components/Dashboard';
import { PredictionSystem } from './components/PredictionSystem';
import Login from './components/Login';
import Register from './components/Register';

import {
  LayoutDashboard,
  Stethoscope,
  UploadCloud,
  FileText,
  Download,
  PlayCircle
} from 'lucide-react';

const App: React.FC = () => {

  // 🔐 Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // 📊 App states
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [view, setView] = useState<AppView>(AppView.UPLOAD);
  const [currentUser, setCurrentUser] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔓 Logout
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setIsLoggedIn(false);
    setCurrentUser("");
    setDataset(null);
  };

  // 🔄 Auto login if already stored
  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
    }
  }, []);

  // ================= LOGIN / REGISTER =================
  if (!isLoggedIn) {
    return isRegistering ? (
      <Register onSwitch={() => setIsRegistering(false)} />
    ) : (
      <Login
        onLogin={() => {
          const user = localStorage.getItem("currentUser") || "";
          setCurrentUser(user);
          setIsLoggedIn(true);
          setView(AppView.DASHBOARD);
        }}
        onSwitch={() => setIsRegistering(true)}
      />
    );
  }

  // ================= FILE HANDLING =================
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const rawData = parseCSV(content);
        const analyzedData = analyzeDataset(file.name, rawData);
        setDataset(analyzedData);
        setView(AppView.DASHBOARD);
      };
      reader.readAsText(file);
    }
  };

  const handleLoadDemo = () => {
    const rawData = parseCSV(DEMO_CSV_CONTENT);
    const analyzedData = analyzeDataset('Demo_Data.csv', rawData);
    setDataset(analyzedData);
    setView(AppView.DASHBOARD);
  };

  const downloadTemplate = () => {
    const blob = new Blob([DEMO_CSV_CONTENT], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ================= NAV ITEM =================
  const NavItem = ({ targetView, icon: Icon, label }: any) => (
    <button
      onClick={() => setView(targetView)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
        view === targetView
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-800'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  // ================= MAIN UI =================
  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">OncoSight AI</h2>

        <NavItem targetView={AppView.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
        <NavItem targetView={AppView.PREDICTION} icon={Stethoscope} label="Prediction" />

        <button
          onClick={() => setView(AppView.UPLOAD)}
          className="mt-4 flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <UploadCloud size={20} />
          Upload Data
        </button>

        {/* Bottom section */}
        <div className="mt-auto pt-6 border-t border-gray-700">
          <div className="text-sm text-gray-300 mb-3">
            👤 Logged in as: <b>{currentUser || "User"}</b>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">

        {/* Upload Page */}
        {view === AppView.UPLOAD && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Upload Dataset</h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border p-10 cursor-pointer"
            >
              <FileText size={40} />
              <p>Click to upload CSV</p>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                onChange={handleFileUpload}
              />
            </div>

            <div className="mt-4">
              <button onClick={handleLoadDemo} className="mr-3">
                <PlayCircle size={20} /> Demo
              </button>

              <button onClick={downloadTemplate}>
                <Download size={20} /> Template
              </button>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {view === AppView.DASHBOARD && (
          dataset ? (
            <Dashboard dataset={dataset} />
          ) : (
            <div className="text-center mt-20">
              <h2 className="text-xl font-semibold">No Data Available</h2>
              <p className="text-gray-500 mt-2">
                Upload a dataset or load demo data.
              </p>
            </div>
          )
        )}

        {/* Prediction */}
        {view === AppView.PREDICTION && (
          <PredictionSystem />
        )}

      </div>
    </div>
  );
};

export default App;