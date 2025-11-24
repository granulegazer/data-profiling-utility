"""Profiling rules - generic and custom"""
import re
import pandas as pd
from typing import Dict, Any, List
from abc import ABC, abstractmethod


class ProfileRule(ABC):
    """Abstract base class for profiling rules"""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
    
    @abstractmethod
    def apply(self, series: pd.Series) -> Dict[str, Any]:
        """Apply rule to a data series"""
        pass


class GenericRules:
    """Generic profiling rules similar to OEDQ/IDQ"""
    
    @staticmethod
    def completeness_check(series: pd.Series) -> Dict[str, Any]:
        """Check data completeness"""
        total = len(series)
        null_count = series.isna().sum()
        return {
            "rule": "completeness",
            "total_count": int(total),
            "null_count": int(null_count),
            "null_percentage": float((null_count / total * 100) if total > 0 else 0),
            "completeness_percentage": float(((total - null_count) / total * 100) if total > 0 else 0)
        }
    
    @staticmethod
    def uniqueness_check(series: pd.Series) -> Dict[str, Any]:
        """Check data uniqueness"""
        total = len(series)
        unique_count = series.nunique()
        return {
            "rule": "uniqueness",
            "unique_count": int(unique_count),
            "unique_percentage": float((unique_count / total * 100) if total > 0 else 0),
            "duplicate_count": int(total - unique_count)
        }
    
    @staticmethod
    def validity_check(series: pd.Series) -> Dict[str, Any]:
        """Check data validity based on data type"""
        issues = []
        
        # Check for mixed types
        types = series.apply(type).unique()
        if len(types) > 1:
            issues.append({
                "type": "mixed_types",
                "message": f"Column contains multiple data types: {[t.__name__ for t in types]}"
            })
        
        # Check for special characters in strings
        if series.dtype == 'object':
            special_chars = series.astype(str).str.contains(r'[^\w\s\-\.]', regex=True, na=False)
            if special_chars.any():
                issues.append({
                    "type": "special_characters",
                    "message": f"Found {special_chars.sum()} values with special characters"
                })
        
        return {
            "rule": "validity",
            "issues": issues,
            "valid": len(issues) == 0
        }
    
    @staticmethod
    def consistency_check(series: pd.Series) -> Dict[str, Any]:
        """Check data consistency"""
        issues = []
        
        # Check for consistent case in strings
        if series.dtype == 'object':
            non_null = series.dropna()
            if len(non_null) > 0:
                lower_count = non_null.str.islower().sum()
                upper_count = non_null.str.isupper().sum()
                
                if lower_count > 0 and upper_count > 0:
                    issues.append({
                        "type": "inconsistent_case",
                        "message": f"Mixed case: {lower_count} lowercase, {upper_count} uppercase"
                    })
        
        # Check for leading/trailing whitespace
        if series.dtype == 'object':
            whitespace = series.astype(str).str.strip() != series.astype(str)
            if whitespace.any():
                issues.append({
                    "type": "whitespace",
                    "message": f"Found {whitespace.sum()} values with leading/trailing whitespace"
                })
        
        return {
            "rule": "consistency",
            "issues": issues,
            "consistent": len(issues) == 0
        }
    
    @staticmethod
    def accuracy_check(series: pd.Series) -> Dict[str, Any]:
        """Check data accuracy using statistical outliers"""
        issues = []
        
        if pd.api.types.is_numeric_dtype(series):
            # Use IQR method for outlier detection
            Q1 = series.quantile(0.25)
            Q3 = series.quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outliers = ((series < lower_bound) | (series > upper_bound)).sum()
            if outliers > 0:
                issues.append({
                    "type": "statistical_outliers",
                    "message": f"Found {outliers} potential outliers",
                    "bounds": {"lower": float(lower_bound), "upper": float(upper_bound)}
                })
        
        return {
            "rule": "accuracy",
            "issues": issues,
            "accurate": len(issues) == 0
        }


class CustomRules:
    """Custom profiling rules specific to business requirements"""
    
    @staticmethod
    def email_pattern_check(series: pd.Series) -> Dict[str, Any]:
        """Check if values match email pattern"""
        if series.dtype != 'object':
            return {"rule": "email_pattern", "applicable": False}
        
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        non_null = series.dropna()
        
        if len(non_null) == 0:
            return {"rule": "email_pattern", "applicable": False}
        
        matches = non_null.astype(str).str.match(email_pattern)
        match_count = matches.sum()
        
        return {
            "rule": "email_pattern",
            "applicable": True,
            "match_count": int(match_count),
            "match_percentage": float((match_count / len(non_null) * 100) if len(non_null) > 0 else 0)
        }
    
    @staticmethod
    def phone_pattern_check(series: pd.Series) -> Dict[str, Any]:
        """Check if values match phone number pattern"""
        if series.dtype != 'object':
            return {"rule": "phone_pattern", "applicable": False}
        
        phone_pattern = r'^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$'
        non_null = series.dropna()
        
        if len(non_null) == 0:
            return {"rule": "phone_pattern", "applicable": False}
        
        matches = non_null.astype(str).str.match(phone_pattern)
        match_count = matches.sum()
        
        return {
            "rule": "phone_pattern",
            "applicable": True,
            "match_count": int(match_count),
            "match_percentage": float((match_count / len(non_null) * 100) if len(non_null) > 0 else 0)
        }
    
    @staticmethod
    def date_pattern_check(series: pd.Series) -> Dict[str, Any]:
        """Check if values match date patterns"""
        non_null = series.dropna()
        
        if len(non_null) == 0:
            return {"rule": "date_pattern", "applicable": False}
        
        # Try to parse as datetime
        try:
            parsed = pd.to_datetime(non_null, errors='coerce')
            valid_dates = parsed.notna().sum()
            
            return {
                "rule": "date_pattern",
                "applicable": True,
                "valid_dates": int(valid_dates),
                "valid_percentage": float((valid_dates / len(non_null) * 100) if len(non_null) > 0 else 0)
            }
        except Exception:
            return {"rule": "date_pattern", "applicable": False}
    
    @staticmethod
    def numeric_range_check(series: pd.Series, min_val: float = None, max_val: float = None) -> Dict[str, Any]:
        """Check if numeric values are within expected range"""
        if not pd.api.types.is_numeric_dtype(series):
            return {"rule": "numeric_range", "applicable": False}
        
        non_null = series.dropna()
        if len(non_null) == 0:
            return {"rule": "numeric_range", "applicable": False}
        
        issues = []
        if min_val is not None:
            below_min = (non_null < min_val).sum()
            if below_min > 0:
                issues.append(f"{below_min} values below minimum {min_val}")
        
        if max_val is not None:
            above_max = (non_null > max_val).sum()
            if above_max > 0:
                issues.append(f"{above_max} values above maximum {max_val}")
        
        return {
            "rule": "numeric_range",
            "applicable": True,
            "issues": issues,
            "in_range": len(issues) == 0
        }
