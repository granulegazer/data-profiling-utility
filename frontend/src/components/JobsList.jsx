/**
 * Component to display list of profiling jobs
 */
import { useState, useEffect } from 'react';
import { profilingApi } from '../services/api';

const JobsList = ({ onSelectJob, refreshTrigger }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadJobs();
  }, [refreshTrigger]);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profilingApi.listProfilingJobs();
      setJobs(response.data);
    } catch (err) {
      setError('Failed to load jobs: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await profilingApi.deleteProfilingJob(jobId);
        loadJobs();
      } catch (err) {
        alert('Failed to delete job: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="jobs-list">
      <h2>Profiling Jobs</h2>
      {jobs.length === 0 ? (
        <p>No profiling jobs yet. Create one to get started!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Job Name</th>
              <th>Source Type</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.job_name}</td>
                <td>{job.source_type}</td>
                <td>
                  <span className={`status status-${job.status}`}>
                    {job.status}
                  </span>
                </td>
                <td>{new Date(job.created_at).toLocaleString()}</td>
                <td>
                  <button onClick={() => onSelectJob(job.id)} disabled={job.status !== 'completed'}>
                    View Results
                  </button>
                  <button onClick={() => handleDelete(job.id)} className="delete-btn">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default JobsList;
