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
        
        # Outlier detection using IQR method
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        outliers = non_null[(non_null < lower_bound) | (non_null > upper_bound)]
        
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
                weekday_count=int(weekday_count)
            )
        except:
            return None
    
    def calculate_column_quality(self, series: pd.Series, data_type: str) -> Optional[ColumnQualityMetrics]:
        """Calculate column quality metrics - Rule: Column Quality"""
        if not self.rulesets.attribute_level.column_quality:
            return None
        
        total_count = len(series)
        null_count = series.isnull().sum()
        non_null_count = total_count - null_count
        
        # Completeness
        completeness = (non_null_count / total_count * 100) if total_count > 0 else 0
        
        # Validity - check type consistency
        validity = 100.0
        if non_null_count > 0:
            if data_type in ['integer', 'float']:
                try:
                    pd.to_numeric(series.dropna())
                except:
                    validity = 80.0
            elif data_type == 'date_string':
                try:
                    pd.to_datetime(series.dropna())
                    validity = 100.0
                except:
                    validity = 70.0
        
        # Consistency - pattern conformance
        consistency = 100.0
        if pd.api.types.is_string_dtype(series) or pd.api.types.is_object_dtype(series):
            non_null = series.dropna().astype(str)
            if len(non_null) > 0:
                # Check pattern consistency
                patterns = [re.sub(r'[a-zA-Z]', 'A', re.sub(r'[0-9]', '9', str(val))) for val in non_null.head(100)]
                most_common_pattern = Counter(patterns).most_common(1)[0][1]
                consistency = (most_common_pattern / min(len(patterns), 100)) * 100
        
        # Conformity rate
        conformity = (completeness + validity) / 2
        
        # Overall quality score
        quality_score = (completeness * 0.4 + validity * 0.3 + consistency * 0.2 + conformity * 0.1)
        
        # Quality grade
        if quality_score >= 90:
            grade = "Gold"
        elif quality_score >= 70:
            grade = "Silver"
        else:
            grade = "Bronze"
        
        return ColumnQualityMetrics(
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
        
        total_count = len(series)
        non_null = series.dropna()
        
        if len(non_null) == 0:
            return None
        
        cardinality = series.nunique()
        cardinality_ratio = cardinality / total_count if total_count > 0 else 0
        
        # Mode
        value_counts = series.value_counts()
        mode = value_counts.index[0] if len(value_counts) > 0 else None
        mode_frequency = int(value_counts.iloc[0]) if len(value_counts) > 0 else None
        
        # Top and bottom values
        top_values = [
            {"value": str(val), "count": int(count), "percentage": float(count / total_count * 100)}
            for val, count in value_counts.head(10).items()
        ]
        
        bottom_values = [
            {"value": str(val), "count": int(count), "percentage": float(count / total_count * 100)}
            for val, count in value_counts.tail(10).items()
        ]
        
        # Histogram bins for numeric data
        histogram_bins = []
        if pd.api.types.is_numeric_dtype(series):
            try:
                counts, bin_edges = np.histogram(non_null, bins=10)
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
        
        # Sample for PII detection
        sample = non_null.head(1000)
        sample_text = ' '.join(sample)
        
        pii_flags = {}
        pii_categories = []
        
        # Check each PII pattern
        for pii_type, pattern in self.pii_patterns.items():
            matches = re.findall(pattern, sample_text)
            if matches:
                pii_flags[pii_type] = True
                pii_categories.append(pii_type)
            else:
                pii_flags[pii_type] = False
        
        # Name detection (simple heuristic - capitalized words)
        name_pattern = r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b'
        name_matches = re.findall(name_pattern, sample_text)
        contains_names = len(name_matches) > len(sample) * 0.1
        if contains_names:
            pii_categories.append('names')
        
        # DOB detection (date patterns)
        dob_pattern = r'\b(0?[1-9]|1[0-2])/(0?[1-9]|[12][0-9]|3[01])/\d{4}\b'
        dob_matches = re.findall(dob_pattern, sample_text)
        contains_dob = len(dob_matches) > 0
        if contains_dob:
            pii_categories.append('dob')
        
        # Calculate confidence score
        confidence_score = (len(pii_categories) / 9) * 100  # 9 possible categories
        
        # Determine risk level
        if confidence_score > 50:
            risk_level = "High"
        elif confidence_score > 20:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        return PIIDetection(
            contains_email=pii_flags.get('email', False),
            contains_phone=pii_flags.get('phone', False),
            contains_ssn=pii_flags.get('ssn', False),
            contains_credit_card=pii_flags.get('credit_card', False),
            contains_ip_address=pii_flags.get('ip_address', False),
            contains_names=contains_names,
            contains_dob=contains_dob,
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
            pii_risk_score=float(pii_risk_score)
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
        id_columns = [col for col in df.columns if 'id' in col.lower()]
        
        for id_col in id_columns:
            # Check for nulls in ID columns (potential orphans)
            null_ids = df[id_col].isnull().sum()
            if null_ids > 0:
                orphan_records.append({
                    "column": id_col,
                    "null_count": int(null_ids),
                    "message": f"{id_col} has {null_ids} null values"
                })
        
        # Check for duplicate IDs in primary key candidates
        for id_col in id_columns:
            if 'id' == id_col.lower() or id_col.lower().endswith('_id'):
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
        
        # Single column key analysis
        for col in df.columns:
            unique_count = df[col].nunique()
            null_count = df[col].isnull().sum()
            uniqueness = (unique_count / total_rows * 100) if total_rows > 0 else 0
            
            is_unique = unique_count == total_rows
            has_nulls = null_count > 0
            
            # Determine recommendation
            if is_unique and not has_nulls:
                recommendation = "primary_key"
            elif is_unique and has_nulls:
                recommendation = "candidate_key"
            elif uniqueness > 95:
                recommendation = "near_unique"
            else:
                continue  # Skip columns with low uniqueness
            
            candidate = CandidateKey(
                columns=[col],
                is_unique=is_unique,
                uniqueness_percentage=float(uniqueness),
                is_composite=False,
                has_nulls=has_nulls,
                recommendation=recommendation
            )
            
            single_column_keys.append(candidate)
            
            if recommendation == "primary_key":
                primary_key_suggestions.append(candidate)
        
        # Composite key analysis (2-column combinations only for performance)
        if len(df.columns) <= 20:  # Only for smaller datasets
            for col1, col2 in combinations(df.columns, 2):
                # Check uniqueness of combination
                combined = df[[col1, col2]].drop_duplicates()
                unique_count = len(combined)
                null_count = df[[col1, col2]].isnull().any(axis=1).sum()
                uniqueness = (unique_count / total_rows * 100) if total_rows > 0 else 0
                
                if uniqueness > 95:  # Only high uniqueness combos
                    is_unique = unique_count == total_rows
                    has_nulls = null_count > 0
                    
                    if is_unique and not has_nulls:
                        recommendation = "primary_key"
                    elif is_unique:
                        recommendation = "candidate_key"
                    else:
                        recommendation = "near_unique"
                    
                    candidate = CandidateKey(
                        columns=[col1, col2],
                        is_unique=is_unique,
                        uniqueness_percentage=float(uniqueness),
                        is_composite=True,
                        has_nulls=has_nulls,
                        recommendation=recommendation
                    )
                    
                    composite_keys.append(candidate)
                    
                    if recommendation == "primary_key" and len(primary_key_suggestions) == 0:
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
