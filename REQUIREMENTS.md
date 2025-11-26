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

#### Profiling Rules by Level

##### **Dataset-Level Rules** (Applied to entire dataset)
1. **Dataset Statistics**
   - Total record count
   - Total column count
   - Dataset size (bytes/MB/GB)
   - Profiling timestamp and duration

2. **Dataset-Level Data Quality Metrics***
   - Overall completeness score (% of non-null values across all columns)
   - Overall data quality score (0-100)
   - Data quality grade (Gold/Silver/Bronze)
   - PII risk score

3. **Referential Integrity** (Cross-column analysis)
   - Foreign key validation
   - Orphan record detection
   - Cross-table consistency checks

4. **Candidate Key Discovery** (Cross-column analysis)
   - Identify single-column candidate keys (columns with all unique values)
   - Suggest composite key combinations (multi-column uniqueness)
   - Calculate uniqueness percentage for potential keys
   - Detect near-unique columns (high cardinality)
   - Primary key suggestions based on non-null + unique criteria

##### **Attribute-Level Rules** (Applied to individual columns)

1. **Column Statistics**
   - Record count (total rows)
   - Null count (number of null values)
   - Null percentage (% of null values)
   - Unique value count
   - Distinct value count
   - Duplicate count

2. **Data Type Analysis**
   - Inferred data types
   - Type consistency validation
   - Format pattern detection
   - Data type mismatches

3. **Numeric Analysis** (for numeric columns)
   - Minimum value (min)
   - Maximum value (max)
   - Mean (average)
   - Median (middle value)
   - Standard deviation
   - Variance
   - First quartile (Q1 - 25th percentile)
   - Third quartile (Q3 - 75th percentile)
   - Percentiles (configurable: 5th, 10th, 90th, 95th)
   - Outlier detection (values beyond IQR thresholds)
   - Number range validation

4. **String Analysis** (for text columns)
   - Minimum length
   - Maximum length
   - Average length
   - Pattern frequency analysis
   - Most common patterns (top N)
   - Character set analysis (alphanumeric, special chars, unicode)
   - Leading spaces detection
   - Trailing spaces detection
   - Empty string detection
   - Whitespace-only string detection

5. **Date/Time Analysis** (for date/timestamp columns)
   - Minimum date (earliest)
   - Maximum date (latest)
   - Date range span (duration)
   - Date format patterns (detected formats)
   - Timezone detection
   - Invalid date detection
   - Future date detection
   - Past date validation (e.g., beyond reasonable historical range)
   - Weekend/weekday distribution

6. **Column-Level Data Quality Metrics**
   - Completeness percentage (% of non-null values)
   - Validity percentage (% conforming to expected patterns)
   - Consistency score (pattern conformance)
   - Accuracy indicators
   - Conformity rate (% matching expected format/type)
   - Column quality score (0-100)
   - Quality grade (Gold/Silver/Bronze)

7. **Value Distribution**
   - Frequency distribution (count per value)
   - Top N most common values (configurable N)
   - Bottom N least common values
   - Value histogram bins
   - Cardinality (unique value count)
   - Cardinality ratio (unique/total)
   - Mode (most frequent value)
   - Mode frequency count
   - Skewness of distribution

8. **PII Detection** (per column)
   - Email address pattern detection
   - Phone number pattern detection
   - SSN (Social Security Number) pattern detection
   - Credit card number detection
   - IP address detection
   - Physical address detection
   - Names detection (first/last name patterns)
   - Date of birth detection
   - GDPR sensitive data categories
   - PII confidence score (0-100)
   - PII risk level (Low/Medium/High)
   - Sensitive data flags

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
    - `entity_summary.json` - Entity-level summary (dataset-level rules results)
    - `column_statistics.json` - Attribute-level metrics (all 8 attribute rules per column)
    - `value_distributions.json` - Value distribution data per column
    - `pattern_analysis.json` - Pattern detection results per column
    - `quality_metrics.json` - Quality scores (entity-level and column-level)
    - `referential_integrity.json` - Cross-table/column relationships
    - `candidate_keys.json` - Key discovery results
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
    - row_count, column_count, total_null_count, overall_null_percentage
    - overall_completeness_score, data_quality_score
    - data_quality_grade (GOLD/SILVER/BRONZE)
    - pii_risk_score, candidate_key_count
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

