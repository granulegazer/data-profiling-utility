# Data Profiling Utility - Requirements Document

## Project Overview
A scalable data profiling tool designed to analyze large datasets from various sources including data lakes, databases, and flat files. The tool provides comprehensive data quality insights using both enterprise-standard profiling rules and custom validation logic.

## Architecture

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Purpose**: User interface for configuring profiling jobs, viewing results, and managing data sources

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **Purpose**: API server for orchestrating profiling jobs, data ingestion, and result aggregation

## Data Sources

### Supported Sources
1. **Data Lakes**
   - Access via REST API calls
   - **Configuration Requirements**:
     - Source: API endpoint/base URL
     - Domain: Selected from pre-defined domain list
     - XPath/Attribute Names: Specify data location within response
     - Entity List: List of entities to fetch via API calls
   - **Data Extraction**:
     - Pull entities one-by-one or in batch via REST API
     - Parse response using XPath (for XML) or attribute paths (for JSON)
     - Support for nested/hierarchical data structures
     - Handle pagination for large result sets
   - Batch and streaming data ingestion

2. **Relational Databases**
   - Oracle Database
   - PostgreSQL
   - Support for JDBC/ODBC connections
   - Query-based data extraction

3. **Flat Files**
   - CSV, TSV, TXT
   - JSON, XML
   - Excel files (XLSX, XLS)

### Data Formats
- **Structured**: Relational database tables with defined schemas
- **Semi-Structured**: JSON, XML, nested data formats
- **Large-Scale**: Datasets ranging from millions to billions of records

## Functional Requirements

### 1. Data Ingestion
- Connect to multiple data sources simultaneously
- Support authentication mechanisms (OAuth, API keys, database credentials)
- Handle large datasets with streaming/chunked processing
- Implement connection pooling and retry logic
- Support on-demand profiling jobs
- **Dataset-Level Profiling**: Profile entire datasets (schemas, databases, file collections)
  - Dataset = collection of related entities (tables in a schema, files in a directory)
  - Profile all entities within the dataset
  - Generate dataset-level summary with entity breakdowns
- **Entity Filtering**: Optional entity list to filter which entities to include
  - Include/exclude specific entities from profiling
  - Pattern-based filtering (e.g., include only "CUSTOMER_*" tables)
  - Bulk filter specification via CSV/JSON
  - Default: profile all entities in the dataset if no filter provided
- **Database-Specific Profiling Options**:
  - **Table-Level Profiling**:
    - Profile entire table (all columns)
    - Profile selected columns only (column selection)
    - Specify columns via UI selection or column list
  - **Custom Query Profiling**:
    - Provide SQL query instead of table name
    - Profile the result set of the query
    - Query validation before execution
    - Support for complex queries (JOINs, WHERE clauses, CTEs)
    - Treat query result as a virtual entity for profiling
- **Data Lake-Specific Profiling Options**:
  - **API Configuration**:
    - Source: API endpoint URL
    - Domain: Select from pre-defined domain list (dropdown/autocomplete)
    - XPath expressions for XML responses
    - Attribute paths for JSON responses (e.g., `data.customers[*].profile`)
  - **Entity Retrieval**:
    - Entity list specifies which entities to fetch via API
    - API call per entity or batch API calls
    - Dynamic URL construction using entity names
    - Authentication token/API key management
  - **Response Parsing**:
    - Extract data using XPath or JSON path expressions
    - Flatten nested structures for profiling
    - Handle array/list data within responses

### 2. Profiling Rules

#### Generic Enterprise Rules
1. **Column Statistics**
   - Record count
   - Null count and null percentage
   - Unique value count
   - Distinct value count
   - Duplicate count

2. **Data Type Analysis**
   - Inferred data types
   - Type consistency validation
   - Format pattern detection
   - Data type mismatches

3. **Numeric Analysis**
   - Min, max, mean, median
   - Standard deviation, variance
   - Quartiles and percentiles
   - Outlier detection

4. **String Analysis**
   - Min/max/average length
   - Pattern frequency analysis
   - Character set analysis
   - Leading/trailing spaces detection

5. **Date/Time Analysis**
   - Date range (min/max)
   - Date format patterns
   - Timezone detection
   - Invalid date detection

6. **Data Quality Metrics**
   - Completeness (% of populated fields)
   - Validity (% conforming to expected patterns)
   - Consistency (cross-column validation)
   - Accuracy indicators
   - **Data Quality Grade**: Classification based on overall score
     - **Gold**: High quality (>= 90% quality score)
     - **Silver**: Medium quality (70-89% quality score)
     - **Bronze**: Low quality (< 70% quality score)

