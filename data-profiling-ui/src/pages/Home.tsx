import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import SectionCard from '../components/SectionCard';
import StatCard from '../components/StatCard';

function Home() {
  const navigate = useNavigate();
  const { jobs } = useAppStore();

  const recentJobs = jobs.slice(0, 5);

  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Data Profiling Utility</p>
          <h1>Profile your data sources with confidence</h1>
          <p className="lede">
            Analyze datasets from databases, data lakes, and flat files. Generate comprehensive
            quality reports with enterprise-grade profiling rules.
          </p>
          <button 
            className="btn btn--primary" 
            onClick={() => navigate('/configure')}
          >
            + New Profiling Job
          </button>
        </div>
      </section>

      <SectionCard
        title="Quick Stats"
        subtitle="Overview of your profiling activity"
      >
        <div className="stat-grid">
          <StatCard 
            label="Total Jobs" 
            value={jobs.length.toString()} 
            hint="All time" 
          />
          <StatCard 
            label="Running Jobs" 
            value={jobs.filter(j => j.status === 'running').length.toString()} 
            hint="Active now" 
          />
          <StatCard 
            label="Completed" 
            value={jobs.filter(j => j.status === 'completed').length.toString()} 
            hint="Successfully finished" 
          />
          <StatCard 
            label="Failed" 
            value={jobs.filter(j => j.status === 'failed').length.toString()} 
            hint="Need attention" 
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Recent Profiling Jobs"
        subtitle="Your latest profiling activity"
        action={
          <button 
            className="btn btn--ghost" 
            onClick={() => navigate('/history')}
          >
            View All History
          </button>
        }
      >
        {recentJobs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            <p>No profiling jobs yet</p>
            <button 
              className="btn btn--primary" 
              style={{ marginTop: '1rem' }}
              onClick={() => navigate('/configure')}
            >
              Create Your First Job
            </button>
          </div>
        ) : (
          <div className="job-list">
            {recentJobs.map((job) => (
              <div 
                key={job.job_id} 
                className="job-item"
                onClick={() => navigate(`/dashboard/${job.job_id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div className="job-item__name">{job.dataset_name}</div>
                  <div className="muted">{job.source_type} • {job.total_entities} entities</div>
                </div>
                <div>
                  <span className={`status status--${job.status}`}>
                    {job.status}
                  </span>
                  <div className="muted" style={{ textAlign: 'right', marginTop: '0.25rem' }}>
                    {new Date(job.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export default Home;
