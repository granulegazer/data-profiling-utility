import type { ReactNode } from 'react';
import '../App.css';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
}

const StatCard = ({ label, value, hint }: StatCardProps) => (
  <div className="stat-card">
    <div className="stat-card__value">{value}</div>
    <div className="stat-card__label">{label}</div>
    {hint && <div className="stat-card__hint">{hint}</div>}
  </div>
);

export default StatCard;