7. **Value Distribution**
   - Frequency distribution
   - Top N most common values
   - Value histogram generation
   - Cardinality analysis

8. **Referential Integrity**
   - Foreign key validation
   - Orphan record detection
   - Cross-table consistency checks

9. **Candidate Key Discovery**
   - Identify single-column candidate keys (columns with all unique values)
   - Suggest composite key combinations (multi-column uniqueness)
   - Calculate uniqueness percentage for potential keys
   - Detect near-unique columns (high cardinality)
   - Primary key suggestions based on non-null + unique criteria

10. **PII Detection**
   - Identify personally identifiable information
   - Email, phone number, SSN pattern detection
   - Credit card number detection
   - GDPR compliance checks
   - Sensitive data flagging

#### Custom Profiling Rules
1. **Business-Specific Validations**
   - Domain-specific value range checks
   - Custom regex pattern matching
   - Business rule validation (e.g., age constraints, valid email domains)

2. **Data Lineage Tracking**
   - Source-to-target mapping validation
   - Data transformation verification

3. **Anomaly Detection**
   - Statistical anomaly identification
   - Trend analysis over time
   - Sudden distribution changes

4. **Custom Thresholds**
   - User-defined acceptable ranges
   - Configurable warning/error thresholds
   - Business KPI validation

### 3. Output Storage
- **Oracle Database (Metadata Storage)**:
  - Job execution metadata (job ID, timestamps, status, parameters)
  - Dataset metadata (source, dataset name, entity counts)
  - Entity metadata (entity name, row counts, column counts)
  - Connection configurations (encrypted credentials)
  - User preferences and settings
  - File paths/references to profiling results stored in filesystem
- **Profiling Results Storage (Filesystem)**:
  - JSON format stored in filesystem or network storage
  - Hierarchical structure: `{job_id}/{dataset_name}/{entity_name}/`
  - **File Structure**:
    - `profile_summary.json` - Entity-level summary statistics
    - `column_statistics.json` - Structured column metrics
    - `value_distributions.json` - Value distribution data
    - `pattern_analysis.json` - Pattern detection results
    - `quality_metrics.json` - Data quality scores and details
  - Retention policy: configurable (default 90 days)
  - **Note**: Phase 2 will migrate results storage to Oracle database (CLOB/structured tables)
- **Storage Schema**:
  ```
  Profiling_Job:
    - job_id, created_at, started_at, completed_at, status
    - source_type, dataset_name, entity_filter_applied
    - total_entities, completed_entities, filtered_entities
    - estimated_completion_time, progress_percentage
  Dataset_Profile:
    - dataset_profile_id, job_id, dataset_name
    - total_entities, total_rows, total_columns, profiled_at
    - overall_quality_score, overall_quality_grade (GOLD/SILVER/BRONZE)
    - storage_size
  Entity_Profile_Summary:
    - entity_profile_id, dataset_profile_id, entity_name, entity_type
    - source_query (NULL for tables, SQL for custom queries, NULL for API)
    - selected_columns (NULL for all columns, comma-separated list for selection)
    - api_endpoint (NULL for DB, API URL for data lake entities)
    - domain_name (NULL for DB, domain value for data lake)
    - xpath_or_attribute_path (NULL for DB, path expression for data lake)
    - row_count, column_count, null_percentage, data_quality_score
    - data_quality_grade (GOLD/SILVER/BRONZE)
    - status, started_at, completed_at
    - rows_processed, processing_speed_rows_per_sec
  Profile_Results_File_Path:
    - path_id, entity_profile_id
    - base_directory_path
    - profile_summary_file_path
    - column_statistics_file_path
    - value_distributions_file_path
    - pattern_analysis_file_path
    - quality_metrics_file_path
    - total_file_size_bytes
  ```

### 4. Results Viewing & Reporting
- **Dataset Profile Dashboard**:
  - Dataset-level overview: aggregated metrics across all entities
  - Overall data quality score and grade (Gold/Silver/Bronze) for the dataset
  - Quality grade distribution chart (count of Gold/Silver/Bronze entities)
  - Total entities, rows, columns in the dataset
  - Distribution of data quality across entities
  - Trend indicators (if historical data available)