#### **View Hierarchy (Top to Bottom)**

**Level 1: Dataset Profile Dashboard** (Primary Summary View)
- **Dataset-Level Summary Cards** (displayed first/top):
  - 4 Key Metric Cards:
    - Total Entities profiled
    - Average Quality Score (aggregated across all entities)
    - Total Rows (sum of all entity row counts)
    - Total Columns (sum of all entity column counts)
  - Overall dataset quality grade badge (Gold/Silver/Bronze)
  - Dataset metadata: name, source type, profiling timestamp
  - Trend indicators (if historical data available)

- **Data Quality Visualizations**:
  - Quality Grade Distribution Chart (Pie/Donut/Bar)
    - Visual breakdown: count of Gold/Silver/Bronze entities
    - Percentage distribution
    - Color-coded segments matching grade colors
  - Entity Quality Scores Chart (Horizontal Bar or Column Chart)
    - Top entities by quality score
    - Sortable and interactive
  - Data quality trends over time (if multiple profiling runs exist)

- **Entity List Section** (below summary and charts):
  - List/Grid of all profiled entities
  - Entity cards/rows with key metrics
  - Search, filter, and sort capabilities

**Level 2: Entity Summary List** (within Dataset Dashboard)
- List of all entities within the profiled dataset
- Entity-level summary cards with key metrics (row count, column count, quality score, quality grade)
- Display entity type: table (full/partial columns) or custom query
- Show source query for query-based profiles
- Show selected columns for partial table profiles
- **Quality Grade Badge**: Color-coded (Gold/Silver/Bronze) visual indicator
- Filterable and sortable entity list (by name, size, quality score, quality grade, type)
- Search entities within the dataset
- Quick comparison between entities
- Click entity to drill down

**Level 3: Detailed Entity View** (drill-down from entity list)
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
  - **Connection Management**:
    - Load saved connections from configuration file (JSON/YAML)
    - Dropdown/selection list of available connections
    - Display connection metadata (name, type, host, last used)
    - Add new connection (opens form/modal)
    - Edit existing connection details
    - Delete connection from config
    - Test connection before use
    - Connection config file structure:
      ```json
      {
        "connections": [
          {
            "id": "conn_001",
            "name": "Production PostgreSQL",
            "type": "postgresql",
            "host": "prod-db.example.com",
            "port": 5432,
            "database": "main_db",
            "username": "profiler_user",
            "password_encrypted": "...",
            "last_used": "2025-11-24T10:30:00Z"
          }
        ]
      }
      ```
  - Select dataset to profile (schema, database, directory)
  - **Browse & Select Entities**:
    - **Option 1: Browse Tables** - Visual table browser with checkboxes to select specific tables
    - **Option 2: Custom Query** - Toggle to query mode to write custom SQL instead of selecting tables
    - Toggle between table selection and query mode
    - Multi-select tables from the dataset
    - Preview table metadata (row count, column count) before profiling
  - Optional entity filtering (include/exclude specific entities)
  - Save filter patterns as templates
- **Database Profiling Configuration**:
  - **For Selected Tables**: 
    - Profile all columns (default)
    - OR select specific columns to profile (column picker UI)
    - Display column metadata (data type, nullable)
  - **For Custom Query Mode**: 
    - SQL editor with syntax highlighting and validation
    - Query validation before profiling
    - Preview query results (first 100 rows)
    - Estimated result set size
    - Save frequently used queries as templates
    - Named queries (treat query as a virtual entity with custom name)
- **Data Lake Profiling Configuration**:
  - Input API source endpoint URL
  - Select domain from pre-defined domain dropdown list
  - Specify XPath expressions (for XML) or attribute paths (for JSON)
  - Provide entity list (manual entry, CSV import, or bulk paste)
  - Test API connection and response structure
  - Preview sample data extraction before profiling
  - Save API configurations as templates
