import '../App.css';
import QualityBadge from './QualityBadge';
import type { EntityProfile } from '../mockData';

interface Props {
  entities: EntityProfile[];
}

const statusColor: Record<string, string> = {
  Completed: 'success',
  'In Progress': 'warning',
  Queued: 'muted',
};

const EntityTable = ({ entities }: Props) => {
  return (
    <div className="table">
      <div className="table__head">
        <div>Name</div>
        <div>Type</div>
        <div>Rows</div>
        <div>Columns</div>
        <div>Score</div>
        <div>Status</div>
      </div>
      {entities.map((entity) => (
        <div key={entity.name} className="table__row">
          <div>
            <div className="table__primary">{entity.name}</div>
            <div className="table__secondary">{entity.details}</div>
          </div>
          <div className="pill pill--ghost">{entity.type}</div>
          <div>{entity.rows}</div>
          <div>{entity.columns}</div>
          <div className="table__score">
            <span className="table__score-value">{entity.qualityScore}%</span>
            <QualityBadge grade={entity.grade} />
          </div>
          <div>
            <span className={`status status--${statusColor[entity.status]}`}>
              {entity.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EntityTable;
