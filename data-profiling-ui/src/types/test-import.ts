// Test file to verify exports work
import type { Dataset, JobResult, Job } from './profiling';

// This should compile without errors if exports are correct
const testDataset: Dataset = {
  dataset_name: 'test',
  row_count: 0,
  column_count: 0,
  file_size_bytes: 0,
  columns: [],
  profiled_at: new Date().toISOString()
};

const testJobResult: JobResult = {
  job_id: 'job-1',
  job_name: 'Test Job',
  status: 'completed',
  datasets: [testDataset],
  total_rows: 0,
  total_columns: 0,
  completed_at: new Date().toISOString()
};

const testJob: Job = {
  job_id: 'job-1',
  name: 'Test Job',
  status: 'completed',
  progress: 100,
  created_at: new Date().toISOString(),
  completed_at: new Date().toISOString()
};

console.log('Exports are working:', { testDataset, testJobResult, testJob });
