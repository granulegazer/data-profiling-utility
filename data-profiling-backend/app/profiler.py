"""CSV Profiling Service"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional
import chardet
from app.models import ColumnStats, DatasetProfile, CSVConfig


class CSVProfiler:
    """CSV file profiler"""
    
    def __init__(self, csv_config: CSVConfig, sample_size: Optional[int] = None, selected_columns: Optional[List[str]] = None):
        self.csv_config = csv_config
        self.sample_size = sample_size
        self.selected_columns = selected_columns
    
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
    
    def calculate_column_stats(self, df: pd.DataFrame, column_name: str) -> ColumnStats:
        """Calculate statistics for a single column"""
        series = df[column_name]
        total_count = len(series)
        null_count = series.isnull().sum()
        non_null_count = total_count - null_count
        
        # Basic stats
        null_percentage = (null_count / total_count * 100) if total_count > 0 else 0
        unique_count = series.nunique()
        unique_percentage = (unique_count / total_count * 100) if total_count > 0 else 0
        
        # Data type
        data_type = self.infer_data_type(series)
        
        # Numeric statistics
        min_value = None
        max_value = None
        mean = None
        median = None
        std_dev = None
        
        if pd.api.types.is_numeric_dtype(series):
            if non_null_count > 0:
                min_value = float(series.min())
                max_value = float(series.max())
                mean = float(series.mean())
                median = float(series.median())
                std_dev = float(series.std())
        elif pd.api.types.is_string_dtype(series) or pd.api.types.is_object_dtype(series):
            # For strings, show min/max by length or alphabetically
            non_null_series = series.dropna()
            if len(non_null_series) > 0:
                try:
                    min_value = str(non_null_series.min())
                    max_value = str(non_null_series.max())
                except:
                    pass
        
        # Top values
        top_values = []
        if non_null_count > 0:
            value_counts = series.value_counts().head(5)
            top_values = [
                {
                    "value": str(value),
                    "count": int(count),
                    "percentage": float(count / total_count * 100)
                }
                for value, count in value_counts.items()
            ]
        
        return ColumnStats(
            column_name=column_name,
            data_type=data_type,
            null_count=int(null_count),
            null_percentage=float(null_percentage),
            unique_count=int(unique_count),
            unique_percentage=float(unique_percentage),
            min_value=min_value,
            max_value=max_value,
            mean=mean,
            median=median,
            std_dev=std_dev,
            top_values=top_values
        )
    
    def profile_csv(self, file_path: Path, dataset_name: str) -> DatasetProfile:
        """Profile a single CSV file"""
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
            # Only profile columns that exist in the dataframe and are selected
            columns_to_profile = [col for col in df.columns if col in self.selected_columns]
        
        # Calculate statistics for each column
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
                    top_values=[]
                ))
        
        # Get file size
        file_size = file_path.stat().st_size
        
        return DatasetProfile(
            dataset_name=dataset_name,
            row_count=len(df),
            column_count=len(df.columns),
            file_size_bytes=file_size,
            columns=column_stats,
            profiled_at=datetime.now()
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