- **Flat File Profiling Configuration**:
  - File upload interface with drag-and-drop support
  - Multi-file batch upload
  - Supported formats: CSV, TSV, JSON, XML, Excel (XLSX, XLS)
  - File parsing configuration:
    - CSV/TSV: delimiter, header detection, encoding, quote character
    - JSON: root path, array detection, nested structure flattening
    - XML: root element, record tags, attribute mapping
    - Excel: sheet selection, header row, cell range
  - Auto-detect file structure and schema
  - Preview data before profiling (first 100 rows)
  - Column selection (profile all or specific columns)
  - Data type inference configuration
  - Sample size specification (full file or N rows)
  - Option to treat multiple files as single dataset or separate entities
  - Server/network path specification for large files
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

**Dataset-Level Rules** (4 rules):
1. **Dataset Statistics**: Record count, column count, dataset size, profiling metadata
2. **Dataset-Level Data Quality**: Overall completeness, quality score/grade (Gold/Silver/Bronze), PII risk
3. **Referential Integrity**: Foreign key validation, orphan records, cross-table checks
4. **Candidate Key Discovery**: Single-column keys, composite keys, uniqueness %, near-unique columns, PK suggestions

**Attribute-Level Rules** (8 rules per column):
1. **Column Statistics**: Record count, null count, null percentage, unique count, distinct count, duplicate count
2. **Data Type Analysis**: Inferred type, type consistency, format patterns, type mismatches
3. **Numeric Analysis**: Min, max, mean, median, std dev, variance, Q1, Q3, percentiles, outliers, range validation
4. **String Analysis**: Min length, max length, avg length, pattern frequency, character sets, leading/trailing spaces, empty strings
5. **Date/Time Analysis**: Min date, max date, range span, format patterns, timezone, invalid dates, future dates, weekend distribution
6. **Column-Level Data Quality**: Completeness %, validity %, consistency, accuracy, conformity rate, quality score, quality grade
7. **Value Distribution**: Frequency distribution, top N values, bottom N values, histogram bins, cardinality, cardinality ratio, mode, skewness
8. **PII Detection**: Email, phone, SSN, credit card, IP address, physical address, names, DOB patterns, GDPR categories, confidence score, risk level

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
  - **Overview Tab**: Dataset-level rules (4 rules)
    - Dataset statistics, data quality, referential integrity, candidate keys
  - **Column Statistics Tab**: Attribute-level rules (8 rules per column)
    - Column statistics, data type, numeric/string/date analysis
    - Column quality, value distribution, PII detection
  - Expandable rows for detailed atomic metrics
  - Separate tabs for dataset-level vs attribute-level results
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

## User Interface & Navigation Flow

### Screen Structure
The application consists of **5 main screens**:

1. **Home/Landing Page** - Dashboard with quick access to jobs
2. **Dataset Configuration Screen** - Multi-step job setup wizard
3. **Dataset Profile Dashboard** - Overview and entity list
4. **Detailed Entity View** - Drill-down into specific entity results
5. **Job History Screen** - Historical jobs management

### Navigation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Top Navigation Bar                      │
│  [Data Profiling Utility] | Jobs | History | Settings       │
└─────────────────────────────────────────────────────────────┘

