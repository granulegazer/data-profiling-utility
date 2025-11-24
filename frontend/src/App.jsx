import { useState } from 'react'
import './App.css'
import DataSourceForm from './components/DataSourceForm'
import JobsList from './components/JobsList'
import ProfilingResults from './components/ProfilingResults'

function App() {
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState('create')

  const handleJobCreated = (job) => {
    setRefreshTrigger(prev => prev + 1)
    setActiveTab('jobs')
    alert(`Profiling job "${job.job_name}" created successfully!`)
  }

  const handleSelectJob = (jobId) => {
    setSelectedJobId(jobId)
    setActiveTab('results')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Data Profiling Utility</h1>
        <p>Profile your data from databases, files, and APIs</p>
      </header>

      <nav className="app-nav">
        <button
          className={activeTab === 'create' ? 'active' : ''}
          onClick={() => setActiveTab('create')}
        >
          Create New Job
        </button>
        <button
          className={activeTab === 'jobs' ? 'active' : ''}
          onClick={() => setActiveTab('jobs')}
        >
          View Jobs
        </button>
        {selectedJobId && (
          <button
            className={activeTab === 'results' ? 'active' : ''}
            onClick={() => setActiveTab('results')}
          >
            Results
          </button>
        )}
      </nav>

      <main className="app-content">
        {activeTab === 'create' && (
          <DataSourceForm onJobCreated={handleJobCreated} />
        )}
        {activeTab === 'jobs' && (
          <JobsList
            onSelectJob={handleSelectJob}
            refreshTrigger={refreshTrigger}
          />
        )}
        {activeTab === 'results' && selectedJobId && (
          <ProfilingResults jobId={selectedJobId} />
        )}
      </main>
    </div>
  )
}

export default App
