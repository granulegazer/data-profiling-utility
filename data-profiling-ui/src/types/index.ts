// Re-export everything from profiling.ts
export * from './profiling';

export interface Connection {
  id: string;
  name: string;
  type: 'postgresql' | 'oracle' | 'data_lake' | 'csv' | 'json' | 'xml' | 'excel';
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  last_used?: string;
  created_at: string;
}

export interface ConnectionCreate {
  name: string;
  type: 'postgresql' | 'oracle' | 'data_lake' | 'csv' | 'json' | 'xml' | 'excel';
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password: string;
}

export interface JobCreate {
  connection_id: string;
  dataset_name: string;
  entities?: string[];
  entity_filter_pattern?: string;
  mode: 'browse_tables' | 'custom_query' | 'flat_file';
  custom_query?: string;
  query_name?: string;
  profile_all_columns: boolean;
  selected_columns?: string[];
  // Flat file specific fields
  file_paths?: string[];
  file_config?: Record<string, any>;
  treat_files_as_dataset?: boolean;
  sample_size?: number;
}

// File parsing configuration interfaces
export interface CSVConfig {
  delimiter: string;
  has_header: boolean;
  encoding: string;
  quote_char: string;
  skip_rows?: number;
}

export interface JSONConfig {
  root_path?: string;
  flatten_nested: boolean;
  array_path?: string;
}

export interface XMLConfig {
  root_element: string;
  record_tag: string;
  attribute_mapping?: Record<string, string>;
}

export interface ExcelConfig {
  sheet_name?: string;
  sheet_index?: number;
  header_row: number;
  range?: string;
}

export interface FileMetadata {
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: 'csv' | 'json' | 'xml' | 'excel';
  detected_rows?: number;
  detected_columns?: number;
  config: CSVConfig | JSONConfig | XMLConfig | ExcelConfig;
}

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ProfilingJob {
  job_id: string;
  connection_id: string;
  dataset_name: string;
  source_type: string;
  status: JobStatus;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  total_entities: number;
  completed_entities: number;
  progress_percentage: number;
  error_message?: string;
}

export interface JobProgress {
  job_id: string;
  status: JobStatus;
  percentage: number;
  total_entities: number;
  completed_entities: number;
  current_entity?: string;
  rows_processed: number;
  rows_per_second: number;
  elapsed_time: number;
  estimated_time_remaining: number;
}

export type QualityGrade = 'GOLD' | 'SILVER' | 'BRONZE';

export interface DatasetProfile {
  dataset_profile_id: string;
  job_id: string;
  dataset_name: string;
  total_entities: number;
  total_rows: number;
  total_columns: number;
  overall_quality_score: number;
  overall_quality_grade: QualityGrade;
  storage_size?: number;
  profiled_at: string;
}

export interface EntityProfile {
  entity_profile_id: string;
  dataset_profile_id: string;
  entity_name: string;
  entity_type: 'table' | 'table_partial' | 'query' | 'api';
  source_query?: string;
  selected_columns?: string;
  row_count: number;
  column_count: number;
  overall_completeness_score: number;
  data_quality_score: number;
  data_quality_grade: QualityGrade;
  pii_risk_score: number;
  candidate_key_count: number;
  status: string;
  started_at: string;
  completed_at?: string;
  processing_speed_rows_per_sec: number;
}

export interface ColumnStatistics {
  column_name: string;
  column_index: number;
  statistics: {
    record_count: number;
    null_count: number;
    null_percentage: number;
    unique_value_count: number;
    distinct_value_count: number;
    duplicate_count: number;
  };
  data_type: {
    inferred_data_type: string;
    type_consistency_percentage: number;
    format_patterns: string[];
    type_mismatches_count: number;
  };
  data_quality: {
    completeness_percentage: number;
    validity_percentage: number;
    consistency_score: number;
    conformity_rate: number;
    column_quality_score: number;
    quality_grade: QualityGrade;
  };
  pii_detection: {
    email_detected: boolean;
    phone_detected: boolean;
    ssn_detected: boolean;
    credit_card_detected: boolean;
    pii_confidence_score: number;
    pii_risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

export interface ProfilingResult {
  entity_name: string;
  entity_type: string;
  profiled_at: string;
  dataset_statistics: {
    total_record_count: number;
    total_column_count: number;
    dataset_size_bytes: number;
    profiling_timestamp: string;
    profiling_duration_seconds: number;
  };
  dataset_data_quality: {
    overall_completeness_score: number;
    overall_quality_score: number;
    quality_grade: QualityGrade;
    pii_risk_score: number;
  };
  columns: ColumnStatistics[];
  summary: {
    completeness: number;
    validity: number;
    consistency: number;
    accuracy: number;
    overall_score: number;
    grade: QualityGrade;
  };
}
