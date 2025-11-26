import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionCard from '../components/SectionCard';

type SourceType = 'database' | 'data_lake' | 'flat_file';
type Mode = 'browse_tables' | 'custom_query' | 'flat_file';

function Configuration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState<SourceType>('database');
  const [mode, setMode] = useState<Mode>('browse_tables');

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  const handleStartProfiling = () => {
    // TODO: API call to start profiling
    navigate('/dashboard/mock-job-id');
  };

  return (
    <div className="page">
      <section className="hero">
        <div>
          <h1>Configure Profiling Job</h1>
          <p className="lede">
            Step {step} of 3: {step === 1 ? 'Data Source Setup' : step === 2 ? 'Dataset & Entity Selection' : 'Profiling Options'}
          </p>
        </div>
      </section>

      {/* Step 1: Data Source Setup */}
      {step === 1 && (
        <SectionCard title="Step 1: Data Source Setup" subtitle="Select your data source type and connection">
          <div className="form-grid">
            <label>
              Connection Type
              <select value={sourceType} onChange={(e) => setSourceType(e.target.value as SourceType)}>
                <option value="database">Database (PostgreSQL/Oracle)</option>
                <option value="data_lake">Data Lake API</option>
                <option value="flat_file">Flat File (CSV/JSON/XML/Excel)</option>
              </select>
            </label>

            {sourceType === 'database' && (
              <>
                <label>
                  Saved Connection
                  <select>
                    <option>Select a connection...</option>
                    <option>Production PostgreSQL</option>
                    <option>Analytics Oracle DB</option>
                  </select>
                </label>
                <button className="btn btn--ghost">+ Add New Connection</button>
                <button className="btn btn--ghost">Test Connection</button>
              </>
            )}

            {sourceType === 'flat_file' && (
              <>
                <div style={{ border: '2px dashed #ccc', padding: '2rem', textAlign: 'center', borderRadius: '8px' }}>
                  <p>Drag and drop files here</p>
                  <p className="muted">or</p>
                  <button className="btn btn--primary">Upload Files</button>
                  <p className="muted" style={{ marginTop: '1rem' }}>
                    Supported: CSV, TSV, JSON, XML, Excel (XLSX/XLS)
                  </p>
                </div>
              </>
            )}
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn--ghost" onClick={handleBack}>Cancel</button>
            <button className="btn btn--primary" onClick={handleNext}>Next →</button>
          </div>
        </SectionCard>
      )}

      {/* Step 2: Dataset & Entity Selection */}
      {step === 2 && (
        <SectionCard title="Step 2: Dataset & Entity Selection" subtitle="Choose tables, write custom queries, or configure files">
          {sourceType === 'database' && (
            <>
              <div className="form-grid">
                <label>
                  Dataset (Schema/Database)
                  <input placeholder="e.g., public, CUSTOMER_CORE" defaultValue="public" />
                </label>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="mode"
                    value="browse_tables"
                    checked={mode === 'browse_tables'}
                    onChange={() => setMode('browse_tables')}
                  />
                  Browse Tables
                </label>
                <label style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="mode"
                    value="custom_query"
                    checked={mode === 'custom_query'}
                    onChange={() => setMode('custom_query')}
                  />
                  Custom Query
                </label>
              </div>

              {mode === 'browse_tables' && (
                <div style={{ marginTop: '1rem' }}>
                  <p className="muted">Select tables to profile:</p>
                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ display: 'block' }}>
                      <input type="checkbox" /> customers (125,000 rows, 15 columns)
                    </label>
                    <label style={{ display: 'block' }}>
                      <input type="checkbox" /> orders (500,000 rows, 12 columns)
                    </label>
                    <label style={{ display: 'block' }}>
                      <input type="checkbox" /> products (5,000 rows, 20 columns)
                    </label>
                  </div>
                </div>
              )}

              {mode === 'custom_query' && (
                <div className="form-grid" style={{ marginTop: '1rem' }}>
                  <label>
                    Query Name
                    <input placeholder="e.g., customer_orders_view" />
                  </label>
                  <label>
                    SQL Query
                    <textarea rows={5} placeholder="SELECT * FROM customers WHERE ..." />
                  </label>
                  <button className="btn btn--ghost">Validate Query</button>
                  <button className="btn btn--ghost">Preview Results</button>
                </div>
              )}
            </>
          )}

          {sourceType === 'flat_file' && (
            <div>
              <p>Uploaded Files:</p>
              <div style={{ marginTop: '1rem' }}>
                <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <strong>customers.csv</strong> - 2.5 MB (detected: 125,000 rows, 15 columns)
                  <div style={{ marginTop: '0.5rem' }}>
                    <label>
                      Delimiter: <input type="text" defaultValue="," style={{ width: '50px' }} />
                    </label>
                    <label style={{ marginLeft: '1rem' }}>
                      <input type="checkbox" defaultChecked /> Has header row
                    </label>
                  </div>
                </div>
              </div>
              <button className="btn btn--ghost" style={{ marginTop: '1rem' }}>+ Add More Files</button>
            </div>
          )}

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn--ghost" onClick={handleBack}>← Back</button>
            <button className="btn btn--primary" onClick={handleNext}>Next →</button>
          </div>
        </SectionCard>
      )}

      {/* Step 3: Profiling Options */}
      {step === 3 && (
        <SectionCard title="Step 3: Profiling Options" subtitle="Configure column selection and profiling rules">
          <div className="form-grid">
            <label style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="radio" name="columns" defaultChecked />
              Profile All Columns
            </label>
            <label style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="radio" name="columns" />
              Select Specific Columns
            </label>

            {sourceType === 'flat_file' && (
              <>
                <label>
                  Sample Size (rows)
                  <input type="number" placeholder="Leave empty to profile entire file" />
                </label>
              </>
            )}
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn--ghost" onClick={handleBack}>← Back</button>
            <button className="btn btn--primary" onClick={handleStartProfiling}>Start Profiling</button>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

export default Configuration;