1. HOME/LANDING PAGE
   │
   ├─ Quick stats (total jobs, recent activity)
   ├─ Recent profiling jobs list
   ├─ Quick links to recent datasets
   │
   ├─→ [+ New Profiling Job] Button
   │   │
   │   └─→ 2. DATASET CONFIGURATION SCREEN (Multi-step Wizard)
   │       │
   │       ├─ STEP 1: Data Source Setup
   │       │  • Select connection type (Database/Data Lake/Flat File)
   │       │  • **For Database/Data Lake**:
   │       │    - **Select Saved Connection** (dropdown from config file)
   │       │      • Load connection parameters from configuration file
   │       │      • Display connection name/alias
   │       │      • Show connection type and source info
   │       │    - OR [+ Add New Connection] button
   │       │      • Opens modal/form to enter connection details
   │       │      • Fields: host, port, database, credentials, etc.
   │       │      • [Save to Config] option
   │       │    - [Test Connection] button
   │       │    - [Edit Connection] option for selected connection
   │       │  • **For Flat File**:
   │       │    - [Upload Files] or [Select from Server] button
   │       │    - Supported formats: CSV, TSV, JSON, XML, Excel (XLSX/XLS)
   │       │    - Drag-and-drop file upload zone
   │       │    - Multi-file selection (batch upload)
   │       │    - File size validation and preview
   │       │    - Option to specify file location on server/network path
   │       │  └─→ [Next] button
   │       │
   │       ├─ STEP 2: Dataset & Entity Selection
   │       │  • **For Database Sources**:
   │       │    - Select dataset (schema/database)
   │       │    - **BROWSE MODE TOGGLE**:
   │       │      ┌────────────────────────────────────┐
   │       │      │ [○ Browse Tables] [○ Custom Query] │
   │       │      └────────────────────────────────────┘
   │       │    
   │       │    - **IF Browse Tables Mode**:
   │       │      • Display table list with metadata (row count, columns)
   │       │      • Multi-select checkboxes for tables
   │       │      • Search/filter tables by name
   │       │      • Select all/none options
   │       │      • Preview table structure
   │       │    
   │       │    - **IF Custom Query Mode**:
   │       │      • SQL editor with syntax highlighting
   │       │      • [Validate Query] button
   │       │      • [Preview Results] (first 100 rows)
   │       │      • Query name input (treat as virtual entity name)
   │       │      • Estimated result set size display
   │       │      • [Save as Template] option
   │       │  
   │       │  • **For Flat Files**:
   │       │    - Display uploaded files list
   │       │    - File details: name, size, type, row count (detected)
   │       │    - [Add More Files] button
   │       │    - [Remove File] option per file
   │       │    - File parsing configuration per file:
   │       │      • **CSV/TSV**: Delimiter, header row, encoding, quote char
   │       │      • **JSON**: Root path, array detection, nested flattening
   │       │      • **XML**: Root element, record tag, attribute mapping
   │       │      • **Excel**: Sheet selection, header row, range specification
   │       │    - [Preview Data] button (first 100 rows)
   │       │    - [Auto-detect Settings] option
   │       │    - Treat each file as separate entity or combine into dataset
   │       │  
   │       │  • Optional: Entity filtering patterns
   │       │  └─→ [Back] [Next] buttons
   │       │
   │       ├─ STEP 3: Profiling Options
   │       │  • **For Selected Tables**:
   │       │    - [○ Profile All Columns] (default)
   │       │    - [○ Select Specific Columns]
   │       │    - If specific: Column picker with data types shown
   │       │  
   │       │  • **For Custom Queries**:
   │       │    - Columns detected automatically from query
   │       │    - Option to exclude specific columns
   │       │  
   │       │  • **For Flat Files**:
   │       │    - [○ Profile All Columns] (default)
   │       │    - [○ Select Specific Columns]
   │       │    - Column picker based on detected schema
   │       │    - Data type inference settings
   │       │    - Sample size for profiling (full file or first N rows)
   │       │  
   │       │  • Profiling rule selection (optional - Phase 2)
   │       │  • Custom thresholds configuration (optional)
   │       │  └─→ [Back] [Start Profiling] buttons
   │       │
   │       └─→ [Start Profiling] Button
   │           │
   │           └─→ 3. DATASET PROFILE DASHBOARD
   │               │
   │               ├─ **Top Section**: Real-time Job Progress (if in progress)
   │               │  • Progress bar with percentage
   │               │  • Entities: queued/in-progress/completed/failed
   │               │  • Processing speed (rows/sec)
   │               │  • Estimated time to completion (ETC)
   │               │  • [Cancel Job] button (if in progress)
   │               │
   │               ├─ **Dataset-Level Summary Cards** (Primary View)
   │               │  • 4 Overview Cards in Grid Layout:
   │               │    - Total Entities (count)
   │               │    - Average Quality Score (0-100)
   │               │    - Total Rows (sum across all entities)
   │               │    - Total Columns (sum across all entities)
   │               │  • Overall dataset quality grade badge (Gold/Silver/Bronze)
   │               │  • Dataset metadata (name, source type, profiling date)
   │               │
   │               ├─ **Data Quality Visualizations**
   │               │  • Quality Grade Distribution (Pie/Donut Chart)
   │               │    - Count of Gold/Silver/Bronze entities
   │               │    - Color-coded segments
   │               │  • Entity Quality Scores (Bar Chart)
   │               │    - Top 5-10 entities by quality score
   │               │    - Sorted view of entity quality
   │               │
   │               ├─ **Entity List/Grid** (Secondary View - below charts)
   │               │  • Summary cards for each entity
   │               │  • Entity type badge (Table/Table-Partial/Query)
   │               │  • Key metrics: rows, columns, quality score, grade
   │               │  • Search bar for entities
   │               │  • Filter by: quality grade, type, status
   │               │  • Sort by: name, size, quality, completion time
   │               │  • [Export Report] button
   │               │
   │               └─→ [Click Entity Card/Row]
   │                   │
   │                   └─→ 4. DETAILED ENTITY VIEW
   │                       │
   │                       ├─ **Header Section**:
   │                       │  • Entity name & type
   │                       │  • Quality grade badge (Gold/Silver/Bronze)
   │                       │  • Source info (table name or query text)
   │                       │  • Profiling timestamp
   │                       │  • Breadcrumb: Home > Job > Dataset > Entity
   │                       │
   │                       ├─ **Navigation Tabs**:
   │                       │  • [Overview] - Dataset summary (Dataset-Level Rules)
   │                       │    - Dataset statistics (record count, columns, size)
   │                       │    - Overall data quality metrics
   │                       │    - Dataset-level visualizations
   │                       │  • [Column Statistics] - Attribute-Level metrics per column
   │                       │    - All 8 attribute-level rules results
   │                       │    - Expandable column-by-column view
   │                       │  • [Data Quality] - Quality breakdown
   │                       │    - Entity-level quality score/grade
   │                       │    - Column-level quality scores
   │                       │    - Quality distribution charts
   │                       │  • [Patterns & Distributions] - Value analysis
   │                       │    - Value distributions per column
   │                       │    - Pattern frequency charts
   │                       │    - Histogram visualizations
   │                       │  • [Referential Integrity] - Cross-column analysis
   │                       │    - Foreign key validation results
   │                       │    - Orphan records
   │                       │    - Cross-table consistency
   │                       │  • [Candidate Keys] - Key discovery (Dataset-Level)
   │                       │    - Single-column candidates
   │                       │    - Composite key suggestions
   │                       │    - Uniqueness analysis
   │                       │  • [PII Detection] - Sensitive data (per column)
   │                       │    - PII patterns found
   │                       │    - Confidence scores
   │                       │    - Risk levels per column
   │                       │
   │                       ├─ **Content Area**:
   │                       │  • Column-level statistics table
   │                       │  • Expandable rows for detailed metrics
   │                       │  • Visualizations (histograms, charts, gauges)
   │                       │  • Interactive filters and sorting
   │                       │  • Column comparison side-by-side
   │                       │
   │                       ├─ **Actions**:
   │                       │  • [← Back to Dashboard]
   │                       │  • [Export Entity Report] (JSON/CSV/PDF)
   │                       │  • [Compare with Previous] (Phase 2)
   │                       │  • [Copy Column Stats]
   │                       │
   │                       └─→ [Back] returns to Dashboard
   │
   └─→ [View Job History] or Top Nav: [History]
       │
       └─→ 5. JOB HISTORY SCREEN
           │
           ├─ **Filter Panel**:
           │  • Date range picker
           │  • Source type filter
           │  • Status filter (completed/failed/cancelled)
           │  • Dataset/entity search
           │
           ├─ **Jobs Table/List**:
           │  • Job ID, dataset name, source type
           │  • Execution date & duration
           │  • Status indicator
           │  • Entity count
           │  • Actions: [View] [Delete] [Archive]
           │
           ├─ **Bulk Actions**:
           │  • Select multiple jobs
           │  • [Delete Selected]
           │  • [Archive Selected]
           │
           └─→ [Click Job Row or View]
               │
               └─→ 3. DATASET PROFILE DASHBOARD (read-only mode)
                   • Shows completed job results
                   • No progress bar (job completed)
                   • Full navigation to entity details available
