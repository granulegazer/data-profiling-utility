export type QualityGrade = 'Gold' | 'Silver' | 'Bronze';
export type EntityStatus = 'Queued' | 'In Progress' | 'Completed';

export interface EntityProfile {
  name: string;
  type: 'Table' | 'Custom Query' | 'API';
  rows: string;
  columns: number;
  qualityScore: number;
  grade: QualityGrade;
  status: EntityStatus;
  details: string;
}

export const datasetSummary = {
  name: 'Customer 360 Dataset',
  entities: 42,
  rows: '1.4B',
  columns: 386,
  storage: '2.3 TB',
  overallScore: 88,
  qualityGrade: 'Gold' as QualityGrade,
  updated: 'Today 09:24 UTC',
};

export const qualityDistribution: Record<QualityGrade, number> = {
  Gold: 27,
  Silver: 11,
  Bronze: 4,
};

export interface ConnectionHealth {
  title: string;
  details: string;
  status: string;
}

export const connections: ConnectionHealth[] = [
  {
    title: 'Oracle - Metadata Store',
    details: 'Managed pool • us-east-1 • TLS enabled',
    status: 'Healthy',
  },
  {
    title: 'PostgreSQL - Source',
    details: 'Warehouse cluster • 10 connections pooled',
    status: 'Healthy',
  },
  {
    title: 'Data Lake API',
    details: 'https://api.datalake.example.com/customers',
    status: 'Auth token valid',
  },
];

export const entities: EntityProfile[] = [
  {
    name: 'CUSTOMER_CORE',
    type: 'Table',
    rows: '420M',
    columns: 54,
    qualityScore: 93,
    grade: 'Gold',
    status: 'Completed',
    details: 'Schema: core | Full column profile',
  },
  {
    name: 'CUSTOMER_EVENTS_LAST_30D',
    type: 'Custom Query',
    rows: '110M',
    columns: 32,
    qualityScore: 82,
    grade: 'Silver',
    status: 'Completed',
    details: 'CTE with filters | Incremental',
  },
  {
    name: 'CUSTOMER_ADDRESS',
    type: 'Table',
    rows: '135M',
    columns: 28,
    qualityScore: 76,
    grade: 'Silver',
    status: 'In Progress',
    details: 'Column subset: address, geo, risk',
  },
  {
    name: 'API: loyaltyProfiles',
    type: 'API',
    rows: '9.2M',
    columns: 19,
    qualityScore: 71,
    grade: 'Bronze',
    status: 'Queued',
    details: 'JSON path: data.customers[*].profile',
  },
  {
    name: 'CUSTOMER_PAYMENTS',
    type: 'Table',
    rows: '215M',
    columns: 41,
    qualityScore: 88,
    grade: 'Gold',
    status: 'Completed',
    details: 'Foreign key checks enabled',
  },
];

export const jobProgress = {
  overallPct: 62,
  eta: '14m',
  speed: '1.8M rows/sec',
  currentEntity: 'CUSTOMER_ADDRESS',
  queue: {
    queued: 6,
    inProgress: 2,
    completed: 24,
    failed: 0,
  },
};