- **Entity Summary View**:
  - List of all entities within the profiled dataset
  - Entity-level summary cards with key metrics (row count, column count, quality score, quality grade)
  - Display entity type: table (full/partial columns) or custom query
  - Show source query for query-based profiles
  - Show selected columns for partial table profiles
  - **Quality Grade Badge**: Color-coded (Gold/Silver/Bronze) visual indicator
  - Filterable and sortable entity list (by name, size, quality score, quality grade, type)
  - Search entities within the dataset
  - Quick comparison between entities
- **Detailed Entity View** (drill-down from entity summary):
  - Column-level profiling results in tabular format
  - Expandable rows for detailed column statistics
  - Side-by-side column comparison
  - Drill-down into specific metrics
- **Visualizations**:
  - Value distribution histograms
  - Data quality metric gauges
  - Pattern frequency charts
  - Null percentage indicators
  - Candidate key relationship diagrams
- **Interactive Features**:
  - Sort and filter columns by any metric
  - Search within profiling results
  - Column grouping (by data type, quality score)
  - Expandable/collapsible sections
  - Copy/export individual column stats
- **Export Options**:
  - Full job report: JSON, CSV, Excel
  - Individual entity report: PDF, HTML
  - Custom report builder (select specific metrics)
  - API endpoint for programmatic access
- **Historical Comparison**:
  - Compare current vs previous profiling runs
  - Trend visualization over time
  - Change detection alerts
  - Historical data quality metrics
- **Result Retention & Management**:
  - List all historical profiling jobs
  - Search jobs by date, entity, source
  - Delete old profiling results
  - Archive/restore functionality

### 5. User Interface Features
- **Source & Dataset Configuration**:
  - Add/edit/test data source connections
  - Select dataset to profile (schema, database, directory)
  - Browse entities within the selected dataset
  - Optional entity filtering (include/exclude specific entities)
  - Save filter patterns as templates
- **Database Profiling Configuration**:
  - **For Tables**: Select all columns or choose specific columns to profile
  - **Custom Query Mode**: Enter SQL query for profiling instead of table selection
  - Query editor with syntax highlighting and validation
  - Preview query results before profiling
  - Save frequently used queries as templates
- **Data Lake Profiling Configuration**:
  - Input API source endpoint URL
  - Select domain from pre-defined domain dropdown list
  - Specify XPath expressions (for XML) or attribute paths (for JSON)
  - Provide entity list (manual entry, CSV import, or bulk paste)
  - Test API connection and response structure
  - Preview sample data extraction before profiling
  - Save API configurations as templates
- Profiling rule selection and customization
- **Job Execution Progress**:
  - Real-time progress indicators (percentage complete)
  - Granular status: entities queued/in-progress/completed/failed
  - Per-entity progress (rows processed/total rows)
  - Overall job progress bar with percentage
  - Estimated Time to Completion (ETC) calculation
  - Elapsed time display
  - Current entity being profiled
  - Processing speed metrics (rows/second)
  - Live log stream (optional, collapsible)
- Interactive result exploration
- Filter and search capabilities

## Non-Functional Requirements

### Performance
- Efficient processing of datasets
- Response time < 3 seconds for UI interactions
- API response time < 500ms for metadata operations
- Support concurrent profiling jobs (minimum 10 simultaneous jobs)

### Scalability
- Horizontal scaling for backend services
- Database connection pooling
- Caching for frequently accessed metadata

### Reliability
- Fault tolerance and error recovery
- Job resumption after failures
- Data validation before processing
- Comprehensive error logging

### Security
- Encrypted credential storage
- Role-based access control (RBAC)
- API authentication and authorization
- Audit logging for all operations
- Secure data transmission (HTTPS/TLS)

### Maintainability
- Modular architecture
- Comprehensive API documentation
- Unit and integration tests (minimum 80% coverage)
- Logging and monitoring integration
- Configuration management

## Technology Stack

### Frontend
- React 18+
- Vite
- TypeScript
- UI Library: Material-UI or Ant Design
- State Management: Redux Toolkit or Zustand
- API Client: Axios or React Query
- Visualization: Recharts, D3.js, or Plotly

### Backend
- Python 3.9+
- FastAPI
- Async processing: asyncio
- Database: Oracle (metadata storage)
- Data Processing: Pandas, Polars, or Dask
- Database Connectors:
  - **PostgreSQL**: psycopg3 (official PostgreSQL driver with async support)
  - **Oracle**: oracledb (official Oracle driver, formerly cx_Oracle)
  - Direct SQL queries via native drivers for optimal performance