```

### User Journey Examples

#### **Journey 1: New User - Profile Database Tables**
```
Home → [+ New Job] → 
Step 1: Select saved connection "Production PostgreSQL" from dropdown → 
        [Test Connection] → Success → [Next] →
Step 2: Select schema "public" → [Browse Tables mode] → 
        Select 3 tables: customers, orders, products → [Next] →
Step 3: [Profile All Columns] → [Start Profiling] →
Dashboard: 
  • Watch progress bar (50%... 100%) →
  • View Dataset Summary Cards (3 entities, avg score 82, 1.3M rows) →
  • Review Quality Distribution Chart (1 Gold, 1 Silver, 1 Bronze) →
  • Scroll to Entity List →
  • Click "customers" entity card →
Detailed Entity View: Review column statistics → [Back] →
Dashboard: Review other entities → [Export Report]
```

#### **Journey 2: Advanced User - Custom Query**
```
Home → [+ New Job] →
Step 1: Select saved connection "Analytics DB" from dropdown → [Next] →
Step 2: [Custom Query mode] → 
        Write SQL: "SELECT c.*, o.total FROM customers c JOIN orders o..." →
        [Validate Query] → [Preview Results] → 
        Name: "customer_orders_view" → [Next] →
Step 3: Default options → [Start Profiling] →
Dashboard → Click "customer_orders_view" entity →
Detailed View: Analyze joined data quality
```

#### **Journey 3: Returning User - Review History**
```
Home → Recent Jobs: Click "sales_db_profile (Nov 24)" →
Dashboard (read-only) → Browse entities →
Click "transactions" → Detailed View →
[Compare with Previous] (Phase 2 feature)
```

#### **Journey 4: Data Lake API Profiling**
```
Home → [+ New Job] →
Step 1: Select "Data Lake API" → Enter API endpoint → [Test] → [Next] →
Step 2: Select domain from dropdown → 
        Enter entity list (paste CSV) →
        Specify JSON attribute path: "data.records[*]" → [Next] →
