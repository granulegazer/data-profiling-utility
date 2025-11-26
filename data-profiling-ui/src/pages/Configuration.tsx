import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionCard from '../components/SectionCard';
import { api } from '../api/client';

type SourceType = 'database' | 'data_lake' | 'flat_file';
type Mode = 'browse_tables' | 'custom_query' | 'flat_file';

function Configuration() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState<SourceType>('flat_file');
  const [mode, setMode] = useState<Mode>('browse_tables');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{name: string, size: number, path: string}>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [jobName, setJobName] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [sampleSize, setSampleSize] = useState<string>('');

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedFileData: Array<{name: string, size: number, path: string}> = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        uploadedFileData.push({
          name: file.name,
          size: file.size,
          path: response.data.file_id
        });
      }

      setUploadedFiles([...uploadedFiles, ...uploadedFileData]);
      alert(`Successfully uploaded ${uploadedFileData.length} file(s)`);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert('Failed to upload files: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleStartProfiling = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one CSV file');
      return;
    }

    if (!jobName.trim()) {
      alert('Please enter a job name');
      return;
    }

    try {
      const jobData = {
        name: jobName,
        description: `Profiling ${uploadedFiles.length} CSV file(s)`,
        file_paths: uploadedFiles.map(f => f.path),
        csv_config: {
          delimiter,
          encoding: 'utf-8',
          has_header: hasHeader
        },
        treat_files_as_dataset: true,
        sample_size: sampleSize ? parseInt(sampleSize) : null
      };

      const response = await api.post('/jobs', jobData);
      navigate(`/dashboard/${response.data.job_id}`);
    } catch (error: any) {
      console.error('Job creation error:', error);
      alert('Failed to create job: ' + (error.response?.data?.detail || error.message));
    }
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                <div style={{ border: '2px dashed #ccc', padding: '2rem', textAlign: 'center', borderRadius: '8px' }}>
                  <p>Upload CSV files</p>
                  <p className="muted">or</p>
                  <button 
                    className="btn btn--primary" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload CSV Files'}
                  </button>
                  <p className="muted" style={{ marginTop: '1rem' }}>
                    Currently supporting: CSV files only
                  </p>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <strong>Uploaded Files:</strong>
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '0.5rem' }}>
                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </div>
                    ))}
                  </div>
                )}
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
              <div className="form-grid">
                <label>
                  Job Name *
                  <input 
                    type="text"
                    placeholder="e.g., Customer Data Profiling"
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    required
                  />
                </label>
              </div>

              {uploadedFiles.length > 0 ? (
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Uploaded Files ({uploadedFiles.length}):</strong></p>
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '0.5rem' }}>
                      <strong>{file.name}</strong> - {(file.size / 1024).toFixed(2)} KB
                      <div style={{ marginTop: '0.5rem' }}>
                        <label>
                          Delimiter: <input type="text" value={delimiter} onChange={(e) => setDelimiter(e.target.value)} style={{ width: '50px' }} />
                        </label>
                        <label style={{ marginLeft: '1rem' }}>
                          <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} /> Has header row
                        </label>
                      </div>
                    </div>
                  ))}
                  <button className="btn btn--ghost" style={{ marginTop: '1rem' }} onClick={() => fileInputRef.current?.click()}>+ Add More Files</button>
                </div>
              ) : (
                <p className="muted" style={{ marginTop: '1rem' }}>No files uploaded yet. Go back to Step 1 to upload files.</p>
              )}
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
                  <input 
                    type="number" 
                    placeholder="Leave empty to profile entire file" 
                    value={sampleSize}
                    onChange={(e) => setSampleSize(e.target.value)}
                  />
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
