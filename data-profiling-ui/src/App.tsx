import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Configuration from './pages/Configuration';
import Dashboard from './pages/Dashboard';
import EntityView from './pages/EntityView';
import History from './pages/History';
import './App.css';

function App() {
  return (
    <Router>
      <div className="page">
        <NavBar
          datasetName="Data Profiling Utility"
          overallScore={0}
          qualityGrade="Gold"
        />

        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/configure" element={<Configuration />} />
            <Route path="/dashboard/:jobId" element={<Dashboard />} />
            <Route path="/entity/:entityId" element={<EntityView />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
