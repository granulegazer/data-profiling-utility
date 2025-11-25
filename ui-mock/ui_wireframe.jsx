
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Database, Play, CheckCircle, XCircle, Clock, Filter, Search, Download, TrendingUp, AlertTriangle } from 'lucide-react';

// Sample datasets for demonstration
const SAMPLE_DATASETS = {
  customer_db: {
    name: 'Customer Database',
    entities: ['customers', 'orders', 'products', 'transactions', 'reviews'],
    rows: { customers: 150000, orders: 450000, products: 5000, transactions: 600000, reviews: 75000 }
  },
  sales_db: {
    name: 'Sales Database',
    entities: ['sales_records', 'employees', 'regions', 'targets'],
    rows: { sales_records: 2000000, employees: 5000, regions: 50, targets: 1200 }
  }
};

// Profiling engine simulator
const generateProfileData = (entityName, rowCount) => {
  const columnCount = Math.floor(Math.random() * 15) + 5;
  const qualityScore = Math.floor(Math.random() * 30) + 65;
  const grade = qualityScore >= 90 ? 'GOLD' : qualityScore >= 70 ? 'SILVER' : 'BRONZE';
  
  const columns = Array.from({ length: columnCount }, (_, i) => ({
    name: `col_${i + 1}`,
    dataType: ['VARCHAR', 'INTEGER', 'DATE', 'DECIMAL', 'BOOLEAN'][Math.floor(Math.random() * 5)],
    nullCount: Math.floor(Math.random() * rowCount * 0.15),
    nullPercentage: (Math.random() * 15).toFixed(2),
    uniqueCount: Math.floor(rowCount * (0.6 + Math.random() * 0.4)),
    distinctCount: Math.floor(rowCount * (0.5 + Math.random() * 0.4)),
    qualityScore: Math.floor(Math.random() * 30) + 65,
    hasPII: Math.random() > 0.8,
    isCandidateKey: Math.random() > 0.9
  }));

  return {
    entityName,
    rowCount,
    columnCount,
    qualityScore,
    grade,
    columns,
    startTime: Date.now(),
    completedTime: Date.now() + Math.random() * 30000
  };
};

