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
   - Support for cloud storage (S3, Azure Blob, GCS)
   - Batch and streaming data ingestion

2. **Relational Databases**
   - Oracle Database
   - PostgreSQL
   - Support for JDBC/ODBC connections
   - Query-based data extraction

3. **Flat Files**
   - CSV, TSV, TXT
   - Parquet, Avro, ORC
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
- **Entity Selection**: Accept list of entities (tables/files/datasets) as input
  - Single or multiple entity profiling in one job
  - Bulk entity import via CSV/JSON
  - Pattern-based entity selection (e.g., all tables matching "CUSTOMER_*")
  - Schema-level profiling (all entities within a schema)

### 2. Profiling Rules

#### Generic Enterprise Rules (OEDQ/IDQ Compatible)
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

4. **PII Detection**
   - Identify personally identifiable information
   - Email, phone number, SSN pattern detection
   - GDPR compliance checks

5. **Custom Thresholds**
   - User-defined acceptable ranges
   - Configurable warning/error thresholds
   - Business KPI validation

### 3. Big Data Processing
- **Distributed Processing**: Support for parallel processing of large datasets
- **Sampling Strategy**: Intelligent sampling for initial analysis with full scan option
- **Memory Management**: Stream processing to handle datasets larger than available RAM
- **Performance Optimization**: Columnar processing, lazy evaluation, query optimization

### 4. Output Storage
- **Metadata Database (PostgreSQL)**:
  - Job execution metadata (job ID, timestamps, status, parameters)
  - Entity metadata (source, entity name, row counts)
  - Connection configurations (encrypted credentials)
  - User preferences and settings
- **Profiling Results Storage**:
  - JSON format stored in S3-compatible object storage or filesystem
  - Hierarchical structure: `{job_id}/{entity_name}/profile_results.json`
  - Summary statistics stored in PostgreSQL for quick queries
  - Detailed results (distributions, patterns) in JSON files
  - Retention policy: configurable (default 90 days)
- **Storage Schema**:
  ```
  Job:
    - job_id, created_at, started_at, completed_at, status, source_type
    - entities_list, total_entities, completed_entities
    - estimated_completion_time, progress_percentage
  Entity_Profile:
    - profile_id, job_id, entity_name, row_count, column_count
    - status, started_at, completed_at, profiled_at
    - rows_processed, processing_speed_rows_per_sec
  Column_Statistics:
    - stat_id, profile_id, column_name, data_type, null_pct, unique_count, etc.
  Profile_Results_Path:
    - profile_id, json_storage_path, file_size
  ```

### 5. Results Viewing & Reporting
- **Profile Summary Dashboard**:
  - Job-level overview: all entities profiled in a job
  - Entity-level summary cards with key metrics
  - Data quality score indicators
  - Filterable entity list (by name, row count, quality score)
- **Detailed Entity View**:
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

### 6. User Interface Features
- **Source & Entity Configuration**:
  - Add/edit/test data source connections
  - Browse available entities (tables, files, datasets)
  - Multi-select entities for profiling
  - Save entity selection as templates
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
- Process datasets with 100M+ records
- Response time < 3 seconds for UI interactions
- API response time < 500ms for metadata operations
- Support concurrent profiling jobs (minimum 10 simultaneous jobs)

### Scalability
- Horizontal scaling for backend services
- Support for distributed processing frameworks (optional: Dask, Ray, Spark)
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
- Database: PostgreSQL (metadata storage)
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
- Storage: S3-compatible object storage for reports

## Development Phases

### Phase 1: MVP (Minimum Viable Product)
- Basic React frontend with connection configuration
- FastAPI backend with REST endpoints
- Support for PostgreSQL and CSV files
- Core profiling rules (statistics, nulls, data types)
- Simple profile report display

### Phase 2: Enhanced Features
- Support for Oracle database and data lake APIs
- Additional profiling rules (patterns, distributions)
- Job history and result archival
- Export capabilities
- Improved UI/UX

### Phase 3: Advanced Capabilities
- Custom rule engine
- Big data optimizations (sampling, parallel processing)
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
- Successfully profile datasets with 100M+ records in under 10 minutes
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
