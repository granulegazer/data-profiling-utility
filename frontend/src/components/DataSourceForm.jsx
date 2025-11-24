/**
 * Form component for configuring data source connections
 */
import { useState } from 'react';
import { profilingApi } from '../services/api';

const DataSourceForm = ({ onJobCreated }) => {
  const [sourceType, setSourceType] = useState('file');
  const [jobName, setJobName] = useState('');
  const [config, setConfig] = useState({});
  const [tableName, setTableName] = useState('');
  const [sampleSize, setSampleSize] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testing, setTesting] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    setError(null);
    try {
      const response = await profilingApi.testConnection({
        source_type: sourceType,
        config: config,
      });
      if (response.data.success) {
        alert('Connection successful!');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Connection test failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setTesting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      try {
        const response = await profilingApi.uploadFile(selectedFile);
        setConfig({ file_path: response.data.file_path });
      } catch (err) {
        setError('File upload failed: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const jobData = {
        job_name: jobName,
        source_type: sourceType,
        source_config: config,
        table_name: tableName || undefined,
        sample_size: sampleSize ? parseInt(sampleSize) : undefined,
      };

      const response = await profilingApi.createProfilingJob(jobData);
      onJobCreated(response.data);
    } catch (err) {
      setError('Failed to create profiling job: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-source-form">
      <h2>Configure Data Source</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Job Name:</label>
          <input
            type="text"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            required
            placeholder="My Profiling Job"
          />
        </div>

        <div className="form-group">
          <label>Source Type:</label>
          <select value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
            <option value="file">File (CSV, JSON, Parquet, Excel)</option>
            <option value="postgres">PostgreSQL</option>
            <option value="oracle">Oracle</option>
            <option value="api">API / Data Lake</option>
          </select>
        </div>

        {sourceType === 'file' && (
          <div className="form-group">
            <label>Upload File:</label>
            <input type="file" onChange={handleFileUpload} accept=".csv,.json,.parquet,.xlsx,.xls" />
            {file && <p>Selected: {file.name}</p>}
          </div>
        )}

        {sourceType === 'postgres' && (
          <>
            <div className="form-group">
              <label>Host:</label>
              <input
                type="text"
                value={config.host || ''}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                placeholder="localhost"
              />
            </div>
            <div className="form-group">
              <label>Port:</label>
              <input
                type="number"
                value={config.port || 5432}
                onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Database:</label>
              <input
                type="text"
                value={config.database || ''}
                onChange={(e) => setConfig({ ...config, database: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>User:</label>
              <input
                type="text"
                value={config.user || ''}
                onChange={(e) => setConfig({ ...config, user: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={config.password || ''}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Table Name (optional):</label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Leave empty to auto-detect"
              />
            </div>
            <button type="button" onClick={handleTestConnection} disabled={testing}>
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
          </>
        )}

        {sourceType === 'oracle' && (
          <>
            <div className="form-group">
              <label>Host:</label>
              <input
                type="text"
                value={config.host || ''}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Port:</label>
              <input
                type="number"
                value={config.port || 1521}
                onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Service Name:</label>
              <input
                type="text"
                value={config.service || ''}
                onChange={(e) => setConfig({ ...config, service: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>User:</label>
              <input
                type="text"
                value={config.user || ''}
                onChange={(e) => setConfig({ ...config, user: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={config.password || ''}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Table Name (optional):</label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
              />
            </div>
            <button type="button" onClick={handleTestConnection} disabled={testing}>
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
          </>
        )}

        {sourceType === 'api' && (
          <>
            <div className="form-group">
              <label>Base URL:</label>
              <input
                type="text"
                value={config.base_url || ''}
                onChange={(e) => setConfig({ ...config, base_url: e.target.value })}
                placeholder="https://api.example.com"
              />
            </div>
            <div className="form-group">
              <label>Endpoint/Dataset Name:</label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="users"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Sample Size (optional):</label>
          <input
            type="number"
            value={sampleSize}
            onChange={(e) => setSampleSize(e.target.value)}
            placeholder="Leave empty for full dataset"
          />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Creating Job...' : 'Start Profiling'}
        </button>
      </form>
    </div>
  );
};

export default DataSourceForm;
