// Type definitions matching backend models

export interface NumericStats {
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  std_dev?: number;
  variance?: number;
  q1?: number;
  q3?: number;
  percentile_5?: number;
  percentile_25?: number;
  percentile_75?: number;
  percentile_95?: number;
  outlier_count?: number;
  outlier_percentage?: number;
}

export interface StringStats {
  min_length?: number;
  max_length?: number;
  avg_length?: number;
  empty_string_count?: number;
  whitespace_only_count?: number;
  leading_spaces_count?: number;
  trailing_spaces_count?: number;
  common_patterns?: Array<{ pattern: string; count: number }>;
  character_set_summary?: Record<string, number>;
}

export interface DateTimeStats {
  min_date?: string;
  max_date?: string;
  date_range_days?: number;
  detected_formats?: string[];
  invalid_date_count?: number;
  future_date_count?: number;
  weekend_count?: number;
  weekday_count?: number;
}

export interface ColumnQualityMetrics {
  completeness_percentage: number;
  validity_percentage: number;
  consistency_score: number;
  conformity_rate: number;
  quality_score: number;
  quality_grade: 'Gold' | 'Silver' | 'Bronze';
}

export interface ValueDistribution {
  cardinality: number;
  cardinality_ratio: number;
  mode?: string;
  mode_frequency?: number;
  top_values: Array<{ value: string; count: number; percentage: number }>;
  bottom_values: Array<{ value: string; count: number; percentage: number }>;
  histogram_bins?: Array<{ bin_start: number; bin_end: number; count: number }>;
  skewness?: number;
}

export interface PIIDetection {
  contains_email: boolean;
  contains_phone: boolean;
  contains_ssn: boolean;
  contains_credit_card: boolean;
  contains_ip_address: boolean;
  contains_names: boolean;
  contains_dob: boolean;
  pii_categories: string[];
  confidence_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
}

export interface ColumnStats {
  column_name: string;
  data_type: string;
  null_count: number;
  null_percentage: number;
  unique_count: number;
  unique_percentage: number;
  duplicate_count: number;
  min_value?: any;
  max_value?: any;
  mean?: number;
  median?: number;
  std_dev?: number;
  top_values: Array<{ value: string; count: number; percentage: number }>;
  numeric_stats?: NumericStats;
  string_stats?: StringStats;
  datetime_stats?: DateTimeStats;
  quality_metrics?: ColumnQualityMetrics;
  value_distribution?: ValueDistribution;
  pii_detection?: PIIDetection;
}

export interface DatasetQualityMetrics {
  overall_completeness: number;
  overall_quality_score: number;
  quality_grade: 'Gold' | 'Silver' | 'Bronze';
  pii_risk_score: number;
}

export interface ReferentialIntegrity {
  foreign_key_checks: Array<Record<string, any>>;
  orphan_records: Array<{ column: string; null_count: number; message: string }>;
  cross_table_consistency: Array<{ column: string; duplicate_count: number; message: string }>;
}

export interface CandidateKey {
  columns: string[];
  is_unique: boolean;
  uniqueness_percentage: number;
  is_composite: boolean;
  has_nulls: boolean;
  recommendation: 'primary_key' | 'candidate_key' | 'near_unique';
}

export interface CandidateKeys {
  single_column_keys: CandidateKey[];
  composite_keys: CandidateKey[];
  primary_key_suggestions: CandidateKey[];
}

export interface DatasetStatistics {
  total_records: number;
  total_columns: number;
  dataset_size_bytes: number;
  profiling_duration_seconds: number;
  profiled_at: string;
}

export interface Dataset {
  dataset_name: string;
  row_count: number;
  column_count: number;
  file_size_bytes: number;
  columns: ColumnStats[];
  profiled_at: string;
  dataset_statistics?: DatasetStatistics;
  dataset_quality?: DatasetQualityMetrics;
  referential_integrity?: ReferentialIntegrity;
  candidate_keys?: CandidateKeys;
}

export interface JobResult {
  job_id: string;
  job_name: string;
  status: string;
  datasets: Dataset[];
  total_rows: number;
  total_columns: number;
  completed_at: string;
}

export interface Job {
  job_id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}
