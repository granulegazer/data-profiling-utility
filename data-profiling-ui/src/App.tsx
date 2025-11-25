import NavBar from './components/NavBar';
import SectionCard from './components/SectionCard';
import StatCard from './components/StatCard';
import EntityTable from './components/EntityTable';
import QualityBadge from './components/QualityBadge';
import {
  connections,
  datasetSummary,
  entities,
  jobProgress,
  qualityDistribution,
} from './mockData';
import './App.css';

function App() {
  return (
    <div className="page">
      <NavBar
        datasetName={datasetSummary.name}
        overallScore={datasetSummary.overallScore}
        qualityGrade={datasetSummary.qualityGrade}
      />

      <main className="content">
        <section className="hero">
          <div>
            <p className="eyebrow">Profiling Control Center</p>
            <h1>Data profiling for data lakes, databases, and flat files.</h1>
            <p className="lede">
              Configure sources, launch profiling jobs, and review the results in one
              curated workspace. Swap in your own APIs, JDBC configs, and rules
              without changing the layout.
            </p>
            <div className="hero__actions">
              <button className="btn btn--primary">Start New Job</button>
              <button className="btn btn--ghost">Preview API Response</button>
            </div>
          </div>
          <div className="hero__summary">
            <div className="hero__summary-title">Current dataset</div>
            <div className="hero__summary-name">{datasetSummary.name}</div>
            <div className="hero__summary-grade">
              <QualityBadge grade={datasetSummary.qualityGrade} />
              <span className="hero__summary-score">
                {datasetSummary.overallScore}% quality score
              </span>
            </div>
            <div className="hero__chips">
              <span className="chip">{datasetSummary.entities} entities</span>
              <span className="chip">{datasetSummary.rows} rows</span>
              <span className="chip">{datasetSummary.columns} columns</span>
              <span className="chip">{datasetSummary.storage} storage</span>
            </div>
            <div className="muted">Last refreshed • {datasetSummary.updated}</div>
          </div>
        </section>

        <SectionCard
          title="Dataset snapshot"
          subtitle="High-level profile stats mapped to enterprise rules. Replace static values with your API/DB responses."
          action={<a className="link" href="#">Configure rules</a>}
        >
          <div className="stat-grid">
            <StatCard label="Entities profiled" value={`${datasetSummary.entities} / 42`} hint="Entity filter applied" />
            <StatCard label="Overall quality" value={`${datasetSummary.overallScore}%`} hint="Aggregated across entities" />
            <StatCard label="Data quality grade" value={<QualityBadge grade={datasetSummary.qualityGrade} />} />
            <StatCard label="Storage size" value={datasetSummary.storage} hint="Results saved to filesystem" />
          </div>
          <div className="quality-bar">
            {(['Gold', 'Silver', 'Bronze'] as const).map((grade) => (
              <div key={grade} className={`quality-bar__segment quality-bar__segment--${grade.toLowerCase()}`}>
                <div className="quality-bar__value">{qualityDistribution[grade]}</div>
                <div className="quality-bar__label">{grade}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Connection health"
          subtitle="Swap these placeholders with your connection tests (Oracle metadata, PostgreSQL sources, Data Lake API)."
          action={<a className="link" href="#">Manage credentials</a>}
        >
          <div className="connection-grid">
            {connections.map((conn) => (
              <div key={conn.title} className="connection">
                <div className="connection__title">{conn.title}</div>
                <div className="connection__details">{conn.details}</div>
                <div className="status status--success">{conn.status}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="grid two-col">
          <SectionCard
            title="Database profiling"
            subtitle="Table-level or custom SQL profiling with column selection."
            action={<button className="btn btn--ghost">Test connection</button>}
          >
            <div className="form-grid">
              <label>
                Source schema
                <input placeholder="ex: CUSTOMER_CORE" defaultValue="CORE_CUSTOMER" />
              </label>
              <label>
                Entity filter (CSV/pattern)
                <input placeholder="ex: CUSTOMER_*" defaultValue="CUSTOMER_*" />
              </label>
              <label>
                Column selection
                <input placeholder="Leave blank for all columns" />
              </label>
              <label>
                Custom query (optional)
                <textarea rows={3} defaultValue="WITH recent AS (...)\nSELECT * FROM recent WHERE score > 0.8" />
              </label>
            </div>
          </SectionCard>

          <SectionCard
            title="Data lake API profiling"
            subtitle="Configure REST endpoints with domain selection and JSON/XPath paths."
            action={<button className="btn btn--ghost">Preview sample</button>}
          >
            <div className="form-grid">
              <label>
                API endpoint
                <input placeholder="https://api.datalake.example.com/customers" defaultValue="https://api.datalake.example.com/customers" />
              </label>
              <label>
                Domain
                <input placeholder="Select from predefined domains" defaultValue="Customer" />
              </label>
              <label>
                JSON / XPath path
                <input placeholder="data.customers[*].profile" defaultValue="data.customers[*].profile" />
              </label>
              <label>
                Entity list
                <textarea rows={3} placeholder="Paste entities or upload CSV" defaultValue="CUSTOMER_CORE\nCUSTOMER_ADDRESS\nCUSTOMER_EVENTS_LAST_30D" />
              </label>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Job progress"
          subtitle="Real-time progress with queue breakdown and ETA."
          action={<button className="btn btn--primary">Resume job</button>}
        >
          <div className="progress">
            <div className="progress__meta">
              <div>
                <div className="muted">Overall progress</div>
                <div className="progress__value">{jobProgress.overallPct}%</div>
              </div>
              <div className="muted">ETA • {jobProgress.eta}</div>
              <div className="muted">Speed • {jobProgress.speed}</div>
            </div>
            <div className="progress__bar">
              <div
                className="progress__fill"
                style={{ width: `${jobProgress.overallPct}%` }}
              />
            </div>
            <div className="progress__chips">
              <span className="chip">Queued: {jobProgress.queue.queued}</span>
              <span className="chip">In progress: {jobProgress.queue.inProgress}</span>
              <span className="chip">Completed: {jobProgress.queue.completed}</span>
              <span className="chip chip--muted">Failed: {jobProgress.queue.failed}</span>
            </div>
            <div className="current-entity">
              <div className="muted">Current entity</div>
              <div className="current-entity__name">{jobProgress.currentEntity}</div>
              <div className="muted">Rows/sec • {jobProgress.speed}</div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Entity profiles"
          subtitle="Drill into tables, custom queries, or API entities. Swap mock rows with your backend data."
          action={<a className="link" href="#">Export report</a>}
        >
          <EntityTable entities={entities} />
        </SectionCard>
      </main>
    </div>
  );
}

export default App;
