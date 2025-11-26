import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionCard from '../components/SectionCard';
import { api } from '../api/client';

type SourceType = 'database' | 'data_lake' | 'flat_file';
type Mode = 'browse_tables' | 'custom_query' | 'flat_file';

interface UploadedFile {
  name: string;
  size: number;
  path: string;
  encoding?: string;
}

function Configuration() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [jobName, setJobName] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('flat_file');
  const [mode, setMode] = useState<Mode>('browse_tables');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [sampleSize, setSampleSize] = useState<string>('');
  const [previewData, setPreviewData] = useState<{fileName: string, headers: string[], rows: string[][]} | null>(null);
  const [columnSelection, setColumnSelection] = useState<'all' | 'specific'>('all');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const handlePreview = async (file: UploadedFile) => {
    try {
      // Read the file and parse first few rows
      const response = await fetch(`http://localhost:8000/api/v1/preview/${file.path}?delimiter=${encodeURIComponent(delimiter)}&has_header=${hasHeader}&limit=5`);
      
      if (response.ok) {
        const data = await response.json();
        setPreviewData({
          fileName: file.name,
          headers: data.headers || [],
          rows: data.rows || []
        });
      } else {
        alert('Failed to preview file');
      }
    } catch (error) {
      console.error('Preview error:', error);
      alert('Preview feature requires backend endpoint implementation');
    }
  };

  const handleNext = async () => {
    // Step 1 validation: Job name and at least 1 file
    if (step === 1) {
      if (!jobName.trim()) {
        alert('Please enter a job name');
        return;
      }
      if (uploadedFiles.length === 0) {
        alert('Please upload at least one CSV file');
        return;
      }
    }
    
    // Step 2 -> Step 3: Auto-load preview data if not already loaded
    if (step === 2 && !previewData && uploadedFiles.length > 0) {
      try {
        await handlePreview(uploadedFiles[0]);
      } catch (error) {
        console.error('Auto-preview failed:', error);
      }
    }
    
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
          path: response.data.file_id,
          encoding: response.data.encoding || 'UTF-8'
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
        sample_size: sampleSize ? parseInt(sampleSize) : null,
        selected_columns: columnSelection === 'specific' ? selectedColumns : null
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
            Step {step} of 3: {step === 1 ? 'Job Configuration & Data Source' : step === 2 ? 'File Parsing Configuration' : 'Profiling Options'}
          </p>
        </div>
      </section>

      {/* Step 1: Job Configuration & Data Source */}
      {step === 1 && (
        <SectionCard title="Step 1: Job Configuration & Data Source" subtitle="Enter job name and select your data source">
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

            <label>
              Data Source
              <select value={sourceType} onChange={(e) => setSourceType(e.target.value as SourceType)}>
                <option value="flat_file">Flat File (CSV)</option>
                <option value="database" disabled>Database (PostgreSQL/Oracle) - Coming Soon</option>
                <option value="data_lake" disabled>Data Lake API - Coming Soon</option>
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
                <div style={{ border: '2px dashed rgba(255, 255, 255, 0.18)', padding: '2rem', textAlign: 'center', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <p style={{ color: '#c5ccdd' }}>Upload CSV files</p>
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
                    <strong style={{ color: '#c5ccdd' }}>Uploaded Files:</strong>
                    {uploadedFiles.map((file, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          padding: '0.75rem', 
                          border: '1px solid rgba(255, 255, 255, 0.08)', 
                          borderRadius: '10px', 
                          marginTop: '0.5rem',
                          background: 'rgba(255, 255, 255, 0.02)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ color: '#e8ecf6' }}>{file.name}</span>
                        <span style={{ color: '#8f9bb3', fontSize: '0.875rem' }}>({(file.size / 1024).toFixed(2)} KB)</span>
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

      {/* Step 2: File Parsing Configuration */}
      {step === 2 && (
        <SectionCard title="Step 2: File Parsing Configuration" subtitle="Configure how uploaded files should be parsed">
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
              {uploadedFiles.length > 0 ? (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ color: '#c5ccdd', marginBottom: '1rem' }}>
                    <strong>Configure File Parsing ({uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}):</strong>
                  </p>
                  {uploadedFiles.map((file, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: '1rem', 
                        border: '1px solid rgba(255, 255, 255, 0.08)', 
                        borderRadius: '12px', 
                        marginTop: '0.75rem', 
                        background: 'rgba(255, 255, 255, 0.02)'
                      }}
                    >
                      <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: '#e8ecf6' }}>{file.name}</span>
                        <span style={{ color: '#8f9bb3', fontSize: '0.875rem' }}>{(file.size / 1024).toFixed(2)} KB</span>
                      </div>
                      
                      <div style={{ marginBottom: '1rem', padding: '0.5rem', background: 'rgba(75, 123, 255, 0.08)', borderRadius: '8px', border: '1px solid rgba(75, 123, 255, 0.2)' }}>
                        <span style={{ fontSize: '0.875rem', color: '#a3cbff' }}>
                          <strong>Detected Encoding:</strong> {file.encoding || 'UTF-8'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label>
                          Column Delimiter
                          <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
                            <option value=",">Comma (,)</option>
                            <option value="\t">Tab (\t)</option>
                            <option value=";">Semicolon (;)</option>
                            <option value="|">Pipe (|)</option>
                            <option value="custom">Custom...</option>
                          </select>
                        </label>
                        
                        <label 
                          style={{ 
                            display: 'flex', 
                            flexDirection: 'row',
                            alignItems: 'center', 
                            gap: '0.5rem',
                            cursor: 'pointer'
                          }}
                        >
                          <input 
                            type="checkbox" 
                            checked={hasHeader} 
                            onChange={(e) => setHasHeader(e.target.checked)}
                            style={{ width: 'auto', cursor: 'pointer' }}
                          />
                          <span style={{ color: '#c5ccdd' }}>First row contains column names</span>
                        </label>
                      </div>
                      
                      <button 
                        className="btn btn--ghost" 
                        style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}
                        onClick={() => handlePreview(file)}
                      >
                        Preview Data
                      </button>
                    </div>
                  ))}
                  <button className="btn btn--ghost" style={{ marginTop: '1rem' }} onClick={() => fileInputRef.current?.click()}>+ Add More Files</button>
                </div>
              ) : (
                <p className="muted" style={{ marginTop: '1rem' }}>No files uploaded yet. Go back to Step 1 to upload files.</p>
              )}
            </div>
          )}

          {/* Preview Modal */}
          {previewData && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1.5rem',
                animation: 'fadeIn 0.2s ease-in-out'
              }}
              onClick={() => setPreviewData(null)}
            >
              <div 
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 17, 24, 0.98), rgba(20, 23, 32, 0.98))',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 1px rgba(75, 123, 255, 0.3)',
                  padding: '0',
                  maxWidth: '1100px',
                  width: '95%',
                  maxHeight: '85vh',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div style={{ 
                  padding: '1.5rem 2rem',
                  background: 'linear-gradient(135deg, rgba(75, 123, 255, 0.08), rgba(19, 198, 231, 0.06))',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#e8ecf6', fontSize: '1.125rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
                      📄 Data Preview
                    </h3>
                    <p style={{ margin: '0.375rem 0 0 0', fontSize: '0.875rem', color: '#8f9bb3' }}>
                      {previewData.fileName}
                    </p>
                  </div>
                  <button 
                    className="btn btn--ghost" 
                    onClick={() => setPreviewData(null)}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      fontSize: '0.875rem',
                      minWidth: 'auto'
                    }}
                  >
                    Close
                  </button>
                </div>
                
                {/* Stats Bar */}
                <div style={{ 
                  padding: '0.75rem 2rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  gap: '2rem',
                  fontSize: '0.8125rem'
                }}>
                  <div>
                    <span style={{ color: '#8f9bb3' }}>Rows:</span>
                    <span style={{ color: '#a3cbff', fontWeight: 600, marginLeft: '0.5rem' }}>{previewData.rows.length}</span>
                  </div>
                  <div>
                    <span style={{ color: '#8f9bb3' }}>Columns:</span>
                    <span style={{ color: '#a3cbff', fontWeight: 600, marginLeft: '0.5rem' }}>{previewData.headers.length}</span>
                  </div>
                  <div>
                    <span style={{ color: '#8f9bb3' }}>Sample:</span>
                    <span style={{ color: '#ffd480', fontWeight: 600, marginLeft: '0.5rem' }}>First 5 rows</span>
                  </div>
                </div>
                
                {/* Table Container */}
                <div style={{ 
                  overflowX: 'auto', 
                  overflowY: 'auto', 
                  flex: 1,
                  padding: '0'
                }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'separate',
                    borderSpacing: 0,
                    minWidth: '600px'
                  }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr>
                        {previewData.headers.map((header, idx) => (
                          <th 
                            key={idx} 
                            style={{ 
                              padding: '1rem 1.5rem', 
                              textAlign: 'left',
                              background: 'rgba(15, 17, 24, 0.95)',
                              borderBottom: '2px solid rgba(75, 123, 255, 0.4)',
                              color: '#a3cbff',
                              fontWeight: 600,
                              fontSize: '0.8125rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              whiteSpace: 'nowrap',
                              position: 'sticky',
                              top: 0
                            }}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows.map((row, rowIdx) => (
                        <tr 
                          key={rowIdx}
                          style={{ 
                            background: rowIdx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.01)'
                          }}
                        >
                          {row.map((cell, cellIdx) => (
                            <td 
                              key={cellIdx}
                              style={{ 
                                padding: '0.875rem 1.5rem', 
                                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                color: '#c5ccdd',
                                fontSize: '0.875rem',
                                fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace'
                              }}
                            >
                              {cell || <span style={{ color: '#666', fontStyle: 'italic' }}>null</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Column Selection */}
            <div>
              <p style={{ color: '#c5ccdd', marginBottom: '1rem', fontWeight: 600 }}>Column Selection</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    cursor: 'pointer',
                    padding: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    background: columnSelection === 'all' ? 'rgba(75, 123, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    transition: 'all 0.2s'
                  }}
                >
                  <input 
                    type="radio" 
                    name="columns" 
                    checked={columnSelection === 'all'}
                    onChange={() => setColumnSelection('all')}
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <span style={{ color: '#e8ecf6', fontWeight: 500 }}>Profile All Columns</span>
                </label>
                
                <label 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    cursor: 'pointer',
                    padding: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    background: columnSelection === 'specific' ? 'rgba(75, 123, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    transition: 'all 0.2s'
                  }}
                >
                  <input 
                    type="radio" 
                    name="columns" 
                    checked={columnSelection === 'specific'}
                    onChange={() => setColumnSelection('specific')}
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <span style={{ color: '#e8ecf6', fontWeight: 500 }}>Select Specific Columns</span>
                </label>
              </div>
              
              {/* Column Checkboxes - shown when "specific" is selected */}
              {columnSelection === 'specific' && (
                <div 
                  style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}
                >
                  <p className="muted" style={{ marginBottom: '0.75rem' }}>
                    Select columns to profile (requires file preview data):
                  </p>
                  {previewData && previewData.headers.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                      {previewData.headers.map((header, idx) => (
                        <label 
                          key={idx}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            background: selectedColumns.includes(header) ? 'rgba(75, 123, 255, 0.1)' : 'transparent'
                          }}
                        >
                          <input 
                            type="checkbox" 
                            checked={selectedColumns.includes(header)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedColumns([...selectedColumns, header]);
                              } else {
                                setSelectedColumns(selectedColumns.filter(c => c !== header));
                              }
                            }}
                            style={{ width: 'auto', cursor: 'pointer' }}
                          />
                          <span style={{ color: '#c5ccdd', fontSize: '0.875rem' }}>{header}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="muted">
                      Go back to Step 2 and use "Preview Data" to see available columns.
                    </p>
                  )}
                  
                  {previewData && previewData.headers.length > 0 && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn--ghost" 
                        style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                        onClick={() => setSelectedColumns(previewData.headers)}
                      >
                        Select All
                      </button>
                      <button 
                        className="btn btn--ghost" 
                        style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                        onClick={() => setSelectedColumns([])}
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sample Size */}
            {sourceType === 'flat_file' && (
              <label>
                Sample Size (rows)
                <input 
                  type="number" 
                  placeholder="Leave empty to profile entire file" 
                  value={sampleSize}
                  onChange={(e) => setSampleSize(e.target.value)}
                />
                <span className="muted" style={{ marginTop: '0.5rem', display: 'block' }}>
                  Optional: Limit the number of rows to profile for faster results
                </span>
              </label>
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
