/**
 * Component to display profiling results (aggregated and detailed)
 */
import { useState, useEffect } from 'react';
import { profilingApi } from '../services/api';

const ProfilingResults = ({ jobId }) => {
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('aggregated'); // 'aggregated' or 'detailed'

  useEffect(() => {
    loadResults();
  }, [jobId]);

  const loadResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profilingApi.getProfilingResults(jobId);
      setResults(response.data);
    } catch (err) {
      setError('Failed to load results: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadResultDetail = async (resultId) => {
    try {
      const response = await profilingApi.getProfilingResultDetail(resultId);
      setSelectedResult(response.data);
      setView('detailed');
    } catch (err) {
      setError('Failed to load result detail: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) return <div>Loading results...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (results.length === 0) return <div>No results available for this job.</div>;

  return (
    <div className="profiling-results">
      <div className="view-toggle">
        <button
          className={view === 'aggregated' ? 'active' : ''}
          onClick={() => setView('aggregated')}
        >
          Aggregated View
        </button>
        <button
          className={view === 'detailed' ? 'active' : ''}
          onClick={() => setView('detailed')}
        >
          Detailed View
        </button>
      </div>

      {view === 'aggregated' && (
        <div className="aggregated-view">
          <h2>Aggregated Results</h2>
          {results.map((result) => (
            <div key={result.id} className="result-card">
              <h3>{result.table_name}</h3>
              <div className="result-summary">
                <p><strong>Total Rows:</strong> {result.total_rows.toLocaleString()}</p>
                <p><strong>Total Columns:</strong> {result.total_columns}</p>
                <p><strong>Profiled At:</strong> {new Date(result.profiled_at).toLocaleString()}</p>
              </div>
              <button onClick={() => loadResultDetail(result.id)}>
                View Detailed Analysis
              </button>

              {result.column_profiles && (
                <div className="column-summary">
                  <h4>Column Summary</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Column</th>
                        <th>Type</th>
                        <th>Completeness</th>
                        <th>Uniqueness</th>
                        <th>Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.column_profiles.map((col) => (
                        <tr key={col.id}>
                          <td>{col.column_name}</td>
                          <td>{col.data_type}</td>
                          <td>{(100 - col.null_percentage).toFixed(2)}%</td>
                          <td>{col.unique_percentage.toFixed(2)}%</td>
                          <td>
                            {col.quality_issues && col.quality_issues.length > 0 ? (
                              <span className="has-issues">{col.quality_issues.length}</span>
                            ) : (
                              <span className="no-issues">None</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {view === 'detailed' && selectedResult && (
        <div className="detailed-view">
          <button onClick={() => setView('aggregated')} className="back-btn">
            ← Back to Aggregated View
          </button>
          <h2>Detailed Analysis: {selectedResult.table_name}</h2>

          {selectedResult.column_profiles.map((col) => (
            <div key={col.id} className="column-detail">
              <h3>{col.column_name}</h3>
              <div className="detail-grid">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <p><strong>Data Type:</strong> {col.data_type}</p>
                  <p><strong>Total Count:</strong> {col.total_count.toLocaleString()}</p>
                  <p><strong>Null Count:</strong> {col.null_count.toLocaleString()} ({col.null_percentage.toFixed(2)}%)</p>
                  <p><strong>Unique Count:</strong> {col.unique_count.toLocaleString()} ({col.unique_percentage.toFixed(2)}%)</p>
                </div>

                {(col.min_value !== null || col.max_value !== null) && (
                  <div className="detail-section">
                    <h4>Numeric Statistics</h4>
                    <p><strong>Min:</strong> {col.min_value?.toFixed(2)}</p>
                    <p><strong>Max:</strong> {col.max_value?.toFixed(2)}</p>
                    <p><strong>Mean:</strong> {col.mean_value?.toFixed(2)}</p>
                    <p><strong>Median:</strong> {col.median_value?.toFixed(2)}</p>
                    <p><strong>Std Dev:</strong> {col.std_dev?.toFixed(2)}</p>
                  </div>
                )}

                {(col.min_length !== null || col.max_length !== null) && (
                  <div className="detail-section">
                    <h4>String Statistics</h4>
                    <p><strong>Min Length:</strong> {col.min_length}</p>
                    <p><strong>Max Length:</strong> {col.max_length}</p>
                    <p><strong>Avg Length:</strong> {col.avg_length?.toFixed(2)}</p>
                  </div>
                )}

                {col.top_values && col.top_values.length > 0 && (
                  <div className="detail-section">
                    <h4>Top Values</h4>
                    <table>
                      <thead>
                        <tr>
                          <th>Value</th>
                          <th>Count</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {col.top_values.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.value}</td>
                            <td>{item.count.toLocaleString()}</td>
                            <td>{item.percentage.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {col.pattern_analysis && col.pattern_analysis.length > 0 && (
                  <div className="detail-section">
                    <h4>Pattern Analysis</h4>
                    <ul>
                      {col.pattern_analysis.map((pattern, idx) => (
                        <li key={idx}>
                          {pattern.pattern}: {pattern.count} matches ({pattern.percentage.toFixed(2)}%)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {col.quality_issues && col.quality_issues.length > 0 && (
                  <div className="detail-section quality-issues">
                    <h4>Quality Issues</h4>
                    {col.quality_issues.map((issue, idx) => (
                      <div key={idx} className={`issue issue-${issue.severity}`}>
                        <strong>{issue.severity.toUpperCase()}:</strong> {issue.message}
                        <br />
                        <small>Category: {issue.category}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilingResults;
