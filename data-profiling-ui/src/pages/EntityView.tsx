import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SectionCard from '../components/SectionCard';
import QualityBadge from '../components/QualityBadge';
import { api } from '../api/client';
import type { Dataset, JobResult } from '../types/profiling';

type Tab = 'overview' | 'columns' | 'quality' | 'patterns' | 'integrity' | 'keys' | 'pii';

function EntityView() {
  const { jobId, datasetIndex } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [dataset, setDataset] = useState<Dataset | null>(location.state?.dataset || null);
  const [jobName, setJobName] = useState<string>(location.state?.jobName || '');
  const [loading, setLoading] = useState(!dataset);

  useEffect(() => {
    // If dataset not passed via navigation, fetch it
    if (!dataset && jobId && datasetIndex) {
      const fetchDataset = async () => {
        try {
          const response = await api.get<JobResult>(`/jobs/${jobId}/results`);
          const idx = parseInt(datasetIndex);
          if (response.data.datasets[idx]) {
            setDataset(response.data.datasets[idx]);
            setJobName(response.data.job_name);
          }
          setLoading(false);
        } catch (err) {
          console.error('Error fetching dataset:', err);
          setLoading(false);
        }
      };
      fetchDataset();
    }
  }, [jobId, datasetIndex, dataset]);

  if (loading) {
    return (
      <div className="page">
        <section className="hero">
          <div>
            <h1>Loading Entity Details...</h1>
          </div>
        </section>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="page">
        <section className="hero">
          <div>
            <h1>Entity Not Found</h1>
            <button className="btn btn--ghost" onClick={() => navigate(-1)}>
              ← Back to Dashboard
            </button>
          </div>
        </section>
      </div>
    );
  }

  const qualityGrade = dataset.dataset_quality?.quality_grade || 'Bronze';
  const qualityScore = dataset.dataset_quality?.overall_quality_score || 0;

  return (
    <div className="page">
      <section className="hero">
        <div>
          <h1>{dataset.dataset_name}</h1>
          <p className="lede">
            CSV File • {dataset.row_count.toLocaleString()} rows, {dataset.column_count} columns • {jobName}
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <QualityBadge grade={qualityGrade} />
              <span style={{ fontWeight: '600' }}>{qualityScore.toFixed(1)}% quality score</span>
            </div>
            {dataset.dataset_quality && (
              <span style={{ 
                padding: '0.25rem 0.75rem', 
                borderRadius: '12px',
                backgroundColor: dataset.dataset_quality.pii_risk_score > 50 ? '#fee' : dataset.dataset_quality.pii_risk_score > 20 ? '#fff3cd' : '#d4edda',
                color: dataset.dataset_quality.pii_risk_score > 50 ? '#c00' : dataset.dataset_quality.pii_risk_score > 20 ? '#856404' : '#155724',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>
                PII Risk: {dataset.dataset_quality.pii_risk_score.toFixed(1)}%
              </span>
            )}
          </div>
          <button className="btn btn--ghost" style={{ marginTop: '1rem' }} onClick={() => navigate(`/dashboard/${jobId}`)}>
            ← Back to Dashboard
          </button>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 'overview' ? 'tab tab--active' : 'tab'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'columns' ? 'tab tab--active' : 'tab'}
          onClick={() => setActiveTab('columns')}
        >
          Column Statistics
        </button>
        <button
          className={activeTab === 'quality' ? 'tab tab--active' : 'tab'}
          onClick={() => setActiveTab('quality')}
        >
          Data Quality
        </button>
        <button
          className={activeTab === 'patterns' ? 'tab tab--active' : 'tab'}
          onClick={() => setActiveTab('patterns')}
        >
          Patterns & Distributions
        </button>
        <button
          className={activeTab === 'integrity' ? 'tab tab--active' : 'tab'}
          onClick={() => setActiveTab('integrity')}
        >
          Referential Integrity
        </button>
        <button
          className={activeTab === 'keys' ? 'tab tab--active' : 'tab'}
          onClick={() => setActiveTab('keys')}
        >
          Candidate Keys
        </button>
        <button
          className={activeTab === 'pii' ? 'tab tab--active' : 'tab'}
          onClick={() => setActiveTab('pii')}
        >
          PII Detection
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          <SectionCard title="Dataset Statistics" subtitle="Dataset-Level Rule #1">
            {dataset.dataset_statistics ? (
              <div className="stat-grid">
                <div>
                  <div className="muted">Total Records</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                    {dataset.dataset_statistics.total_records.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="muted">Total Columns</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                    {dataset.dataset_statistics.total_columns}
                  </div>
                </div>
                <div>
                  <div className="muted">Dataset Size</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                    {(dataset.dataset_statistics.dataset_size_bytes / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
                <div>
                  <div className="muted">Profiling Duration</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                    {dataset.dataset_statistics.profiling_duration_seconds.toFixed(2)}s
                  </div>
                </div>
              </div>
            ) : (
              <p className="muted">Dataset statistics not available (rule not enabled)</p>
            )}
          </SectionCard>

          <SectionCard title="Dataset Quality Metrics" subtitle="Dataset-Level Rule #2">
            {dataset.dataset_quality ? (
              <div className="stat-grid">
                <div>
                  <div className="muted">Overall Completeness</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                    {dataset.dataset_quality.overall_completeness.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="muted">Quality Score</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {dataset.dataset_quality.overall_quality_score.toFixed(2)}
                    <QualityBadge grade={dataset.dataset_quality.quality_grade} />
                  </div>
                </div>
                <div>
                  <div className="muted">Quality Grade</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                    {dataset.dataset_quality.quality_grade}
                  </div>
                </div>
                <div>
                  <div className="muted">PII Risk Score</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                    {dataset.dataset_quality.pii_risk_score.toFixed(2)}%
                  </div>
                </div>
              </div>
            ) : (
              <p className="muted">Dataset quality metrics not available (rule not enabled)</p>
            )}
          </SectionCard>
        </>
      )}

      {activeTab === 'columns' && (
        <SectionCard title="Column Statistics" subtitle="Attribute-Level Rules - Comprehensive statistics per column">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Column</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Type</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: '600' }}>Null %</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: '600' }}>Unique</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: '600' }}>Duplicates</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: '600' }}>Quality</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem', fontWeight: '600' }}>PII</th>
                </tr>
              </thead>
              <tbody>
                {dataset.columns.map((col, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>{col.column_name}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        backgroundColor: '#f0f0f0',
                        fontSize: '0.8rem',
                        fontFamily: 'monospace'
                      }}>
                        {col.data_type}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                      {col.null_percentage.toFixed(1)}%
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                      {col.unique_count.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                      {col.duplicate_count.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                      {col.quality_metrics ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <span>{col.quality_metrics.quality_score.toFixed(0)}</span>
                          <QualityBadge grade={col.quality_metrics.quality_grade} />
                        </div>
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                      {col.pii_detection && col.pii_detection.pii_categories.length > 0 ? (
                        <span style={{ 
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: col.pii_detection.risk_level === 'High' ? '#fee' : col.pii_detection.risk_level === 'Medium' ? '#fff3cd' : '#d4edda',
                          color: col.pii_detection.risk_level === 'High' ? '#c00' : col.pii_detection.risk_level === 'Medium' ? '#856404' : '#155724',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {col.pii_detection.risk_level}
                        </span>
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {activeTab === 'quality' && (
        <SectionCard title="Column Quality Details" subtitle="Detailed quality metrics per column">
          {dataset.columns.filter(col => col.quality_metrics).length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem' }}>Column</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem' }}>Completeness</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem' }}>Validity</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem' }}>Consistency</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem' }}>Conformity</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem' }}>Score</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem' }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {dataset.columns.filter(col => col.quality_metrics).map((col, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '0.75rem', fontWeight: '500' }}>{col.column_name}</td>
                      <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                        {col.quality_metrics!.completeness_percentage.toFixed(1)}%
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                        {col.quality_metrics!.validity_percentage.toFixed(1)}%
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                        {col.quality_metrics!.consistency_score.toFixed(1)}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                        {col.quality_metrics!.conformity_rate.toFixed(1)}%
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.75rem', fontWeight: '600' }}>
                        {col.quality_metrics!.quality_score.toFixed(1)}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                        <QualityBadge grade={col.quality_metrics!.quality_grade} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">Column quality metrics not available (rule not enabled)</p>
          )}
        </SectionCard>
      )}

      {activeTab === 'patterns' && (
        <SectionCard title="Value Distributions" subtitle="Top values and distribution statistics">
          {dataset.columns.filter(col => col.value_distribution).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {dataset.columns.filter(col => col.value_distribution).slice(0, 5).map((col, idx) => (
                <div key={idx}>
                  <h3 style={{ marginBottom: '0.5rem' }}>{col.column_name}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div className="muted">Cardinality</div>
                      <div style={{ fontWeight: '600' }}>
                        {col.value_distribution!.cardinality.toLocaleString()} ({(col.value_distribution!.cardinality_ratio * 100).toFixed(2)}%)
                      </div>
                    </div>
                    {col.value_distribution!.mode && (
                      <div>
                        <div className="muted">Mode</div>
                        <div style={{ fontWeight: '600' }}>
                          {col.value_distribution!.mode} (×{col.value_distribution!.mode_frequency})
                        </div>
                      </div>
                    )}
                    {col.value_distribution!.skewness !== null && col.value_distribution!.skewness !== undefined && (
                      <div>
                        <div className="muted">Skewness</div>
                        <div style={{ fontWeight: '600' }}>
                          {col.value_distribution!.skewness.toFixed(3)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="muted" style={{ marginBottom: '0.5rem' }}>Top Values:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {col.value_distribution!.top_values.slice(0, 5).map((val, vidx) => (
                        <div key={vidx} style={{ 
                          padding: '0.5rem 0.75rem', 
                          backgroundColor: '#f5f5f5', 
                          borderRadius: '6px',
                          fontSize: '0.875rem'
                        }}>
                          <span style={{ fontWeight: '600' }}>{val.value}</span>
                          <span className="muted" style={{ marginLeft: '0.5rem' }}>
                            ({val.count.toLocaleString()} • {val.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">Value distribution not available (rule not enabled)</p>
          )}
        </SectionCard>
      )}

      {activeTab === 'integrity' && (
        <SectionCard title="Referential Integrity" subtitle="Dataset-Level Rule #3">
          {dataset.referential_integrity ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>Orphan Records</h3>
                {dataset.referential_integrity.orphan_records.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {dataset.referential_integrity.orphan_records.map((record, idx) => (
                      <li key={idx} style={{ 
                        padding: '0.75rem', 
                        backgroundColor: '#fff3cd', 
                        borderRadius: '6px',
                        marginBottom: '0.5rem',
                        borderLeft: '3px solid #856404'
                      }}>
                        <strong>{record.column}:</strong> {record.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">No orphan records detected</p>
                )}
              </div>
              
              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>Cross-Table Consistency</h3>
                {dataset.referential_integrity.cross_table_consistency.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {dataset.referential_integrity.cross_table_consistency.map((check, idx) => (
                      <li key={idx} style={{ 
                        padding: '0.75rem', 
                        backgroundColor: '#fee', 
                        borderRadius: '6px',
                        marginBottom: '0.5rem',
                        borderLeft: '3px solid #c00'
                      }}>
                        <strong>{check.column}:</strong> {check.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">No consistency issues found</p>
                )}
              </div>
            </div>
          ) : (
            <p className="muted">Referential integrity analysis not available (rule not enabled)</p>
          )}
        </SectionCard>
      )}

      {activeTab === 'keys' && (
        <SectionCard title="Candidate Key Discovery" subtitle="Dataset-Level Rule #4">
          {dataset.candidate_keys ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ marginBottom: '1rem' }}>Primary Key Suggestions</h3>
                {dataset.candidate_keys.primary_key_suggestions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {dataset.candidate_keys.primary_key_suggestions.map((key, idx) => (
                      <div key={idx} style={{ 
                        padding: '1rem', 
                        backgroundColor: '#d4edda', 
                        borderRadius: '8px',
                        borderLeft: '4px solid #00A950'
                      }}>
                        <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                          {key.columns.join(' + ')}
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
                          <span>Uniqueness: <strong>{key.uniqueness_percentage.toFixed(2)}%</strong></span>
                          <span>Composite: <strong>{key.is_composite ? 'Yes' : 'No'}</strong></span>
                          <span>Has Nulls: <strong>{key.has_nulls ? 'Yes' : 'No'}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted">No primary key suggestions found</p>
                )}
              </div>

              <div>
                <h3 style={{ marginBottom: '1rem' }}>Single Column Candidates</h3>
                {dataset.candidate_keys.single_column_keys.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                          <th style={{ textAlign: 'left', padding: '0.75rem' }}>Column</th>
                          <th style={{ textAlign: 'right', padding: '0.75rem' }}>Uniqueness</th>
                          <th style={{ textAlign: 'center', padding: '0.75rem' }}>Has Nulls</th>
                          <th style={{ textAlign: 'center', padding: '0.75rem' }}>Recommendation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataset.candidate_keys.single_column_keys.map((key, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '0.75rem', fontWeight: '500' }}>{key.columns[0]}</td>
                            <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                              {key.uniqueness_percentage.toFixed(2)}%
                            </td>
                            <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                              {key.has_nulls ? '✓' : '×'}
                            </td>
                            <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                              <span style={{ 
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                backgroundColor: key.recommendation === 'primary_key' ? '#d4edda' : key.recommendation === 'candidate_key' ? '#cfe2ff' : '#f8f9fa',
                                color: key.recommendation === 'primary_key' ? '#155724' : key.recommendation === 'candidate_key' ? '#084298' : '#6c757d',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}>
                                {key.recommendation.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="muted">No single column candidates found</p>
                )}
              </div>

              {dataset.candidate_keys.composite_keys.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: '1rem' }}>Composite Key Candidates</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {dataset.candidate_keys.composite_keys.slice(0, 10).map((key, idx) => (
                      <div key={idx} style={{ 
                        padding: '0.75rem', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontWeight: '500' }}>{key.columns.join(' + ')}</span>
                        <span className="muted" style={{ fontSize: '0.875rem' }}>
                          {key.uniqueness_percentage.toFixed(2)}% unique
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="muted">Candidate key discovery not available (rule not enabled)</p>
          )}
        </SectionCard>
      )}

      {activeTab === 'pii' && (
        <SectionCard title="PII Detection" subtitle="Attribute-Level Rule #8 - Sensitive data identification">
          {dataset.columns.filter(col => col.pii_detection).length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem' }}>Column</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem' }}>Email</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem' }}>Phone</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem' }}>SSN</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem' }}>Credit Card</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem' }}>Names</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem' }}>Confidence</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem' }}>Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {dataset.columns.filter(col => col.pii_detection && col.pii_detection.pii_categories.length > 0).map((col, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '0.75rem', fontWeight: '500' }}>{col.column_name}</td>
                      <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                        {col.pii_detection!.contains_email ? '✓' : '×'}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                        {col.pii_detection!.contains_phone ? '✓' : '×'}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                        {col.pii_detection!.contains_ssn ? '✓' : '×'}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                        {col.pii_detection!.contains_credit_card ? '✓' : '×'}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                        {col.pii_detection!.contains_names ? '✓' : '×'}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.75rem', fontWeight: '600' }}>
                        {col.pii_detection!.confidence_score.toFixed(1)}%
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: col.pii_detection!.risk_level === 'High' ? '#fee' : col.pii_detection!.risk_level === 'Medium' ? '#fff3cd' : '#d4edda',
                          color: col.pii_detection!.risk_level === 'High' ? '#c00' : col.pii_detection!.risk_level === 'Medium' ? '#856404' : '#155724',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          {col.pii_detection!.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">No PII detected or rule not enabled</p>
          )}
        </SectionCard>
      )}
    </div>
  );
}

export default EntityView;
