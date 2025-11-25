import '../App.css';
import type { QualityGrade } from '../mockData';

const QualityBadge = ({ grade }: { grade: QualityGrade }) => (
  <span className={`badge badge--${grade.toLowerCase()}`}>{grade}</span>
);

export default QualityBadge;