### Infrastructure
- Containerization: Docker
- Orchestration: Docker Compose (dev), Kubernetes (prod)
- Message Queue: Redis or RabbitMQ (for async jobs)
- Cache: Redis
- Storage: Oracle database (metadata), Filesystem (profiling results)

## Development Phases

### Phase 1: MVP (Minimum Viable Product)
#### Backend & Data Sources
- FastAPI backend with REST endpoints
- Support for Oracle and PostgreSQL datasets (schema-level profiling)
- Database connection management with credential encryption
- Entity filtering capabilities (include/exclude, pattern-based)
- Table-level profiling with column selection
- Custom query profiling support

#### Complete Generic Enterprise Profiling Rules
1. **Column Statistics**: Record count, null count/%, unique/distinct/duplicate counts
2. **Data Type Analysis**: Inferred types, type consistency, format patterns, mismatches
3. **Numeric Analysis**: Min, max, mean, median, std dev, variance, quartiles, percentiles, outliers
4. **String Analysis**: Min/max/avg length, pattern frequency, character sets, whitespace detection
5. **Date/Time Analysis**: Date range, format patterns, timezone detection, invalid dates
6. **Data Quality Metrics**: Completeness, validity, consistency, accuracy indicators
7. **Value Distribution**: Frequency distribution, top N values, histograms, cardinality
8. **Referential Integrity**: Foreign key validation, orphan records, cross-table checks
9. **Candidate Key Discovery**: Single-column keys, composite keys, uniqueness %, near-unique columns, PK suggestions
10. **PII Detection**: Email, phone, SSN, credit card patterns, GDPR compliance, sensitive data flagging

#### Frontend & Visualization
- React frontend with Vite and TypeScript
- **Dataset Configuration UI**: Connection setup, dataset selection, entity filtering
- **Dataset Profile Dashboard**:
  - Dataset-level overview with aggregated metrics
  - Overall data quality score
  - Total entities, rows, columns
  - Data quality distribution across entities
- **Entity Summary View**:
  - Entity list with summary cards (row count, column count, quality score)
  - Filterable and sortable by name, size, quality, type
  - Search and quick comparison
- **Detailed Entity/Attribute View**:
  - Column-level profiling results in tables
  - All 10 enterprise rules results displayed
  - Expandable rows for detailed statistics
- **Visualizations**:
  - Value distribution histograms
  - Data quality gauges/scorecards with grade badges (Gold/Silver/Bronze)
  - Quality grade distribution chart across entities
  - Pattern frequency charts
  - Null percentage indicators
  - Candidate key diagrams
  - Outlier visualization
  - Summary and detailed level charts

#### Progress Tracking
- Real-time job progress tracking with ETA
- Entity-level status (queued/in-progress/completed/failed)
- Processing speed metrics (rows/second)

#### Storage
- Oracle database for job/dataset/entity metadata
- Filesystem storage for profiling results (JSON files)
- File path references stored in Oracle

### Phase 2: Enhanced Features
- **Migrate profiling results storage from filesystem to Oracle database**
  - Structured data in Oracle tables (Column_Statistics, Data_Quality_Metrics)
  - Semi-structured data in CLOB columns (distributions, patterns, histograms)
  - Improved query performance and data integrity
- Support for data lake APIs (REST API, XPath/JSON path parsing)
- Flat file support (CSV, JSON, XML, Excel)
- Job history and result archival
- Export capabilities (JSON, CSV, Excel, PDF)
- Historical comparison (compare profiling runs)
- Improved UI/UX and performance optimization

### Phase 3: Advanced Capabilities
- Custom rule engine
- Advanced visualizations
- Alerting and notifications
- API for programmatic access

### Phase 4: Enterprise Features
- RBAC and multi-tenancy
- Historical trend analysis
- PII detection and data masking
- Integration with data catalogs
- Performance monitoring and optimization

## Success Criteria
- Successfully profile datasets efficiently
- Support all specified data sources and formats
- 99% uptime for production environments
- User satisfaction score > 4/5
- API response time within SLA
- Zero data leakage or security incidents

## Constraints & Assumptions
- Initial deployment on cloud infrastructure (AWS/Azure/GCP)
- Users have appropriate access credentials for data sources
- Network connectivity to all data sources
- Sufficient storage for intermediate processing and results
- Python and Node.js runtime environments available

## Future Considerations
- Machine learning-based anomaly detection
- Natural language query interface
- Data quality score prediction
- Integration with BI tools (Tableau, Power BI)
- Real-time streaming data profiling
- Data lineage visualization
- Automated data quality remediation suggestions
- Job scheduling capabilities (if needed)
