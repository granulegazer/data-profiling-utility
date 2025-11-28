# Data Profiling Rules Table

| Rule-Id | Rule Level | Output Granularity | Rule / Sub-Rule | Detailed Description | Pseudocode |
|--------|------------|---------------------|------------------|----------------------|------------|
| D1 | Dataset | Dataset | Row Count | Count total number of rows in the dataset. | rows = len(df) |
| D2 | Dataset | Dataset | Column Count | Count total number of columns in the dataset. | cols = len(df.columns) |
| D3 | Dataset | Dataset | Duplicate Row Count | Count number of duplicate rows. | dup_count = df.duplicated().sum() |
| D4 | Dataset | Dataset | Candidate Key Detection | Find columns (single and column pairs (composite)) that uniquely identify rows. | For each col: check uniqueness & nulls. For each col pair: check combined uniqueness & nulls. |
| D4.1 | Dataset | Column | Single-Column Key Analysis | Analyze each column for uniqueness and nulls. | uniqueness = df[col].nunique() / len(df); is_pk = (nulls==0) & (uniqueness==100) |
| D4.2 | Dataset | Group | 2-Column Composite Key Analysis | Analyze all pairs of columns for combined uniqueness and nulls. | uniqueness = df[[col1,col2]].dropna().drop_duplicates().shape[0] / len(df); is_pk = (no nulls) & (uniqueness==100) |
| D5 | Dataset | Dataset | PII Risk Score | Assess risk of PII by checking columns with PII patterns and aggregating risks. | risk = sum(detect_pii(df[col]) for col in df.columns) |
| D5.1 | Dataset | Column | Count of PII Columns | Count columns matching PII regex patterns. | count = sum(detect_pii(df[col]) > threshold) |
| D5.2 | Dataset | Dataset | Aggregated Risk Score | Aggregate risk score from the thresholds. | score = config['pii_risk_scores'][risk_level] |
| D6 | Dataset | Group | Referential Integrity | Check referential integrity between columns. | Not implemented |
| C1 | Column | Column | Data Type Detection | Infer data type of column (numeric, string, date, etc.). | dtype = infer_type(df[col]) |
| C2 | Column | Column | Null Count | Count number of null values in column. | nulls = df[col].isnull().sum() |
| C3 | Column | Column | Distinct Value Count | Count number of unique values in column. | distinct = df[col].nunique() |
| C4 | Column | Value | Most Frequent Value | Find the most frequent value in column. | freq = df[col].mode()[0] |
| C5 | Column | Value | Value Distribution | Show frequency distribution of values. | ... |
| C5.1 | Column | Group | Top N Frequent Values | List top N most frequent values. | top_n = df[col].value_counts().head(N) |
| C5.2 | Column | Group | Bottom N Frequent Values | List bottom N least frequent values. | bottom_n = df[col].value_counts().tail(N) |
| C5.3 | Column | Column | Cardinality | Count number of unique values (cardinality). | cardinality = df[col].nunique() |
| C5.4 | Column | Value | Mode | Find the mode (most frequent value). | mode = df[col].mode()[0] |
| C5.5 | Column | Column | Skewness | Calculate skewness of value distribution. | skewness = df[col].skew() |
| C5.6 | Column | Column | Kurtosis | Calculate kurtosis of value distribution. | kurtosis = df[col].kurt() |
| C5.7 | Column | Group | Histogram | Show histogram for numeric/date columns. | hist = df[col].hist() |
| C6 | Column | Column | Quality Grade | Assign Gold/Silver/Bronze grade based on null rate and distinctness. | ... |
| C6.1 | Column | Column | Null Rate Calculation | Calculate percentage of nulls in column. | null_rate = nulls / len(df) |
| C6.2 | Column | Column | Distinctness Calculation | Calculate distinct ratio. | distinctness = distinct / len(df) |
| C6.3 | Column | Column | Grade Assignment | Assign grade using config thresholds. | if score >= gold: ... |
| C7 | Column | Column | Type Consistency | Measure consistency of inferred data type across rows. | consistency = ... |
| C7.1 | Column | Column | Type Consistency Rate | Measure percentage of values matching inferred data type. | consistency = valid / len(df) |
| C8 | Column | Column | Numeric Statistics | For numeric columns, output a summary table at the column level. | summary = df[col].describe() |
| C8.1 | Column | Column | Mean | Calculate mean value. | mean = df[col].mean() |
| C8.2 | Column | Column | Median | Calculate median value. | median = df[col].median() |
| C8.3 | Column | Column | Min | Find minimum value. | min = df[col].min() |
| C8.4 | Column | Column | Max | Find maximum value. | max = df[col].max() |
| C8.5 | Column | Column | Standard Deviation | Calculate standard deviation. | std = df[col].std() |
| C8.6 | Column | Column | Variance | Calculate variance. | variance = df[col].var() |
| C8.7 | Column | Column | Percentiles | Calculate percentiles. | percentiles = df[col].quantile([0.25,0.5,0.75]) |
| C8.8 | Column | Group | Outlier Detection | Detect outliers using IQR or Z-score. | outliers = ... |
| C8.9 | Column | Group | Histogram Bins | Show histogram bins for numeric columns. | hist = df[col].hist() |
| C9 | Column | Column | String Statistics | Compute min/max/avg string length, character set, pattern frequency for string columns. | ... |
| C9.1 | Column | Column | Min Length | Find minimum string length. | min_len = df[col].str.len().min() |
| C9.2 | Column | Column | Max Length | Find maximum string length. | max_len = df[col].str.len().max() |
| C9.3 | Column | Column | Average Length | Calculate average string length. | avg_len = df[col].str.len().mean() |
| C9.4 | Column | Group | Character Set | List unique characters in column. | charset = set("".join(df[col].dropna().astype(str))) |
| C9.5 | Column | Group | Pattern Frequency | Count frequency of regex patterns in strings. | pattern_freq = ... |
| C10 | Column | Column | Date Statistics | Compute min/max date, date range, format consistency for date columns. | ... |
| C10.1 | Column | Column | Min Date | Find earliest date. | min_date = df[col].min() |
| C10.2 | Column | Column | Max Date | Find latest date. | max_date = df[col].max() |
| C10.3 | Column | Column | Date Range | Calculate range between min and max date. | date_range = max_date - min_date |
| C10.4 | Column | Column | Format Consistency | Check consistency of date formats. | ... |
| C11 | Column | Column | PII Detection | Detect PII using regex patterns and column name. | matches = df[col].str.match(pattern) |
| C11.1 | Column | Value | Regex Pattern Match | Match values against PII regex patterns. | matches = df[col].str.match(pattern) |
| C11.2 | Column | Column | Column Name Hint | Check column name for PII hints. | if 'email' in col.lower(): ... |
| C11.3 | Column | Column | Confidence Score | Calculate confidence score for PII detection. | score = ... |
| C11.4 | Column | Group | Sample Matches | Show sample values matching PII patterns. | samples = matches.head(5) |