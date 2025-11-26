import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SectionCard from '../components/SectionCard';
import QualityBadge from '../components/QualityBadge';

type Tab = 'overview' | 'columns' | 'quality' | 'patterns' | 'integrity' | 'keys' | 'pii';

function EntityView() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Mock data - TODO: Replace with API call using entityId
  console.log('Entity ID:', entityId);
  const entity = {
    name: 'customers',
    type: 'table',
    qualityGrade: 'Gold' as const,
    qualityScore: 92,
    rowCount: 125000,
    columnCount: 15,
    profiledAt: '2025-11-26T10:30:00Z',
  };

  return (
    <div className="page">
      <section className="hero">
        <div>
          <h1>{entity.name}</h1>
          <p className="lede">
            {entity.type} • {entity.rowCount.toLocaleString()} rows, {entity.columnCount} columns
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <QualityBadge grade={entity.qualityGrade} />
            <span>{entity.qualityScore}% quality score</span>
          </div>
          <button className="btn btn--ghost" style={{ marginTop: '1rem' }} onClick={() => navigate(-1)}>
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
        <SectionCard title="Dataset Statistics" subtitle="Dataset-Level Rule #1">
          <div className="stat-grid">
            <div>
              <div className="muted">Total Records</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{entity.rowCount.toLocaleString()}</div>
            </div>
            <div>
              <div className="muted">Total Columns</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{entity.columnCount}</div>
            </div>
            <div>
              <div className="muted">Dataset Size</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>45.2 MB</div>
            </div>
            <div>
              <div className="muted">Profiling Duration</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>12.5s</div>
            </div>
          </div>
        </SectionCard>
      )}

      {activeTab === 'columns' && (
        <SectionCard title="Column Statistics" subtitle="Attribute-Level Rules - All 8 rules per column">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Column</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Type</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>Null %</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>Unique</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>Quality</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.5rem' }}>customer_id</td>
                  <td style={{ padding: '0.5rem' }}>INTEGER</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>0%</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>125,000</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                    <QualityBadge grade="Gold" />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem' }}>email</td>
                  <td style={{ padding: '0.5rem' }}>VARCHAR</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>2.5%</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>121,875</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                    <QualityBadge grade="Silver" />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem' }}>phone</td>
                  <td style={{ padding: '0.5rem' }}>VARCHAR</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>15%</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>106,250</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                    <QualityBadge grade="Bronze" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {activeTab === 'quality' && (
        <SectionCard title="Data Quality Metrics" subtitle="Column-level quality breakdown">
          <p>Quality metrics and scores for each column will be displayed here.</p>
        </SectionCard>
      )}

      {activeTab === 'patterns' && (
        <SectionCard title="Value Distributions" subtitle="Frequency analysis and patterns">
          <p>Value distribution charts and pattern analysis will be displayed here.</p>
        </SectionCard>
      )}

      {activeTab === 'integrity' && (
        <SectionCard title="Referential Integrity" subtitle="Dataset-Level Rule #3">
          <p>Foreign key validations and cross-table consistency checks will be displayed here.</p>
        </SectionCard>
      )}

      {activeTab === 'keys' && (
        <SectionCard title="Candidate Key Discovery" subtitle="Dataset-Level Rule #4">
          <p>Single-column and composite key suggestions will be displayed here.</p>
        </SectionCard>
      )}

      {activeTab === 'pii' && (
        <SectionCard title="PII Detection" subtitle="Attribute-Level Rule #8">
          <p>PII patterns, confidence scores, and risk levels per column will be displayed here.</p>
        </SectionCard>
      )}
    </div>
  );
}

export default EntityView;