const DataProfiler = () => {
  const [view, setView] = useState('config'); // config, progress, results
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [jobProgress, setJobProgress] = useState(null);
  const [profileResults, setProfileResults] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('ALL');

  // Simulate profiling job
  const startProfiling = () => {
    setView('progress');
    const totalEntities = selectedEntities.length;
    let completed = 0;
    
    setJobProgress({
      status: 'running',
      totalEntities,
      completedEntities: 0,
      percentage: 0,
      currentEntity: selectedEntities[0],
      startTime: Date.now()
    });

    const interval = setInterval(() => {
      completed++;
      const percentage = Math.floor((completed / totalEntities) * 100);
      
      setJobProgress(prev => ({
        ...prev,
        completedEntities: completed,
        percentage,
        currentEntity: selectedEntities[completed] || selectedEntities[completed - 1],
        rowsPerSecond: Math.floor(Math.random() * 5000) + 2000
      }));

      // Generate profile result for completed entity
      const entityName = selectedEntities[completed - 1];
      const rowCount = SAMPLE_DATASETS[selectedDataset].rows[entityName];
      const result = generateProfileData(entityName, rowCount);
      setProfileResults(prev => [...prev, result]);

      if (completed >= totalEntities) {
        clearInterval(interval);
        setJobProgress(prev => ({ ...prev, status: 'completed' }));
        setTimeout(() => setView('results'), 1000);
      }
    }, 2000);
  };

  const resetJob = () => {
    setView('config');
    setSelectedDataset('');
    setSelectedEntities([]);
    setJobProgress(null);
    setProfileResults([]);
    setSelectedEntity(null);
  };

  const getGradeColor = (grade) => {
    return grade === 'GOLD' ? '#FFD700' : grade === 'SILVER' ? '#C0C0C0' : '#CD7F32';
  };

  const filteredResults = profileResults.filter(r => {
    const matchesSearch = r.entityName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'ALL' || r.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const gradeDistribution = [
    { name: 'Gold', value: profileResults.filter(r => r.grade === 'GOLD').length, color: '#FFD700' },
    { name: 'Silver', value: profileResults.filter(r => r.grade === 'SILVER').length, color: '#C0C0C0' },
    { name: 'Bronze', value: profileResults.filter(r => r.grade === 'BRONZE').length, color: '#CD7F32' }
  ];

  const avgQualityScore = profileResults.length > 0 
    ? Math.floor(profileResults.reduce((sum, r) => sum + r.qualityScore, 0) / profileResults.length)
    : 0;

  // Configuration View
  if (view === 'config') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Database className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Data Profiling Utility</h1>
                <p className="text-slate-500">Configure and execute profiling jobs</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Dataset
                </label>
                <select
                  value={selectedDataset}
                  onChange={(e) => {
                    setSelectedDataset(e.target.value);
                    setSelectedEntities([]);
                  }}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none transition"
                >
                  <option value="">Choose a dataset...</option>
                  {Object.keys(SAMPLE_DATASETS).map(key => (
                    <option key={key} value={key}>{SAMPLE_DATASETS[key].name}</option>
                  ))}
                </select>
              </div>

              {selectedDataset && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Select Entities to Profile ({selectedEntities.length} selected)
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200">
                    {SAMPLE_DATASETS[selectedDataset].entities.map(entity => (
                      <label key={entity} className="flex items-center gap-2 cursor-pointer hover:bg-white p-3 rounded-lg transition">
                        <input
                          type="checkbox"
                          checked={selectedEntities.includes(entity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEntities([...selectedEntities, entity]);
                            } else {
                              setSelectedEntities(selectedEntities.filter(e => e !== entity));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="font-medium text-slate-700">{entity}</span>
                        <span className="text-xs text-slate-500 ml-auto">
                          {SAMPLE_DATASETS[selectedDataset].rows[entity].toLocaleString()} rows
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={startProfiling}
                disabled={selectedEntities.length === 0}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Play className="w-5 h-5" />
                Start Profiling Job
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Progress View
  if (view === 'progress') {
    const elapsedSeconds = jobProgress ? Math.floor((Date.now() - jobProgress.startTime) / 1000) : 0;
    const estimatedTotal = jobProgress ? Math.floor(elapsedSeconds / (jobProgress.percentage / 100)) : 0;
    const remainingSeconds = estimatedTotal - elapsedSeconds;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-500 animate-pulse" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Profiling in Progress</h2>
                  <p className="text-slate-500">Processing entities...</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{jobProgress?.percentage}%</div>
                <div className="text-sm text-slate-500">Complete</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                    style={{ width: `${jobProgress?.percentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="text-sm text-blue-600 font-semibold mb-1">Entities</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {jobProgress?.completedEntities} / {jobProgress?.totalEntities}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="text-sm text-green-600 font-semibold mb-1">Speed</div>
                  <div className="text-2xl font-bold text-green-900">
                    {jobProgress?.rowsPerSecond?.toLocaleString() || 0} r/s
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <div className="text-sm text-purple-600 font-semibold mb-1">ETA</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {remainingSeconds > 0 ? `${remainingSeconds}s` : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-slate-700">Current Entity:</span>
                </div>
                <div className="text-lg font-mono text-slate-900">{jobProgress?.currentEntity}</div>
              </div>

              {jobProgress?.status === 'completed' && (
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-semibold text-green-900">Profiling Complete!</div>
                    <div className="text-sm text-green-700">Redirecting to results...</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results View - Dashboard
  if (view === 'results' && !selectedEntity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Dataset Profile Dashboard</h1>
                <p className="text-slate-500">
                  {SAMPLE_DATASETS[selectedDataset]?.name} - {profileResults.length} entities profiled
                </p>
              </div>
              <button
                onClick={resetJob}
                className="px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition"
              >
                New Job
              </button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="text-sm opacity-90 mb-1">Total Entities</div>
              <div className="text-4xl font-bold">{profileResults.length}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="text-sm opacity-90 mb-1">Avg Quality Score</div>
              <div className="text-4xl font-bold">{avgQualityScore}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="text-sm opacity-90 mb-1">Total Rows</div>
              <div className="text-4xl font-bold">
                {profileResults.reduce((sum, r) => sum + r.rowCount, 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="text-sm opacity-90 mb-1">Total Columns</div>
              <div className="text-4xl font-bold">
                {profileResults.reduce((sum, r) => sum + r.columnCount, 0)}
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Quality Grade Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={gradeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Entity Quality Scores</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={profileResults.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="entityName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="qualityScore" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Entity List */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Entity Summary</h3>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search entities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="ALL">All Grades</option>
                  <option value="GOLD">Gold</option>
                  <option value="SILVER">Silver</option>
                  <option value="BRONZE">Bronze</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredResults.map((result) => (
                <div
                  key={result.entityName}
                  onClick={() => setSelectedEntity(result)}
                  className="border-2 border-slate-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-lg transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                        style={{ backgroundColor: getGradeColor(result.grade) }}
                      >
                        {result.grade[0]}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-800">{result.entityName}</h4>
                        <div className="flex gap-4 text-sm text-slate-500 mt-1">
                          <span>{result.rowCount.toLocaleString()} rows</span>
                          <span>{result.columnCount} columns</span>
                          <span>Quality: {result.qualityScore}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.columns.some(c => c.hasPII) && (
                        <div className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                          PII Detected
                        </div>
                      )}
                      {result.columns.some(c => c.isCandidateKey) && (
                        <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Key Found
                        </div>
                      )}
                      <TrendingUp className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results View - Entity Detail
  if (view === 'results' && selectedEntity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
            <button
              onClick={() => setSelectedEntity(null)}
              className="mb-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              ← Back to Dashboard
            </button>
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                style={{ backgroundColor: getGradeColor(selectedEntity.grade) }}
              >
                {selectedEntity.grade[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">{selectedEntity.entityName}</h1>
                <div className="flex gap-6 text-slate-500 mt-2">
                  <span>{selectedEntity.rowCount.toLocaleString()} rows</span>
                  <span>{selectedEntity.columnCount} columns</span>
                  <span>Quality Score: {selectedEntity.qualityScore}</span>
                  <span className="font-semibold" style={{ color: getGradeColor(selectedEntity.grade) }}>
                    {selectedEntity.grade} Grade
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column Details */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Column Profiling Results</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Column</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Null %</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Unique</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Distinct</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Quality</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Flags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedEntity.columns.map((col, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-800">{col.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          {col.dataType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{col.nullPercentage}%</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{col.uniqueCount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{col.distinctCount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-400 to-green-600"
                              style={{ width: `${col.qualityScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-700">{col.qualityScore}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {col.hasPII && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                              PII
                            </span>
                          )}
                          {col.isCandidateKey && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                              KEY
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default DataProfiler;