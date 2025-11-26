import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

interface NavBarProps {
  datasetName: string;
  overallScore: number;
  qualityGrade: string;
}

const NavBar = ({ datasetName, overallScore, qualityGrade }: NavBarProps) => {
  const navigate = useNavigate();
  
  return (
    <header className="nav">
      <div className="nav__brand">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
          <div className="nav__logo">DP</div>
          <div>
            <div className="nav__title">Data Profiling Utility</div>
            <div className="nav__subtitle">{datasetName}</div>
          </div>
        </Link>
      </div>
      <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
        <Link to="/history" style={{ textDecoration: 'none', color: 'inherit' }}>History</Link>
      </nav>
      <div className="nav__actions">
        <div className="pill pill--primary" onClick={() => navigate('/configure')} style={{ cursor: 'pointer' }}>
          New Profiling Job
        </div>
        {overallScore > 0 && (
          <div className="pill pill--badge">
            <span className="pill__label">Overall</span>
            <span className="pill__score">{overallScore}%</span>
            <span className={`badge badge--${qualityGrade.toLowerCase()}`}>
              {qualityGrade}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;