Step 3: Default options → [Start Profiling] →
Dashboard: Monitor API calls and profiling progress
```

#### **Journey 5: Flat File Upload and Profiling**
```
Home → [+ New Job] →
Step 1: Select "Flat File" → 
        Drag and drop 3 CSV files (customers.csv, orders.csv, products.csv) → 
        Files uploaded and validated → [Next] →
Step 2: Review file list → 
        Configure CSV settings (auto-detected: comma delimiter, header row 1) →
        [Preview Data] for customers.csv → Looks good →
        [Treat as separate entities] selected → [Next] →
Step 3: [Profile All Columns] → [Start Profiling] →
Dashboard: 
  • Watch progress (processing 3 files) →
  • View results for each file as separate entity →
  • Click "customers.csv" entity →
Detailed View: Analyze file data quality
```

### Key Navigation Principles

1. **Persistent Top Navigation**: Always accessible - Home, Jobs, History, Settings
2. **Breadcrumbs**: Show current location and enable quick backtracking
3. **Progressive Disclosure**: Wizard-based configuration reveals options step-by-step
4. **Mode Switching**: Clear toggle between Browse Tables and Custom Query modes
5. **Deep Linking**: Shareable URLs for specific jobs/entities
6. **Context Preservation**: Save partial configurations if user navigates away
7. **Back Navigation**: Always provide clear path to return to previous screen
8. **Modal Usage**: Use modals for non-critical actions (export, settings)
9. **Responsive Design**: All screens optimized for desktop (primary) and tablet

### Navigation State Management

- **Active Job**: Show "Job in Progress" indicator in top nav if profiling running
- **Unsaved Changes**: Warn before leaving configuration screen with unsaved data
- **Session Persistence**: Remember last used connection and settings
- **Recent Items**: Quick access to recently profiled datasets

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
