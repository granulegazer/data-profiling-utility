# Data Profiling Rules Table

| Rule-Id | Rule Level | Output Granularity | Rule / Sub-Rule | Detailed Description | Pseudocode |
|--------|------------|---------------------|------------------|----------------------|------------|
| D1 | Dataset | Dataset | Row Count | Count total number of rows in the dataset. | rows = len(df) |
| D2 | Dataset | Dataset | Column Count | Count total number of columns in the dataset. | cols = len(df.columns) |
| D3 | Dataset | Dataset | Duplicate Row Count | Count number of duplicate rows. | dup_count = df.duplicated().sum() |
| D4 | Dataset | Dataset | Candidate Key Detection | Flag single columns and column pairs as candidate keys only when non-null coverage is 100% and uniqueness ratio is 1.0 across those rows. | For each col and each (col1,col2): if df[[...]].isnull().any(): not key; else is_key = df[[...]].nunique()/len(df) == 1.0 |
| D4.1 | Dataset | Column | Single-Column Key Analysis | Treat a column as a candidate key if it has zero nulls and nunique equals row count. | is_pk = (df[col].isnull().sum() == 0) and (df[col].nunique(dropna=False) == len(df)) |
| D4.2 | Dataset | Group | 2-Column Composite Key Analysis | Treat a column pair as a candidate key if no nulls in either column and combined nunique equals row count. | pair = df[[c1,c2]]; is_pk = (pair.isnull().any(axis=1).sum()==0) and (pair.drop_duplicates().shape[0] == len(df)) |
| D5 | Dataset | Dataset | PII Risk Score | Compute per-column PII confidence (0–1) from regex matches + column-name hints; dataset risk is the max column score. | col_score = 0.7*match_rate + 0.3*name_hint; dataset_score = col_scores.max() |
| D5.1 | Dataset | Column | Count of PII Columns | Count columns whose PII confidence exceeds 0.2 (>=20% match rate or strong name hint). | count = sum(col_score > 0.2 for col_score in col_scores) |
| D5.2 | Dataset | Dataset | Aggregated Risk Score | Bucket dataset PII risk: Low <0.2, Medium 0.2–0.5, High >0.5 using the max column score. | risk_level = 'Low' if score<0.2 else 'Medium' if score<=0.5 else 'High' |
| D6 | Dataset | Group | Referential Integrity | For each declared FK pair (child_col, parent_col), ensure every non-null child value exists in parent. Report missing and match rate. | missing = child.dropna()[~child.isin(parent)].count(); match_rate = 1 - missing/len(child.dropna()) |
| C1 | Column | Column | Data Type Detection | Infer data type of column (numeric, string, date, etc.). | dtype = infer_type(df[col]) |
| C2 | Column | Column | Null Count | Count number of null values in column. | nulls = df[col].isnull().sum() |
| C3 | Column | Column | Distinct Value Count | Count number of unique values in column. | distinct = df[col].nunique() |
| C4 | Column | Value | Most Frequent Value | Find the most frequent value in column. | freq = df[col].mode()[0] |
| C5 | Column | Value | Value Distribution | Frequency distribution over non-null values; defaults to top 20 bins/categories. | dist = df[col].dropna().value_counts(dropna=False).head(20) |
| C5.1 | Column | Group | Top N Frequent Values | List top N (default 10) frequent values, excluding nulls; ties are truncated after N. | top_n = df[col].dropna().value_counts().head(N) |
| C5.2 | Column | Group | Bottom N Frequent Values | List bottom N (default 10) non-null values; if more than N share the same lowest freq, return first N by sort order. | bottom_n = df[col].dropna().value_counts(ascending=True).head(N) |
| C5.3 | Column | Column | Cardinality | Count number of unique values (cardinality). | cardinality = df[col].nunique() |
| C5.4 | Column | Value | Mode | Find the mode (most frequent value). | mode = df[col].mode()[0] |
| C5.5 | Column | Column | Skewness | Calculate skewness of value distribution. | skewness = df[col].skew() |
| C5.6 | Column | Column | Kurtosis | Calculate kurtosis of value distribution. | kurtosis = df[col].kurt() |
| C5.7 | Column | Group | Histogram | Histogram for numeric/date columns using 20 bins (Freedman–Diaconis if available), excluding nulls. | hist = df[col].dropna().hist(bins=20) |
| C6 | Column | Column | Quality Grade | Grade per column: Gold, Silver, Bronze using null rate and distinctness thresholds. | grade = gold/silver/bronze based on C6.1–C6.3 |
| C6.1 | Column | Column | Null Rate Calculation | Percent of nulls over total rows (nulls/len(df)); nulls are NA/None/NaT. | null_rate = df[col].isnull().mean() |
| C6.2 | Column | Column | Distinctness Calculation | Distinctness ratio over total rows, counting null as a value. | distinctness = df[col].nunique(dropna=False) / len(df) |
| C6.3 | Column | Column | Grade Assignment | Gold: null_rate<=0.01 and 0.05<=distinctness<=0.95; Silver: null_rate<=0.05 and 0.02<=distinctness<=0.98; else Bronze. | grade = ... |
| C7 | Column | Column | Type Consistency | Infer dominant type, coerce values, and measure how many non-null rows conform. | consistency_rate = valid / non_null |
| C7.1 | Column | Column | Type Consistency Rate | Canonical type = majority after coercion; consistency excludes nulls and failed coercions. | canonical = infer_type(df[col]); valid = coerced.notnull().sum(); rate = valid/df[col].notnull().sum() |
| C8 | Column | Column | Numeric Statistics | For numeric columns, output a summary table at the column level. | summary = df[col].describe() |
| C8.1 | Column | Column | Mean | Calculate mean value. | mean = df[col].mean() |
| C8.2 | Column | Column | Median | Calculate median value. | median = df[col].median() |
| C8.3 | Column | Column | Min | Find minimum value. | min = df[col].min() |
| C8.4 | Column | Column | Max | Find maximum value. | max = df[col].max() |
| C8.5 | Column | Column | Standard Deviation | Calculate standard deviation. | std = df[col].std() |
| C8.6 | Column | Column | Variance | Calculate variance. | variance = df[col].var() |
| C8.7 | Column | Column | Percentiles | Calculate percentiles. | percentiles = df[col].quantile([0.25,0.5,0.75]) |
| C8.8 | Column | Group | Outlier Detection | Use IQR (1.5*IQR fences) by default; if IQR==0, use |z|>3. Report count and indices. | iqr = q3-q1; lower=q1-1.5*iqr; upper=q3+1.5*iqr; outliers = df[col][(col<lower)|(col>upper)] |
| C8.9 | Column | Group | Histogram Bins | Numeric histogram with 20 bins; align with C5.7 binning. | hist = df[col].dropna().hist(bins=20) |
| C9 | Column | Column | String Statistics | Convert values to string (excluding null), compute length stats, charset, and regex pattern frequencies. | series = df[col].dropna().astype(str); ... |
| C9.1 | Column | Column | Min Length | Find minimum string length. | min_len = df[col].str.len().min() |
| C9.2 | Column | Column | Max Length | Find maximum string length. | max_len = df[col].str.len().max() |
| C9.3 | Column | Column | Average Length | Calculate average string length. | avg_len = df[col].str.len().mean() |
| C9.4 | Column | Group | Character Set | List unique characters in column. | charset = set("".join(df[col].dropna().astype(str))) |
| C9.5 | Column | Group | Pattern Frequency | Count matches for a configured regex list; full-string match unless pattern uses wildcards. | pattern_freq = {p: series.str.contains(p, regex=True).mean()} |
| C10 | Column | Column | Date Statistics | Parse with pandas to_datetime (errors='coerce'); compute min/max/range over parsed dates only. | parsed = pd.to_datetime(df[col], errors='coerce'); ... |
| C10.1 | Column | Column | Min Date | Find earliest date. | min_date = df[col].min() |
| C10.2 | Column | Column | Max Date | Find latest date. | max_date = df[col].max() |
| C10.3 | Column | Column | Date Range | Calculate range between min and max date. | date_range = max_date - min_date |
| C10.4 | Column | Column | Format Consistency | Share of non-null values that parse successfully; flag if <95%. | consistency = parsed.notnull().sum() / df[col].notnull().sum() |
| C11 | Column | Column | PII Detection | Detect PII via regex `str.contains` (case-insensitive) plus column-name hints; report confidence 0–1. | match_rate = df[col].astype(str).str.contains(patterns, regex=True, case=False, na=False).mean() |
| C11.1 | Column | Value | Regex Pattern Match | Treat as match if any configured PII regex appears as substring. | match = bool(re.search(pattern, str(value))) |
| C11.2 | Column | Column | Column Name Hint | Name hint score = 0.3 if column name contains PII keywords (email, phone, ssn, etc.). | name_hint = 0.3 if any(k in col.lower() for k in keywords) else 0 |
| C11.3 | Column | Column | Confidence Score | Confidence = 0.7*match_rate + name_hint; cap at 1.0. | score = min(1.0, 0.7*match_rate + name_hint) |
| C11.4 | Column | Group | Sample Matches | Show up to 5 sample values that matched regex. | samples = df[col][df[col].astype(str).str.contains(patterns, regex=True, na=False)].head(5) |
