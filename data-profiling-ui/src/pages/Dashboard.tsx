import { useParams, useNavigate } from 'react-router-dom';
import SectionCard from '../components/SectionCard';
import StatCard from '../components/StatCard';
import QualityBadge from '../components/QualityBadge';
import EntityTable from '../components/EntityTable';
import { entities } from '../mockData';

function Dashboard() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  // Mock data - replace with API call
  const datasetProfile = {
    name: 'Customer Database Profile',
    totalEntities: 3,
    averageQualityScore: 85,
    totalRows: 630000,
    totalColumns: 47,
    qualityGrade: 'Gold' as const,
    profiledAt: '2025-11-26T10:30:00Z',
  };

  const qualityDistribution = {
    Gold: 2,
    Silver: 1,
    Bronze: 0,
  };

  return (
    <div className="page">
      <section className="hero">
        <div>
          <h1>{datasetProfile.name}</h1>
          <p className="lede">
            Job ID: {jobId} • Profiled on {new Date(datasetProfile.profiledAt).toLocaleString()}
          </p>
          <button className="btn btn--ghost" onClick={() => navigate('/history')}>
            ← Back to History
          </button>
        </div>
      </section>

      {/* Dataset-Level Summary Cards */}
      <SectionCard
        title="Dataset Summary"
        subtitle="Overall metrics aggregated across all entities"
      >
        <div className="stat-grid">
          <StatCard
            label="Total Entities"
            value={datasetProfile.totalEntities.toString()}
            hint="Tables profiled"
          />
          <StatCard
            label="Average Quality Score"
            value={`${datasetProfile.averageQualityScore}%`}
            hint="Aggregated across entities"
          />
          <StatCard
            label="Total Rows"
            value={datasetProfile.totalRows.toLocaleString()}
            hint="Sum of all entity rows"
          />
          <StatCard
            label="Total Columns"
            value={datasetProfile.totalColumns.toString()}
            hint="Sum of all entity columns"
          />
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Overall Quality Grade:</span>
          <QualityBadge grade={datasetProfile.qualityGrade} />
        </div>
      </SectionCard>

      {/* Data Quality Visualizations */}
      <SectionCard
        title="Quality Distribution"
        subtitle="Breakdown of entity quality grades"
      >
        <div className="quality-bar">
          {(['Gold', 'Silver', 'Bronze'] as const).map((grade) => (
            <div
              key={grade}
              className={`quality-bar__segment quality-bar__segment--${grade.toLowerCase()}`}
            >
              <div className="quality-bar__value">{qualityDistribution[grade]}</div>
              <div className="quality-bar__label">{grade}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Entity List */}
      <SectionCard
        title="Entity Profiles"
        subtitle="Click an entity to view detailed profiling results"
        action={
          <button className="btn btn--ghost">Export Report</button>
        }
      >
        <EntityTable entities={entities} />
      </SectionCard>
    </div>
  );
}

export default Dashboard;
