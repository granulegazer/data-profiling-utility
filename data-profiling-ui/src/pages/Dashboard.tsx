import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SectionCard from '../components/SectionCard';
import StatCard from '../components/StatCard';
import QualityBadge from '../components/QualityBadge';
import EntityTable from '../components/EntityTable';
import { api } from '../api/client';

interface ColumnStats {
  column_name: string;
  data_type: string;
  null_count: number;
  null_percentage: number;
  unique_count: number;
  unique_percentage: number;
}

interface Dataset {
  dataset_name: string;
  row_count: number;
  column_count: number;
  file_size_bytes: number;
  columns: ColumnStats[];
  profiled_at: string;
}

interface JobResult {
  job_id: string;
  job_name: string;
  status: string;
  datasets: Dataset[];
  total_rows: number;
  total_columns: number;
  completed_at: string;
}

interface Job {
  job_id: string;
  name: string;
  status: string;
  progress: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

function Dashboard() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [results, setResults] = useState<JobResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: number;

    const fetchJobData = async () => {
      try {
        // Fetch job status
        const jobResponse = await api.get(`/jobs/${jobId}`);
        setJob(jobResponse.data);

        // If job is completed, fetch results
        if (jobResponse.data.status === 'completed') {
          const resultsResponse = await api.get(`/jobs/${jobId}/results`);
          setResults(resultsResponse.data);
          setLoading(false);
          if (intervalId) clearInterval(intervalId);
        } else if (jobResponse.data.status === 'failed') {
          setError(jobResponse.data.error_message || 'Job failed');
          setLoading(false);
          if (intervalId) clearInterval(intervalId);
        }
      } catch (err: any) {
        console.error('Error fetching job data:', err);
        setError(err.response?.data?.detail || 'Failed to fetch job data');
        setLoading(false);
        if (intervalId) clearInterval(intervalId);
      }
    };

    // Initial fetch
    fetchJobData();

    // Poll for updates every 2 seconds if job is not completed
    intervalId = window.setInterval(() => {
      if (job?.status === 'pending' || job?.status === 'running') {
        fetchJobData();
      }
    }, 2000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, job?.status]);

  // Calculate quality metrics from actual data
  const calculateQualityScore = (dataset: Dataset): number => {
    if (dataset.columns.length === 0) return 0;
    
    // Calculate average completeness (inverse of null percentage)
    const avgCompleteness = dataset.columns.reduce((sum, col) => 
      sum + (100 - col.null_percentage), 0) / dataset.columns.length;
    
    return Math.round(avgCompleteness);
  };

  const getQualityGrade = (score: number): 'Gold' | 'Silver' | 'Bronze' => {
    if (score >= 85) return 'Gold';
    if (score >= 70) return 'Silver';
    return 'Bronze';
  };

  if (loading) {
    return (
      <div className="page">
        <section className="hero">
          <div>
            <h1>Loading Profiling Results...</h1>
            <p className="lede">Job ID: {jobId}</p>
            {job && (
              <p className="lede">Status: {job.status} • Progress: {job.progress.toFixed(0)}%</p>
            )}
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <section className="hero">
          <div>
            <h1>Error Loading Results</h1>
            <p className="lede" style={{ color: '#ff6b6b' }}>{error}</p>
            <button className="btn btn--ghost" onClick={() => navigate('/history')}>
              ← Back to History
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="page">
        <section className="hero">
          <div>
            <h1>No Results Available</h1>
            <p className="lede">Job ID: {jobId}</p>
            <button className="btn btn--ghost" onClick={() => navigate('/history')}>
              ← Back to History
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Calculate metrics from actual results
  const datasetScores = results.datasets.map(d => calculateQualityScore(d));
  const averageQualityScore = datasetScores.length > 0 
    ? Math.round(datasetScores.reduce((a, b) => a + b, 0) / datasetScores.length)
    : 0;
  const overallGrade = getQualityGrade(averageQualityScore);

  // Quality distribution
  const qualityDistribution = {
    Gold: datasetScores.filter(s => s >= 85).length,
    Silver: datasetScores.filter(s => s >= 70 && s < 85).length,
    Bronze: datasetScores.filter(s => s < 70).length,
  };

  // Transform datasets into entities format
  const entities = results.datasets.map((dataset, idx) => {
    const score = datasetScores[idx];
    const grade = getQualityGrade(score);
    
    return {
      id: idx + 1,
      name: dataset.dataset_name,
      type: 'CSV File',
      rows: dataset.row_count.toLocaleString(),
      columns: dataset.column_count,
      score: score,
      grade: grade,
      status: 'Completed',
      metadata: `${dataset.columns.length} columns profiled • ${(dataset.file_size_bytes / 1024).toFixed(2)} KB`
    };
  });

  return (
    <div className="page">
      <section className="hero">
        <div>
          <h1>{results.job_name}</h1>
          <p className="lede">
            Job ID: {jobId} • Profiled on {new Date(results.completed_at).toLocaleString()}
          </p>
          <button className="btn btn--ghost" onClick={() => navigate('/history')}>
            ← Back to History
          </button>
        </div>
      </section>

      {/* Dataset-Level Summary Cards */}
      <SectionCard
        title="Dataset Summary"
        subtitle="Overall metrics aggregated across all files"
      >
        <div className="stat-grid">
          <StatCard
            label="Total Files"
            value={results.datasets.length.toString()}
            hint="CSV files profiled"
          />
          <StatCard
            label="Average Quality Score"
            value={`${averageQualityScore}%`}
            hint="Based on data completeness"
          />
          <StatCard
            label="Total Rows"
            value={results.total_rows.toLocaleString()}
            hint="Sum of all rows"
          />
          <StatCard
            label="Total Columns"
            value={results.total_columns.toString()}
            hint="Sum of all columns"
          />
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Overall Quality Grade:</span>
          <QualityBadge grade={overallGrade} />
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
