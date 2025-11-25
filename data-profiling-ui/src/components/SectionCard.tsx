import type { ReactNode } from 'react';
import '../App.css';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

const SectionCard = ({ title, subtitle, action, children }: SectionCardProps) => (
  <section className="card">
    <div className="card__header">
      <div>
        <div className="card__title">{title}</div>
        {subtitle && <div className="card__subtitle">{subtitle}</div>}
      </div>
      {action && <div className="card__action">{action}</div>}
    </div>
    {children}
  </section>
);

export default SectionCard;
