import '../App.css';

interface NavBarProps {
  datasetName: string;
  overallScore: number;
  qualityGrade: string;
}

const NavBar = ({ datasetName, overallScore, qualityGrade }: NavBarProps) => {
  return (
    <header className="nav">
      <div className="nav__brand">
        <div className="nav__logo">DP</div>
        <div>
          <div className="nav__title">Data Profiling Utility</div>
          <div className="nav__subtitle">{datasetName}</div>
        </div>
      </div>
      <div className="nav__actions">
        <div className="pill pill--primary">New Profiling Job</div>
        <div className="pill pill--ghost">View API</div>
        <div className="pill pill--badge">
          <span className="pill__label">Overall</span>
          <span className="pill__score">{overallScore}%</span>
          <span className={`badge badge--${qualityGrade.toLowerCase()}`}>
            {qualityGrade}
          </span>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
