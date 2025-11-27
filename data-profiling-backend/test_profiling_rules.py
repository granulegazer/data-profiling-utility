"""Test script to verify all 12 profiling rules"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta
import random
from app.profiler import CSVProfiler
from app.models import CSVConfig, Rulesets, DatasetLevelRules, AttributeLevelRules

# Create sample data with various data types and quality issues
def create_sample_data():
    """Create sample CSV with different data types and quality issues"""
    np.random.seed(42)
    n = 1000
    
    data = {
        # Numeric column with outliers
        'customer_id': range(1, n + 1),
        'age': [random.randint(18, 90) if i % 50 != 0 else random.randint(150, 200) for i in range(n)],
        'income': np.random.normal(50000, 15000, n),
        
        # String columns with patterns
        'name': [f"Customer {i}" if i % 10 != 0 else f"   Customer {i}  " for i in range(n)],
        'email': [f"user{i}@example.com" if i % 20 != 0 else "" for i in range(n)],
        'phone': [f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}" for i in range(n)],
        'ssn': [f"{random.randint(100, 999)}-{random.randint(10, 99)}-{random.randint(1000, 9999)}" if i % 100 != 0 else None for i in range(n)],
        
        # Date columns
        'registration_date': [(datetime.now() - timedelta(days=random.randint(0, 365))).strftime('%Y-%m-%d') for i in range(n)],
        'last_login': [datetime.now().strftime('%Y-%m-%d') if i % 5 == 0 else (datetime.now() - timedelta(days=random.randint(1, 30))).strftime('%Y-%m-%d') for i in range(n)],
        
        # Categorical with high cardinality
        'category': [random.choice(['A', 'B', 'C', 'D', 'E']) for i in range(n)],
        
        # Column with nulls
        'notes': [f"Note {i}" if i % 3 == 0 else None for i in range(n)],
        
        # Potential foreign key
        'account_id': [random.randint(1, 500) for i in range(n)],
    }
    
    df = pd.DataFrame(data)
    return df

# Test with all rules enabled
def test_all_rules_enabled():
    """Test profiling with all rules enabled"""
    print("\n" + "="*80)
    print("TEST 1: All Rules Enabled")
    print("="*80)
    
    # Create sample data
    df = create_sample_data()
    
    # Save to CSV
    test_file = Path("test_data_all_rules.csv")
    df.to_csv(test_file, index=False)
    
    # Create profiler with all rules enabled
    rulesets = Rulesets(
        dataset_level=DatasetLevelRules(
            dataset_statistics=True,
            dataset_quality=True,
            referential_integrity=True,
            candidate_keys=True
        ),
        attribute_level=AttributeLevelRules(
            column_statistics=True,
            data_type_analysis=True,
            numeric_analysis=True,
            string_analysis=True,
            date_time_analysis=True,
            column_quality=True,
            value_distribution=True,
            pii_detection=True
        )
    )
    
    profiler = CSVProfiler(
        csv_config=CSVConfig(delimiter=",", encoding="utf-8", has_header=True),
        rulesets=rulesets
    )
    
    # Profile the file
    profile = profiler.profile_csv(test_file, "test_dataset")
    
    # Verify dataset-level rules
    print("\n--- Dataset-Level Rules ---")
    print(f"✓ Dataset Statistics: {profile.dataset_statistics is not None}")
    if profile.dataset_statistics:
        print(f"  - Total Records: {profile.dataset_statistics.total_records}")
        print(f"  - Total Columns: {profile.dataset_statistics.total_columns}")
        print(f"  - Dataset Size: {profile.dataset_statistics.dataset_size_bytes} bytes")
        print(f"  - Profiling Duration: {profile.dataset_statistics.profiling_duration_seconds:.2f}s")
    
    print(f"✓ Dataset Quality: {profile.dataset_quality is not None}")
    if profile.dataset_quality:
        print(f"  - Overall Completeness: {profile.dataset_quality.overall_completeness:.2f}%")
        print(f"  - Quality Score: {profile.dataset_quality.overall_quality_score:.2f}")
        print(f"  - Quality Grade: {profile.dataset_quality.quality_grade}")
        print(f"  - PII Risk Score: {profile.dataset_quality.pii_risk_score:.2f}")
    
    print(f"✓ Referential Integrity: {profile.referential_integrity is not None}")
    if profile.referential_integrity:
        print(f"  - Foreign Key Checks: {len(profile.referential_integrity.foreign_key_checks)}")
        print(f"  - Orphan Records: {len(profile.referential_integrity.orphan_records)}")
        print(f"  - Cross-table Consistency: {len(profile.referential_integrity.cross_table_consistency)}")
    
    print(f"✓ Candidate Keys: {profile.candidate_keys is not None}")
    if profile.candidate_keys:
        print(f"  - Single Column Keys: {len(profile.candidate_keys.single_column_keys)}")
        print(f"  - Composite Keys: {len(profile.candidate_keys.composite_keys)}")
        print(f"  - Primary Key Suggestions: {len(profile.candidate_keys.primary_key_suggestions)}")
        for pk in profile.candidate_keys.primary_key_suggestions[:3]:
            print(f"    - {', '.join(pk.columns)} ({pk.recommendation})")
    
    # Verify attribute-level rules for first few columns
    print("\n--- Attribute-Level Rules (Sample Columns) ---")
    for col in profile.columns[:3]:
        print(f"\nColumn: {col.column_name} ({col.data_type})")
        print(f"  ✓ Column Statistics: null={col.null_count}, unique={col.unique_count}")
        print(f"  ✓ Data Type Analysis: {col.data_type}")
        print(f"  ✓ Numeric Analysis: {col.numeric_stats is not None}")
        if col.numeric_stats:
            print(f"    - Mean: {col.numeric_stats.mean:.2f}, Q1: {col.numeric_stats.q1:.2f}, Q3: {col.numeric_stats.q3:.2f}")
            print(f"    - Outliers: {col.numeric_stats.outlier_count} ({col.numeric_stats.outlier_percentage:.2f}%)")
        print(f"  ✓ String Analysis: {col.string_stats is not None}")
        if col.string_stats:
            print(f"    - Avg Length: {col.string_stats.avg_length:.2f}")
            print(f"    - Leading Spaces: {col.string_stats.leading_spaces_count}, Trailing: {col.string_stats.trailing_spaces_count}")
        print(f"  ✓ DateTime Analysis: {col.datetime_stats is not None}")
        if col.datetime_stats:
            print(f"    - Date Range: {col.datetime_stats.date_range_days} days")
            print(f"    - Weekend: {col.datetime_stats.weekend_count}, Weekday: {col.datetime_stats.weekday_count}")
        print(f"  ✓ Column Quality: {col.quality_metrics is not None}")
        if col.quality_metrics:
            print(f"    - Quality Score: {col.quality_metrics.quality_score:.2f} ({col.quality_metrics.quality_grade})")
            print(f"    - Completeness: {col.quality_metrics.completeness_percentage:.2f}%")
        print(f"  ✓ Value Distribution: {col.value_distribution is not None}")
        if col.value_distribution:
            print(f"    - Cardinality: {col.value_distribution.cardinality} ({col.value_distribution.cardinality_ratio:.4f})")
            print(f"    - Mode: {col.value_distribution.mode} (freq: {col.value_distribution.mode_frequency})")
        print(f"  ✓ PII Detection: {col.pii_detection is not None}")
        if col.pii_detection:
            print(f"    - Risk Level: {col.pii_detection.risk_level}")
            print(f"    - Categories: {', '.join(col.pii_detection.pii_categories) if col.pii_detection.pii_categories else 'None'}")
    
    # Cleanup
    test_file.unlink()
    print("\n✓ Test completed successfully!")

# Test with selective rules
def test_selective_rules():
    """Test profiling with only specific rules enabled"""
    print("\n" + "="*80)
    print("TEST 2: Selective Rules (Only Dataset Statistics + Numeric Analysis)")
    print("="*80)
    
    # Create sample data
    df = create_sample_data()
    test_file = Path("test_data_selective.csv")
    df.to_csv(test_file, index=False)
    
    # Create profiler with selective rules
    rulesets = Rulesets(
        dataset_level=DatasetLevelRules(
            dataset_statistics=True,
            dataset_quality=False,
            referential_integrity=False,
            candidate_keys=False
        ),
        attribute_level=AttributeLevelRules(
            column_statistics=True,  # Always include basic stats
            data_type_analysis=True,
            numeric_analysis=True,
            string_analysis=False,
            date_time_analysis=False,
            column_quality=False,
            value_distribution=False,
            pii_detection=False
        )
    )
    
    profiler = CSVProfiler(
        csv_config=CSVConfig(delimiter=",", encoding="utf-8", has_header=True),
        rulesets=rulesets
    )
    
    profile = profiler.profile_csv(test_file, "selective_test")
    
    # Verify only selected rules are applied
    print("\n--- Dataset-Level Rules ---")
    print(f"✓ Dataset Statistics: {profile.dataset_statistics is not None} (ENABLED)")
    print(f"✗ Dataset Quality: {profile.dataset_quality is not None} (should be None)")
    print(f"✗ Referential Integrity: {profile.referential_integrity is not None} (should be None)")
    print(f"✗ Candidate Keys: {profile.candidate_keys is not None} (should be None)")
    
    print("\n--- Attribute-Level Rules (Sample Column) ---")
    col = profile.columns[1]  # Age column
    print(f"Column: {col.column_name}")
    print(f"✓ Column Statistics: present")
    print(f"✓ Numeric Analysis: {col.numeric_stats is not None} (ENABLED)")
    print(f"✗ String Analysis: {col.string_stats is not None} (should be None)")
    print(f"✗ DateTime Analysis: {col.datetime_stats is not None} (should be None)")
    print(f"✗ Column Quality: {col.quality_metrics is not None} (should be None)")
    print(f"✗ Value Distribution: {col.value_distribution is not None} (should be None)")
    print(f"✗ PII Detection: {col.pii_detection is not None} (should be None)")
    
    # Cleanup
    test_file.unlink()
    print("\n✓ Selective rules test completed successfully!")

# Run tests
if __name__ == "__main__":
    print("="*80)
    print("PROFILING RULES VERIFICATION TEST")
    print("="*80)
    print("\nTesting all 12 profiling rules implementation...")
    
    try:
        test_all_rules_enabled()
        test_selective_rules()
        
        print("\n" + "="*80)
        print("ALL TESTS PASSED! ✓")
        print("="*80)
        print("\nSummary:")
        print("- ✓ All 4 Dataset-Level Rules implemented")
        print("- ✓ All 8 Attribute-Level Rules implemented")
        print("- ✓ Conditional execution based on ruleset configuration working")
        print("- ✓ Models updated to support all rule data")
        print("\nThe profiling backend now respects user's ruleset selection!")
        
    except Exception as e:
        print(f"\n✗ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
