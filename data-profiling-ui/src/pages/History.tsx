import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import SectionCard from '../components/SectionCard';

function History() {
  const navigate = useNavigate();
  const { jobs } = useAppStore();

  return (
    <div className="page">
      <section className="hero">
        <div>
          <h1>Job History</h1>
          <p className="lede">
            View and manage all your profiling jobs
          </p>
        </div>
      </section>

      <SectionCard
        title="All Profiling Jobs"
        subtitle="Click a job to view results"
        action={
          <button className="btn btn--primary" onClick={() => navigate('/configure')}>
            + New Profiling Job
          </button>
        }
      >
        {jobs.length === 0 ? (
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Job ID</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Dataset</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Source Type</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem' }}>Entities</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Created</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr 
                    key={job.job_id}
                    style={{ borderTop: '1px solid #eee', cursor: 'pointer' }}
                    onClick={() => navigate(`/dashboard/${job.job_id}`)}
                  >
                    <td style={{ padding: '0.75rem' }}>
                      <code style={{ fontSize: '0.875rem' }}>{job.job_id.slice(0, 8)}</code>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{job.dataset_name}</td>
                    <td style={{ padding: '0.75rem' }}>{job.source_type}</td>
                    <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                      {job.completed_entities} / {job.total_entities}
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                      <span className={`status status--${job.status}`}>
                        {job.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {new Date(job.created_at).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                      <button 
                        className="btn btn--ghost"
                        style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Delete job
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export default History;
