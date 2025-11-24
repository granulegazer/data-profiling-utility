"""Main profiling engine"""
import pandas as pd
import numpy as np
from typing import Dict, Any, List
from .rules import GenericRules, CustomRules


class ProfilingEngine:
    """Engine for profiling datasets"""
    
    def __init__(self):
        self.generic_rules = GenericRules()
        self.custom_rules = CustomRules()
    
    def profile_dataframe(self, df: pd.DataFrame, table_name: str = "dataset") -> Dict[str, Any]:
        """Profile an entire DataFrame"""
        results = {
            "table_name": table_name,
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "columns": []
        }
        
        for column in df.columns:
            column_profile = self.profile_column(df[column], str(column))
            results["columns"].append(column_profile)
        
        return results
    
    def profile_column(self, series: pd.Series, column_name: str) -> Dict[str, Any]:
        """Profile a single column"""
        profile = {
            "column_name": column_name,
            "data_type": str(series.dtype),
            "total_count": len(series),
        }
        
        # Basic statistics
        profile.update(self._basic_statistics(series))
        
        # Apply generic rules
        profile["completeness"] = self.generic_rules.completeness_check(series)
        profile["uniqueness"] = self.generic_rules.uniqueness_check(series)
        profile["validity"] = self.generic_rules.validity_check(series)
        profile["consistency"] = self.generic_rules.consistency_check(series)
        profile["accuracy"] = self.generic_rules.accuracy_check(series)
        
        # Apply custom rules
        profile["email_pattern"] = self.custom_rules.email_pattern_check(series)
        profile["phone_pattern"] = self.custom_rules.phone_pattern_check(series)
        profile["date_pattern"] = self.custom_rules.date_pattern_check(series)
        
        # Pattern analysis
        profile["patterns"] = self._analyze_patterns(series)
        
        # Top values
        profile["top_values"] = self._get_top_values(series)
        
        # Collect quality issues
        profile["quality_issues"] = self._collect_quality_issues(profile)
        
        return profile
    
    def _basic_statistics(self, series: pd.Series) -> Dict[str, Any]:
        """Calculate basic statistics for a column"""
        stats = {
            "null_count": int(series.isna().sum()),
            "null_percentage": float((series.isna().sum() / len(series) * 100) if len(series) > 0 else 0),
            "unique_count": int(series.nunique()),
            "unique_percentage": float((series.nunique() / len(series) * 100) if len(series) > 0 else 0),
        }
        
        # Numeric statistics
        if pd.api.types.is_numeric_dtype(series):
            non_null = series.dropna()
            if len(non_null) > 0:
                stats.update({
                    "min_value": float(non_null.min()),
                    "max_value": float(non_null.max()),
                    "mean_value": float(non_null.mean()),
                    "median_value": float(non_null.median()),
                    "std_dev": float(non_null.std()),
                })
        
        # String statistics
        if series.dtype == 'object':
            non_null = series.dropna().astype(str)
            if len(non_null) > 0:
                lengths = non_null.str.len()
                stats.update({
                    "min_length": int(lengths.min()),
                    "max_length": int(lengths.max()),
                    "avg_length": float(lengths.mean()),
                })
        
        return stats
    
    def _analyze_patterns(self, series: pd.Series) -> List[Dict[str, Any]]:
        """Analyze patterns in string data"""
        if series.dtype != 'object':
            return []
        
        patterns = []
        non_null = series.dropna().astype(str)
        
        if len(non_null) == 0:
            return patterns
        
        # Sample patterns
        sample = non_null.head(100)
        
        # Check for common patterns
        pattern_checks = {
            "numeric_only": r'^\d+$',
            "alphanumeric": r'^[a-zA-Z0-9]+$',
            "uppercase": r'^[A-Z]+$',
            "lowercase": r'^[a-z]+$',
            "email": r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
            "url": r'^https?://',
            "date_iso": r'^\d{4}-\d{2}-\d{2}',
        }
        
        for pattern_name, pattern_regex in pattern_checks.items():
            matches = sample.str.match(pattern_regex).sum()
            if matches > 0:
                patterns.append({
                    "pattern": pattern_name,
                    "count": int(matches),
                    "percentage": float((matches / len(sample) * 100))
                })
        
        return patterns
    
    def _get_top_values(self, series: pd.Series, top_n: int = 10) -> List[Dict[str, Any]]:
        """Get top N most frequent values"""
        value_counts = series.value_counts().head(top_n)
        
        top_values = []
        for value, count in value_counts.items():
            # Handle different types for JSON serialization
            if pd.isna(value):
                value_str = "NULL"
            elif isinstance(value, (np.integer, np.floating)):
                value_str = str(float(value))
            else:
                value_str = str(value)
            
            top_values.append({
                "value": value_str,
                "count": int(count),
                "percentage": float((count / len(series) * 100) if len(series) > 0 else 0)
            })
        
        return top_values
    
    def _collect_quality_issues(self, profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Collect all quality issues from profiling results"""
        issues = []
        
        # Completeness issues
        if profile["completeness"]["null_percentage"] > 10:
            issues.append({
                "severity": "warning",
                "category": "completeness",
                "message": f"High null percentage: {profile['completeness']['null_percentage']:.2f}%"
            })
        
        # Validity issues
        if not profile["validity"]["valid"]:
            for issue in profile["validity"]["issues"]:
                issues.append({
                    "severity": "error",
                    "category": "validity",
                    "message": issue["message"]
                })
        
        # Consistency issues
        if not profile["consistency"]["consistent"]:
            for issue in profile["consistency"]["issues"]:
                issues.append({
                    "severity": "warning",
                    "category": "consistency",
                    "message": issue["message"]
                })
        
        # Accuracy issues
        if not profile["accuracy"]["accurate"]:
            for issue in profile["accuracy"]["issues"]:
                issues.append({
                    "severity": "warning",
                    "category": "accuracy",
                    "message": issue["message"]
                })
        
        return issues
