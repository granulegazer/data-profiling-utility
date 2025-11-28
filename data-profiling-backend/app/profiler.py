"""CSV Profiling Service"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional
import chardet
import re
from collections import Counter
from itertools import combinations
from app.models import (
    ColumnStats, DatasetProfile, CSVConfig, Rulesets,
    NumericStats, StringStats, DateTimeStats, ColumnQualityMetrics,
    ValueDistribution, PIIDetection, DatasetStatistics, DatasetQualityMetrics,
    ReferentialIntegrity, CandidateKeys, CandidateKey
)


class CSVProfiler:
    """CSV file profiler with comprehensive rule support"""
    
    def __init__(
        self, 
        csv_config: CSVConfig, 
        rulesets: Rulesets,
        sample_size: Optional[int] = None, 
        selected_columns: Optional[List[str]] = None
    ):
        self.csv_config = csv_config
        self.rulesets = rulesets
        self.sample_size = sample_size
        self.selected_columns = selected_columns
        
        # PII detection patterns
        self.pii_patterns = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'\b(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
            'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
            'credit_card': r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
            'ip_address': r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b',
        }
    
    def detect_encoding(self, file_path: Path) -> str:
        """Detect file encoding"""
        with open(file_path, 'rb') as f:
            raw_data = f.read(10000)  # Read first 10KB
            result = chardet.detect(raw_data)
            return result['encoding'] if result['encoding'] else 'utf-8'
    
    def infer_data_type(self, series: pd.Series) -> str:
        """Infer semantic data type from pandas series"""
        dtype = series.dtype
        
        # Numeric types
        if pd.api.types.is_integer_dtype(dtype):
            return "integer"
        elif pd.api.types.is_float_dtype(dtype):
            return "float"
        elif pd.api.types.is_bool_dtype(dtype):
            return "boolean"
        
        # Date/time types
        elif pd.api.types.is_datetime64_any_dtype(dtype):
            return "datetime"
        
        # String/object types - try to infer more specific types
        elif pd.api.types.is_string_dtype(dtype) or pd.api.types.is_object_dtype(dtype):
            # Sample non-null values for inference
            sample = series.dropna().head(100)
            if len(sample) == 0:
                return "string"
            
            # Check if it's a date string
            try:
                pd.to_datetime(sample)
                return "date_string"
            except:
                pass
            
            return "string"
        
        return str(dtype)
    
    def analyze_numeric_column(self, series: pd.Series) -> Optional[NumericStats]:
        """Analyze numeric column - Rule: Numeric Analysis"""
        if not self.rulesets.attribute_level.numeric_analysis:
            return None
            
        if not pd.api.types.is_numeric_dtype(series):
            return None
        
        non_null = series.dropna()
        if len(non_null) == 0:
            return None
        
        # Calculate quartiles and percentiles
        q1 = float(non_null.quantile(0.25))
        q3 = float(non_null.quantile(0.75))
        iqr = q3 - q1
        
        # Outlier detection using IQR with Z-score fallback for zero IQR
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        outliers = non_null[(non_null < lower_bound) | (non_null > upper_bound)]
        if iqr == 0:
            mean_val = float(non_null.mean())
            std_val = float(non_null.std(ddof=0))
            if std_val > 0:
                z_scores = (non_null - mean_val) / std_val
                outliers = non_null[z_scores.abs() > 3]

        return NumericStats(
            min=float(non_null.min()),
            max=float(non_null.max()),
            mean=float(non_null.mean()),
            median=float(non_null.median()),
            std_dev=float(non_null.std()),
            variance=float(non_null.var()),
            q1=q1,
            q3=q3,
            percentile_5=float(non_null.quantile(0.05)),
            percentile_25=q1,
            percentile_75=q3,
            percentile_95=float(non_null.quantile(0.95)),
            outlier_count=len(outliers),
            outlier_percentage=float(len(outliers) / len(non_null) * 100)
        )
    
    def analyze_string_column(self, series: pd.Series) -> Optional[StringStats]:
        """Analyze string column - Rule: String Analysis"""
        if not self.rulesets.attribute_level.string_analysis:
            return None
            
        if not (pd.api.types.is_string_dtype(series) or pd.api.types.is_object_dtype(series)):
            return None
        
        non_null = series.dropna().astype(str)
        if len(non_null) == 0:
            return None
        
        # Length statistics
        lengths = non_null.str.len()
        
        # Space detection
        empty_strings = (non_null == '').sum()
        whitespace_only = non_null.str.match(r'^\s+$').sum()
        leading_spaces = (non_null != non_null.str.lstrip()).sum()
        trailing_spaces = (non_null != non_null.str.rstrip()).sum()
        
        # Pattern analysis - detect common patterns
        patterns = []
        for val in non_null.head(100):
            pattern = re.sub(r'[a-zA-Z]', 'A', val)
            pattern = re.sub(r'[0-9]', '9', pattern)
            patterns.append(pattern)
        
        pattern_counter = Counter(patterns)
        common_patterns = [
            {"pattern": pattern, "count": count}
            for pattern, count in pattern_counter.most_common(5)
        ]
        
        # Character set analysis
        char_sets = {
            'alphanumeric': non_null.str.match(r'^[a-zA-Z0-9]+$').sum(),
            'alpha_only': non_null.str.match(r'^[a-zA-Z]+$').sum(),
            'numeric_only': non_null.str.match(r'^[0-9]+$').sum(),
            'special_chars': non_null.str.contains(r'[^a-zA-Z0-9\s]').sum()
        }
        
        return StringStats(
            min_length=int(lengths.min()),
            max_length=int(lengths.max()),
            avg_length=float(lengths.mean()),
            empty_string_count=int(empty_strings),
            whitespace_only_count=int(whitespace_only),
            leading_spaces_count=int(leading_spaces),
            trailing_spaces_count=int(trailing_spaces),
            common_patterns=common_patterns,
            character_set_summary=char_sets
        )
    
    def analyze_datetime_column(self, series: pd.Series) -> Optional[DateTimeStats]:
        """Analyze date/time column - Rule: Date/Time Analysis"""
        if not self.rulesets.attribute_level.date_time_analysis:
            return None
        
        # Try to convert to datetime
        try:
            dt_series = pd.to_datetime(series, errors='coerce')
            valid_dates = dt_series.dropna()
            
            if len(valid_dates) == 0:
                return None
            
            non_null_total = series.notnull().sum()
            format_consistency = (len(valid_dates) / non_null_total) if non_null_total > 0 else 0
            
            min_date = valid_dates.min()
            max_date = valid_dates.max()
            date_range = (max_date - min_date).days
            
            # Detect formats
            non_null = series.dropna().astype(str)
            detected_formats = []
            for fmt in ['%Y-%m-%d', '%m/%d/%Y', '%d-%m-%Y', '%Y/%m/%d']:
                try:
                    pd.to_datetime(non_null.head(10), format=fmt)
                    detected_formats.append(fmt)
                except:
                    pass
            
            # Invalid dates
            invalid_count = len(series.dropna()) - len(valid_dates)
            
            # Future dates
            now = pd.Timestamp.now()
            future_count = (valid_dates > now).sum()
            
            # Weekend/weekday analysis
            weekend_count = valid_dates.dt.dayofweek.isin([5, 6]).sum()
            weekday_count = len(valid_dates) - weekend_count
            
            return DateTimeStats(
                min_date=str(min_date),
                max_date=str(max_date),
                date_range_days=int(date_range),
                detected_formats=detected_formats,
                invalid_date_count=int(invalid_count),
                future_date_count=int(future_count),
                weekend_count=int(weekend_count),
                weekday_count=int(weekday_count),
                format_consistency=float(format_consistency)
            )
        except:
            return None
    
    def calculate_column_quality(self, series: pd.Series, data_type: str) -> Optional[ColumnQualityMetrics]:
        """Calculate column quality metrics - Rule: Column Quality"""
        if not self.rulesets.attribute_level.column_quality:
            return None
        
        total_count = len(series)
        null_rate = float(series.isnull().mean()) if total_count > 0 else 0.0
        distinctness_ratio = float(series.nunique(dropna=False) / total_count) if total_count > 0 else 0.0

        # Grade assignment based on Generic_Rules.md thresholds
        if null_rate <= 0.01 and 0.05 <= distinctness_ratio <= 0.95:
            grade = "Gold"
            quality_score = 100.0
        elif null_rate <= 0.05 and 0.02 <= distinctness_ratio <= 0.98:
            grade = "Silver"
            quality_score = 80.0
        else:
            grade = "Bronze"
            quality_score = 60.0

        completeness = (1 - null_rate) * 100
        validity = distinctness_ratio * 100
        consistency = validity
        conformity = (completeness + validity) / 2
        
        return ColumnQualityMetrics(
            null_rate=null_rate,
            distinctness_ratio=distinctness_ratio,
            completeness_percentage=float(completeness),
            validity_percentage=float(validity),
            consistency_score=float(consistency),
            conformity_rate=float(conformity),
            quality_score=float(quality_score),
            quality_grade=grade
        )
    
    def calculate_value_distribution(self, series: pd.Series) -> Optional[ValueDistribution]:
        """Calculate value distribution - Rule: Value Distribution"""
        if not self.rulesets.attribute_level.value_distribution:
            return None
        
        non_null = series.dropna()
        
        if len(non_null) == 0:
            return None
        
        total_count = len(non_null)
        
        cardinality = non_null.nunique()
        cardinality_ratio = cardinality / len(series) if len(series) > 0 else 0
        
        # Mode
        value_counts = non_null.value_counts()
        mode = value_counts.index[0] if len(value_counts) > 0 else None
        mode_frequency = int(value_counts.iloc[0]) if len(value_counts) > 0 else None
        
        # Top and bottom values (default N=10)
        top_values = [
            {"value": str(val), "count": int(count), "percentage": float(count / total_count * 100)}
            for val, count in value_counts.head(10).items()
        ]
        
        bottom_counts = non_null.value_counts(ascending=True)
        bottom_values = [
            {"value": str(val), "count": int(count), "percentage": float(count / total_count * 100)}
            for val, count in bottom_counts.head(10).items()
        ]
        
        # Histogram bins for numeric data (default 20 bins)
        histogram_bins = []
        if pd.api.types.is_numeric_dtype(series):
            try:
                counts, bin_edges = np.histogram(non_null, bins=20)
                histogram_bins = [
                    {
                        "bin_start": float(bin_edges[i]),
                        "bin_end": float(bin_edges[i+1]),
                        "count": int(counts[i])
                    }
                    for i in range(len(counts))
                ]
            except:
                pass
        
        # Skewness
        skewness = None
        if pd.api.types.is_numeric_dtype(series):
            try:
                skewness = float(non_null.skew())
            except:
                pass
        
        return ValueDistribution(
            cardinality=cardinality,
            cardinality_ratio=float(cardinality_ratio),
            mode=str(mode) if mode is not None else None,
            mode_frequency=mode_frequency,
            top_values=top_values,
            bottom_values=bottom_values,
            histogram_bins=histogram_bins,
            skewness=skewness
        )
    
    def detect_pii(self, series: pd.Series) -> Optional[PIIDetection]:
        """Detect PII in column - Rule: PII Detection"""
        if not self.rulesets.attribute_level.pii_detection:
            return None
        
        non_null = series.dropna().astype(str)
        if len(non_null) == 0:
            return None

        combined_pattern = "|".join(self.pii_patterns.values())
        match_series = non_null.str.contains(combined_pattern, regex=True, case=False, na=False)
        match_rate = float(match_series.mean())

        # Pattern-specific flags
        pii_flags = {
            pii_type: bool(non_null.str.contains(pattern, regex=True, case=False, na=False).any())
            for pii_type, pattern in self.pii_patterns.items()
        }
        pii_categories = [pii_type for pii_type, flag in pii_flags.items() if flag]

        # Column name hints
        name_keywords = ['email', 'mail', 'phone', 'mobile', 'contact', 'ssn', 'social', 'credit', 'card', 'ip', 'address']
        name_hint = 0.3 if any(keyword in series.name.lower() for keyword in name_keywords) else 0.0
        if name_hint > 0:
            pii_categories.append('name_hint')

        confidence_score = min(1.0, 0.7 * match_rate + name_hint)

        if confidence_score > 0.5:
            risk_level = "High"
        elif confidence_score > 0.2:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        return PIIDetection(
            contains_email=pii_flags.get('email', False),
            contains_phone=pii_flags.get('phone', False),
            contains_ssn=pii_flags.get('ssn', False),
            contains_credit_card=pii_flags.get('credit_card', False),
            contains_ip_address=pii_flags.get('ip_address', False),
            contains_names=False,
            contains_dob=False,
            pii_categories=pii_categories,
            confidence_score=float(confidence_score),
            risk_level=risk_level
        )
    
    def calculate_column_stats(self, df: pd.DataFrame, column_name: str) -> ColumnStats:
        """Calculate comprehensive statistics for a single column"""
        series = df[column_name]
        total_count = len(series)
        null_count = series.isnull().sum()
        non_null_count = total_count - null_count
        
        # Basic stats - Rule: Column Statistics
        null_percentage = (null_count / total_count * 100) if total_count > 0 else 0
        unique_count = series.nunique()
        unique_percentage = (unique_count / total_count * 100) if total_count > 0 else 0
        duplicate_count = total_count - unique_count
        
        # Data type - Rule: Data Type Analysis
        data_type = self.infer_data_type(series)
        
        # Legacy fields for backward compatibility
        min_value = None
        max_value = None
        mean = None
        median = None
        std_dev = None
        top_values = []
        
        if pd.api.types.is_numeric_dtype(series) and non_null_count > 0:
            min_value = float(series.min())
            max_value = float(series.max())
            mean = float(series.mean())
            median = float(series.median())
            std_dev = float(series.std())
        
        if non_null_count > 0:
            value_counts = series.value_counts().head(5)
            top_values = [
                {"value": str(value), "count": int(count), "percentage": float(count / total_count * 100)}
                for value, count in value_counts.items()
            ]
        
        # Apply attribute-level rules
        numeric_stats = self.analyze_numeric_column(series)
        string_stats = self.analyze_string_column(series)
        datetime_stats = self.analyze_datetime_column(series)
        quality_metrics = self.calculate_column_quality(series, data_type)
        value_distribution = self.calculate_value_distribution(series)
        pii_detection = self.detect_pii(series)
        
        return ColumnStats(
            column_name=column_name,
            data_type=data_type,
            null_count=int(null_count),
            null_percentage=float(null_percentage),
            unique_count=int(unique_count),
            unique_percentage=float(unique_percentage),
            duplicate_count=int(duplicate_count),
            min_value=min_value,
            max_value=max_value,
            mean=mean,
            median=median,
            std_dev=std_dev,
            top_values=top_values,
            numeric_stats=numeric_stats,
            string_stats=string_stats,
            datetime_stats=datetime_stats,
            quality_metrics=quality_metrics,
            value_distribution=value_distribution,
            pii_detection=pii_detection
        )
    
    def calculate_dataset_statistics(self, df: pd.DataFrame, file_size: int, profiling_duration: float) -> Optional[DatasetStatistics]:
        """Calculate dataset statistics - Rule: Dataset Statistics"""
        if not self.rulesets.dataset_level.dataset_statistics:
            return None
        
        return DatasetStatistics(
            total_records=len(df),
            total_columns=len(df.columns),
            dataset_size_bytes=file_size,
            profiling_duration_seconds=profiling_duration,
            profiled_at=datetime.now()
        )
    
    def calculate_dataset_quality(self, df: pd.DataFrame, column_stats: List[ColumnStats]) -> Optional[DatasetQualityMetrics]:
        """Calculate dataset quality metrics - Rule: Dataset Quality"""
        if not self.rulesets.dataset_level.dataset_quality:
            return None
        
        total_cells = len(df) * len(df.columns)
        total_nulls = df.isnull().sum().sum()
        overall_completeness = ((total_cells - total_nulls) / total_cells * 100) if total_cells > 0 else 0
        
        # Calculate average quality score from columns
        quality_scores = [
            col.quality_metrics.quality_score 
            for col in column_stats 
            if col.quality_metrics is not None
        ]
        overall_quality_score = sum(quality_scores) / len(quality_scores) if quality_scores else 0
        
        # Calculate PII risk
        pii_detections = [
            col.pii_detection.confidence_score
            for col in column_stats
            if col.pii_detection is not None
        ]
        pii_risk_score = max(pii_detections) if pii_detections else 0
        if pii_risk_score > 0.5:
            pii_risk_level = "High"
        elif pii_risk_score > 0.2:
            pii_risk_level = "Medium"
        else:
            pii_risk_level = "Low"
        
        # Determine grade
        if overall_quality_score >= 90:
            grade = "Gold"
        elif overall_quality_score >= 70:
            grade = "Silver"
        else:
            grade = "Bronze"
        
        return DatasetQualityMetrics(
            overall_completeness=float(overall_completeness),
            overall_quality_score=float(overall_quality_score),
            quality_grade=grade,
            pii_risk_score=float(pii_risk_score),
            pii_risk_level=pii_risk_level
        )
    
    def analyze_referential_integrity(self, df: pd.DataFrame) -> Optional[ReferentialIntegrity]:
        """Analyze referential integrity - Rule: Referential Integrity"""
        if not self.rulesets.dataset_level.referential_integrity:
            return None
        
        # For single file profiling, we can only do basic checks
        # In multi-file scenarios, this would check foreign keys across files
        
        foreign_key_checks = []
        orphan_records = []
        cross_table_consistency = []
        
        # Basic integrity check: look for column name patterns suggesting relationships
        id_columns = [col for col in df.columns if col.lower().endswith('_id')]
        
        for id_col in id_columns:
            # Check for nulls in ID columns (potential orphans)
            null_ids = df[id_col].isnull().sum()
            if null_ids > 0:
                orphan_records.append({
                    "column": id_col,
                    "null_count": int(null_ids),
                    "message": f"{id_col} has {null_ids} null values"
                })
        
        # Foreign key style checks: child `_id` column should exist in parent column with same base name
        for child_col in id_columns:
            base_name = child_col[:-3].lower()  # remove '_id'
            parent_candidates = [c for c in df.columns if c.lower() == base_name or c.lower() == f"{base_name}id" or c.lower() == "id"]
            
            for parent_col in parent_candidates:
                child_non_null = df[child_col].dropna()
                parent_non_null = df[parent_col].dropna()
                
                if len(child_non_null) == 0:
                    continue
                
                missing_mask = ~child_non_null.isin(parent_non_null)
                missing_count = int(missing_mask.sum())
                match_rate = 1 - (missing_count / len(child_non_null))
                
                foreign_key_checks.append({
                    "child_column": child_col,
                    "parent_column": parent_col,
                    "missing_count": missing_count,
                    "match_rate": float(match_rate)
                })
        
        # Check for duplicate IDs in ID columns (consistency check)
        for id_col in id_columns:
            duplicates = df[id_col].duplicated().sum()
            if duplicates > 0:
                cross_table_consistency.append({
                    "column": id_col,
                    "duplicate_count": int(duplicates),
                    "message": f"{id_col} has {duplicates} duplicate values"
                })
        
        return ReferentialIntegrity(
            foreign_key_checks=foreign_key_checks,
            orphan_records=orphan_records,
            cross_table_consistency=cross_table_consistency
        )
    
    def discover_candidate_keys(self, df: pd.DataFrame) -> Optional[CandidateKeys]:
        """Discover candidate keys - Rule: Candidate Key Discovery"""
        if not self.rulesets.dataset_level.candidate_keys:
            return None
        
        single_column_keys = []
        composite_keys = []
        primary_key_suggestions = []
        
        total_rows = len(df)
        
        # Single column key analysis (must be fully non-null and unique)
        for col in df.columns:
            null_count = df[col].isnull().sum()
            if null_count > 0 or total_rows == 0:
                continue

            unique_count = df[col].nunique(dropna=False)
            is_unique = unique_count == total_rows

            if not is_unique:
                continue

            candidate = CandidateKey(
                columns=[col],
                is_unique=True,
                uniqueness_percentage=100.0,
                is_composite=False,
                has_nulls=False,
                recommendation="primary_key"
            )
            
            single_column_keys.append(candidate)
            primary_key_suggestions.append(candidate)
        
        # Composite key analysis (2-column combinations only for performance)
        if len(df.columns) <= 20 and total_rows > 0:  # Only for smaller datasets
            for col1, col2 in combinations(df.columns, 2):
                pair = df[[col1, col2]]
                if pair.isnull().any(axis=1).any():
                    continue

                unique_count = pair.drop_duplicates().shape[0]
                is_unique = unique_count == total_rows
                
                if not is_unique:
                    continue
                
                candidate = CandidateKey(
                    columns=[col1, col2],
                    is_unique=True,
                    uniqueness_percentage=100.0,
                    is_composite=True,
                    has_nulls=False,
                    recommendation="primary_key"
                )
                
                composite_keys.append(candidate)
                
                if len(primary_key_suggestions) == 0:
                    primary_key_suggestions.append(candidate)
        
        return CandidateKeys(
            single_column_keys=single_column_keys,
            composite_keys=composite_keys,
            primary_key_suggestions=primary_key_suggestions
        )
    
    def profile_csv(self, file_path: Path, dataset_name: str) -> DatasetProfile:
        """Profile a single CSV file with comprehensive rules"""
        start_time = datetime.now()
        
        # Detect encoding
        encoding = self.detect_encoding(file_path)
        
        # Read CSV
        read_kwargs = {
            'filepath_or_buffer': file_path,
            'sep': self.csv_config.delimiter,
            'encoding': encoding,
            'header': 0 if self.csv_config.has_header else None,
        }
        
        if self.sample_size:
            read_kwargs['nrows'] = self.sample_size
        
        df = pd.read_csv(**read_kwargs)
        
        # If no header, generate column names
        if not self.csv_config.has_header:
            df.columns = [f"Column_{i+1}" for i in range(len(df.columns))]
        
        # Filter columns if specific columns are selected
        columns_to_profile = df.columns
        if self.selected_columns:
            columns_to_profile = [col for col in df.columns if col in self.selected_columns]
        
        # Calculate statistics for each column (Attribute-Level Rules)
        column_stats = []
        for column in columns_to_profile:
            try:
                stats = self.calculate_column_stats(df, column)
                column_stats.append(stats)
            except Exception as e:
                print(f"Error profiling column {column}: {e}")
                # Create minimal stats on error
                column_stats.append(ColumnStats(
                    column_name=column,
                    data_type="unknown",
                    null_count=0,
                    null_percentage=0.0,
                    unique_count=0,
                    unique_percentage=0.0,
                    duplicate_count=0,
                    top_values=[]
                ))
        
        # Get file size
        file_size = file_path.stat().st_size
        
        # Calculate profiling duration
        profiling_duration = (datetime.now() - start_time).total_seconds()
        
        # Apply Dataset-Level Rules
        dataset_statistics = self.calculate_dataset_statistics(df, file_size, profiling_duration)
        dataset_quality = self.calculate_dataset_quality(df, column_stats)
        referential_integrity = self.analyze_referential_integrity(df)
        candidate_keys = self.discover_candidate_keys(df)
        
        return DatasetProfile(
            dataset_name=dataset_name,
            row_count=len(df),
            column_count=len(df.columns),
            file_size_bytes=file_size,
            columns=column_stats,
            profiled_at=datetime.now(),
            dataset_statistics=dataset_statistics,
            dataset_quality=dataset_quality,
            referential_integrity=referential_integrity,
            candidate_keys=candidate_keys
        )
    
    def profile_multiple_csvs(self, file_paths: List[Path]) -> List[DatasetProfile]:
        """Profile multiple CSV files"""
        profiles = []
        for file_path in file_paths:
            try:
                dataset_name = file_path.stem  # Use filename without extension
                profile = self.profile_csv(file_path, dataset_name)
                profiles.append(profile)
            except Exception as e:
                print(f"Error profiling {file_path}: {e}")
                # Continue with other files
        
        return profiles
