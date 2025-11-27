import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SectionCard from '../components/SectionCard';
import StatCard from '../components/StatCard';
import QualityBadge from '../components/QualityBadge';
import EntityTable from '../components/EntityTable';
import { api } from '../api/client';
import { Dataset, JobResult, Job } from '../types/profiling';

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
    // Use backend dataset quality if available
    if (dataset.dataset_quality?.overall_quality_score) {
      return Math.round(dataset.dataset_quality.overall_quality_score);
    }
    
    // Fallback: calculate from completeness
    if (dataset.columns.length === 0) return 0;
    const avgCompleteness = dataset.columns.reduce((sum, col) => 
      sum + (100 - col.null_percentage), 0) / dataset.columns.length;
    
    return Math.round(avgCompleteness);
  };

  const getQualityGrade = (dataset: Dataset): 'Gold' | 'Silver' | 'Bronze' => {
    // Use backend dataset quality grade if available
    if (dataset.dataset_quality?.quality_grade) {
      return dataset.dataset_quality.quality_grade;
    }
    
    // Fallback based on score
    const score = calculateQualityScore(dataset);
    if (score >= 90) return 'Gold';
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
  const datasetGrades = results.datasets.map(d => getQualityGrade(d));
  const averageQualityScore = datasetScores.length > 0 
    ? Math.round(datasetScores.reduce((a, b) => a + b, 0) / datasetScores.length)
    : 0;
  
  // Get overall grade from first dataset or calculate
  const overallGrade = results.datasets[0]?.dataset_quality?.quality_grade || 
    (averageQualityScore >= 90 ? 'Gold' : averageQualityScore >= 70 ? 'Silver' : 'Bronze');

  // Quality distribution
  const qualityDistribution = {
    Gold: datasetGrades.filter(g => g === 'Gold').length,
    Silver: datasetGrades.filter(g => g === 'Silver').length,
    Bronze: datasetGrades.filter(g => g === 'Bronze').length,
  };

  // Calculate PII risk
  const avgPIIRisk = results.datasets
    .filter(d => d.dataset_quality?.pii_risk_score !== undefined)
    .reduce((sum, d) => sum + (d.dataset_quality?.pii_risk_score || 0), 0) / 
    Math.max(results.datasets.length, 1);

  // Transform datasets into entities format
  const entities = results.datasets.map((dataset, idx) => {
    const score = datasetScores[idx];
    const grade = datasetGrades[idx];
    
    // Count columns with PII
    const piiColumns = dataset.columns.filter(col => 
      col.pii_detection && col.pii_detection.pii_categories.length > 0
    ).length;
    
    return {
      id: idx + 1,
      name: dataset.dataset_name,
      type: 'CSV File',
      rows: dataset.row_count.toLocaleString(),
      columns: dataset.column_count,
      score: score,
      grade: grade,
      status: 'Completed',
      metadata: `${dataset.columns.length} columns profiled • ${(dataset.file_size_bytes / 1024).toFixed(2)} KB${piiColumns > 0 ? ` • ${piiColumns} columns with PII` : ''}`
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
            hint="Based on data quality analysis"
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

        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: '500' }}>Overall Quality Grade:</span>
            <QualityBadge grade={overallGrade} />
          </div>
          {avgPIIRisk > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: '500' }}>PII Risk Score:</span>
              <span style={{ 
                padding: '0.25rem 0.75rem', 
                borderRadius: '12px',
                backgroundColor: avgPIIRisk > 50 ? '#fee' : avgPIIRisk > 20 ? '#fff3cd' : '#d4edda',
                color: avgPIIRisk > 50 ? '#c00' : avgPIIRisk > 20 ? '#856404' : '#155724',
                fontWeight: '600'
              }}>
                {avgPIIRisk.toFixed(1)}% {avgPIIRisk > 50 ? 'High' : avgPIIRisk > 20 ? 'Medium' : 'Low'}
              </span>
            </div>
          )}
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
        <EntityTable 
          entities={entities}
          onEntityClick={(entityId) => {
            const datasetIndex = entityId - 1;
            const dataset = results.datasets[datasetIndex];
            navigate(`/entity/${jobId}/${datasetIndex}`, { 
              state: { dataset, jobName: results.job_name } 
            });
          }}
        />
      </SectionCard>
    </div>
  );
}

export default Dashboard;
