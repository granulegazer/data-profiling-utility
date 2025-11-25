# Comprehensive Project Setup Prompt for GitHub Copilot

Copy and paste this prompt into GitHub Copilot to generate your complete project structure:

---

## Project Generation Request

Create a complete full-stack Data Profiling Utility application with the following structure and requirements:

### Project Structure
```
data-profiling-utility/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI application entry point
│   │   ├── config.py                  # Configuration management (DB credentials, env vars)
│   │   ├── database.py                # Database connection management & pooling
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── job.py                 # Profiling_Job model
│   │   │   ├── dataset.py             # Dataset_Profile model
│   │   │   ├── entity.py              # Entity_Profile_Summary model
│   │   │   └── file_path.py           # Profile_Results_File_Path model
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── job.py                 # Pydantic schemas for jobs
│   │   │   ├── dataset.py             # Pydantic schemas for datasets
│   │   │   ├── entity.py              # Pydantic schemas for entities
│   │   │   └── profiling.py           # Profiling request/response schemas
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── connections.py     # Data source connection endpoints
│   │   │   │   ├── profiling.py       # Profiling job endpoints
│   │   │   │   ├── results.py         # Results retrieval endpoints
│   │   │   │   └── jobs.py            # Job management endpoints
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── connection_service.py  # Database connection management
│   │   │   ├── profiling_service.py   # Main profiling orchestration
│   │   │   ├── data_ingestion.py      # Data extraction from sources
│   │   │   └── storage_service.py     # File storage management
│   │   ├── profilers/
│   │   │   ├── __init__.py
│   │   │   ├── base_profiler.py       # Abstract base profiler class
│   │   │   ├── column_statistics.py   # Rule 1: Column Statistics
│   │   │   ├── data_type_analysis.py  # Rule 2: Data Type Analysis
│   │   │   ├── numeric_analysis.py    # Rule 3: Numeric Analysis
│   │   │   ├── string_analysis.py     # Rule 4: String Analysis
│   │   │   ├── datetime_analysis.py   # Rule 5: Date/Time Analysis
│   │   │   ├── quality_metrics.py     # Rule 6: Data Quality Metrics
│   │   │   ├── value_distribution.py  # Rule 7: Value Distribution
│   │   │   ├── referential_integrity.py # Rule 8: Referential Integrity
│   │   │   ├── candidate_keys.py      # Rule 9: Candidate Key Discovery
│   │   │   └── pii_detection.py       # Rule 10: PII Detection
│   │   ├── connectors/
│   │   │   ├── __init__.py
│   │   │   ├── base_connector.py      # Abstract connector interface
│   │   │   ├── postgresql_connector.py # PostgreSQL connector using psycopg3
│   │   │   └── oracle_connector.py    # Oracle connector using oracledb
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── encryption.py          # Credential encryption utilities
│   │       ├── validators.py          # Data validation utilities
│   │       └── file_manager.py        # JSON file operations
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_profilers/
│   │   ├── test_connectors/
│   │   └── test_api/
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                   # Application entry point
│   │   ├── App.tsx                    # Root component with routing
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── connections/
│   │   │   │   ├── ConnectionForm.tsx      # Add/edit data source connections
│   │   │   │   ├── ConnectionList.tsx      # List saved connections
│   │   │   │   └── ConnectionTest.tsx      # Test connection button
│   │   │   ├── configuration/
│   │   │   │   ├── DatasetSelector.tsx     # Select dataset to profile
│   │   │   │   ├── EntityFilter.tsx        # Entity filtering UI
│   │   │   │   ├── ColumnSelector.tsx      # Column selection for tables
│   │   │   │   ├── QueryEditor.tsx         # SQL query editor with syntax highlighting
│   │   │   │   └── ProfilingConfig.tsx     # Main configuration component
│   │   │   ├── progress/
│   │   │   │   ├── ProgressDashboard.tsx   # Real-time progress tracking
│   │   │   │   ├── ProgressBar.tsx         # Progress bar component
│   │   │   │   ├── EntityStatus.tsx        # Per-entity status display
│   │   │   │   └── MetricsDisplay.tsx      # Speed, ETA metrics
│   │   │   ├── results/
│   │   │   │   ├── DatasetDashboard.tsx    # Dataset-level overview
│   │   │   │   ├── QualityGradeChart.tsx   # Grade distribution chart
│   │   │   │   ├── EntitySummary.tsx       # Entity list with summary cards
│   │   │   │   ├── EntityDetail.tsx        # Detailed column-level view
│   │   │   │   ├── ColumnTable.tsx         # Column profiling results table
│   │   │   │   └── Visualizations.tsx      # Charts and graphs
│   │   │   └── common/
│   │   │       ├── QualityBadge.tsx        # Quality grade badge component
│   │   │       ├── SearchBar.tsx
│   │   │       ├── FilterDropdown.tsx
│   │   │       └── LoadingSpinner.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Connections.tsx
│   │   │   ├── NewProfilingJob.tsx
│   │   │   ├── JobProgress.tsx
│   │   │   ├── Results.tsx
│   │   │   └── JobHistory.tsx
│   │   ├── services/
│   │   │   ├── api.ts                      # Axios configuration
│   │   │   ├── connectionService.ts        # Connection API calls
│   │   │   ├── profilingService.ts         # Profiling API calls
│   │   │   └── resultsService.ts           # Results API calls
│   │   ├── store/
│   │   │   ├── store.ts                    # Redux/Zustand store config
│   │   │   ├── slices/
│   │   │   │   ├── connectionSlice.ts
│   │   │   │   ├── jobSlice.ts
│   │   │   │   └── resultsSlice.ts
│   │   ├── types/
│   │   │   ├── connection.ts
│   │   │   ├── job.ts
│   │   │   ├── dataset.ts
│   │   │   ├── entity.ts
│   │   │   └── profiling.ts
│   │   ├── hooks/
│   │   │   ├── useConnection.ts
│   │   │   ├── useProfilingJob.ts
│   │   │   └── useResults.ts
│   │   └── utils/
│   │       ├── formatters.ts
│   │       └── validators.ts
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
│
├── docker/
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── docker-compose.yml
│
└── README.md
```

---

## Backend Implementation Requirements

### 1. FastAPI Application (main.py)
```python
# Create FastAPI app with:
# - CORS middleware for frontend communication
# - Exception handlers for consistent error responses
# - Lifespan events for database connection pool management
# - API versioning (/api/v1/)
# - Health check endpoint
# - WebSocket support for real-time progress updates
```

### 2. Database Models (SQLAlchemy ORM)

**Profiling_Job Model:**
- job_id (UUID, primary key)
- created_at, started_at, completed_at (DateTime)
- status (Enum: pending, running, completed, failed)
- source_type (Enum: postgresql, oracle)
- dataset_name (String)
- entity_filter_applied (Boolean)
- total_entities, completed_entities, filtered_entities (Integer)
- estimated_completion_time (DateTime)
- progress_percentage (Float)

**Dataset_Profile Model:**
- dataset_profile_id (UUID, primary key)
- job_id (ForeignKey to Profiling_Job)
- dataset_name (String)
- total_entities, total_rows, total_columns (Integer)
- profiled_at (DateTime)
- overall_quality_score (Integer)
- overall_quality_grade (Enum: GOLD, SILVER, BRONZE)
- storage_size (BigInteger)

**Entity_Profile_Summary Model:**
- entity_profile_id (UUID, primary key)
- dataset_profile_id (ForeignKey to Dataset_Profile)
- entity_name (String)
- entity_type (Enum: table, query, api)
- source_query (Text, nullable)
- selected_columns (Text, nullable)
- row_count, column_count (Integer)
- null_percentage (Float)
- data_quality_score (Integer)
- data_quality_grade (Enum: GOLD, SILVER, BRONZE)
- status (Enum: queued, in_progress, completed, failed)
- started_at, completed_at (DateTime)
- rows_processed (BigInteger)
- processing_speed_rows_per_sec (Float)

**Profile_Results_File_Path Model:**
- path_id (UUID, primary key)
- entity_profile_id (ForeignKey to Entity_Profile_Summary)
- base_directory_path (String)
- profile_summary_file_path (String)
- column_statistics_file_path (String)
- value_distributions_file_path (String)
- pattern_analysis_file_path (String)
- quality_metrics_file_path (String)
- total_file_size_bytes (BigInteger)

### 3. Database Connectors

**PostgreSQL Connector (psycopg3):**
```python
# Implement async PostgreSQL connector with:
# - Connection pooling using psycopg3's connection pool
# - Async query execution
# - Schema introspection (get tables, columns, data types)
# - Efficient data sampling for profiling
# - Support for custom SQL queries
# - Transaction management
```

**Oracle Connector (oracledb):**
```python
# Implement Oracle connector with:
# - Connection pooling using oracledb
# - Schema introspection (USER_TABLES, USER_TAB_COLUMNS)
# - Batch data fetching
# - Support for CLOB/BLOB handling
# - Custom query execution
```

### 4. Profiling Engine - Implement All 10 Enterprise Rules

**Rule 1: Column Statistics Profiler**
```python
# Calculate for each column:
# - Total record count
# - Null count and null percentage
# - Unique value count (COUNT(DISTINCT))
# - Distinct value count
# - Duplicate count (total - unique)
# Use SQL aggregations for efficiency on large datasets
```

**Rule 2: Data Type Analysis**
```python
# For each column:
# - Infer actual data type from sample values (regex patterns)
# - Compare with declared schema type
# - Detect type mismatches (e.g., numbers stored as strings)
# - Identify format patterns (date formats, number formats)
# - Report type consistency percentage
```

**Rule 3: Numeric Analysis**
```python
# For numeric columns:
# - Min, max values
# - Mean, median (using SQL or pandas)
# - Standard deviation, variance
# - Quartiles (Q1, Q2, Q3)
# - Percentiles (P5, P25, P50, P75, P95)
# - Outlier detection (IQR method or Z-score)
# - Histogram bin generation
```

**Rule 4: String Analysis**
```python
# For string/varchar columns:
# - Min, max, average length
# - Pattern frequency analysis (regex-based)
# - Character set detection (ASCII, UTF-8, special chars)
# - Leading/trailing whitespace detection
# - Common prefix/suffix detection
# - Case consistency analysis
```

**Rule 5: Date/Time Analysis**
```python
# For date/datetime columns:
# - Min and max date range
# - Date format pattern detection (YYYY-MM-DD, MM/DD/YYYY, etc.)
# - Timezone detection (if applicable)
# - Invalid date detection
# - Future date detection
# - Date distribution (by year, month, day of week)
```

**Rule 6: Data Quality Metrics**
```python
# Calculate overall quality scores:
# - Completeness: (non-null count / total count) * 100
# - Validity: percentage conforming to expected patterns
# - Consistency: cross-column validation results
# - Accuracy indicators: within expected ranges
# - Overall quality score: weighted average of above
# - Quality grade: GOLD (>=90), SILVER (70-89), BRONZE (<70)
```

**Rule 7: Value Distribution**
```python
# For each column:
# - Frequency distribution (value -> count)
# - Top N most common values (default: top 10)
# - Value histogram generation (bin ranges and counts)
# - Cardinality analysis (distinct count / total count)
# - Skewness detection
```

**Rule 8: Referential Integrity**
```python
# For tables with foreign keys:
# - Validate foreign key constraints
# - Detect orphan records (FK values not in parent table)
# - Cross-table consistency checks
# - Report integrity violation counts and percentages
# NOTE: This requires metadata about FK relationships
```

**Rule 9: Candidate Key Discovery**
```python
# Identify potential primary keys:
# - Single-column candidate keys (columns with 100% unique values)
# - Composite key suggestions (combinations with high uniqueness)
# - Calculate uniqueness percentage for each column
# - Detect near-unique columns (>95% unique)
# - Primary key recommendations: non-null + 100% unique
# - Multi-column uniqueness analysis (top combinations)
```

**Rule 10: PII Detection**
```python
# Pattern-based PII detection:
# - Email addresses (regex: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$)
# - Phone numbers (various formats: +1-XXX-XXX-XXXX, (XXX) XXX-XXXX)
# - SSN (XXX-XX-XXXX, XXXXXXXXX)
# - Credit card numbers (Luhn algorithm validation)
# - IP addresses
# - Postal codes
# - Flag columns containing PII
# - Calculate PII exposure percentage
# - GDPR compliance risk assessment
```

### 5. API Endpoints

**Connection Management:**
```
POST   /api/v1/connections              # Create new connection
GET    /api/v1/connections              # List all connections
GET    /api/v1/connections/{id}         # Get connection details
PUT    /api/v1/connections/{id}         # Update connection
DELETE /api/v1/connections/{id}         # Delete connection
POST   /api/v1/connections/{id}/test    # Test connection
GET    /api/v1/connections/{id}/datasets # List datasets/schemas
GET    /api/v1/connections/{id}/datasets/{name}/entities # List entities
```

**Profiling Jobs:**
```
POST   /api/v1/profiling/jobs           # Create profiling job
GET    /api/v1/profiling/jobs           # List all jobs
GET    /api/v1/profiling/jobs/{id}      # Get job details
GET    /api/v1/profiling/jobs/{id}/progress # Get job progress
DELETE /api/v1/profiling/jobs/{id}      # Cancel/delete job
WS     /api/v1/profiling/jobs/{id}/ws   # WebSocket for real-time updates
```

**Results:**
```
GET    /api/v1/results/datasets/{id}    # Get dataset profile
GET    /api/v1/results/entities/{id}    # Get entity profile summary
GET    /api/v1/results/entities/{id}/columns # Get column-level details
GET    /api/v1/results/entities/{id}/download # Download results as JSON
```

### 6. Async Processing
```python
# Use asyncio for concurrent profiling:
# - Profile multiple entities concurrently (asyncio.gather)
# - Update progress in real-time via WebSocket
# - Store intermediate results to handle failures
# - Implement retry logic for failed entities
```

### 7. Storage Service
```python
# Implement file storage management:
# - Create directory structure: {job_id}/{dataset_name}/{entity_name}/
# - Save profiling results as JSON files:
#   - profile_summary.json
#   - column_statistics.json
#   - value_distributions.json
#   - pattern_analysis.json
#   - quality_metrics.json
# - Store file paths in Profile_Results_File_Path table
# - Calculate total file size
```

---

## Frontend Implementation Requirements

### 1. Application Setup
```typescript
// Initialize React app with:
// - Vite + TypeScript
// - React Router for navigation
// - Axios for API calls
// - Zustand or Redux Toolkit for state management
// - Recharts for data visualization
// - Material-UI or Ant Design for UI components
// - React Hook Form for form handling
```

### 2. Key Pages & Components

**Home Page:**
- Dashboard with recent jobs
- Quick actions: Start new profiling job, view results
- System status overview

**Connections Page:**
- List of saved database connections
- Add/Edit/Delete connection forms
- Test connection button with status indicator
- Connection details: host, port, database, username

**New Profiling Job Configuration:**
1. **Step 1: Select Connection**
   - Dropdown to select saved connection
   - Button to add new connection inline

2. **Step 2: Select Dataset**
   - List datasets/schemas from selected connection
   - Show entity counts for each dataset

3. **Step 3: Configure Entities**
   - Option 1: Profile all entities (default)
   - Option 2: Filter entities
     - Include/exclude specific entities (multi-select)
     - Pattern-based filtering (e.g., "CUSTOMER_*")
   - Show total entities selected

4. **Step 4: Configure Profiling Options**
   - For each entity or globally:
     - Table mode: Select all columns or choose specific columns
     - Query mode: SQL editor with syntax highlighting
   - Preview option (show sample data)

5. **Step 5: Review & Submit**
   - Summary of configuration
   - Estimated processing time (if available)
   - Submit button to start profiling

**Job Progress Page:**
- Overall progress bar with percentage
- Entity-by-entity status table:
  - Entity name
  - Status: queued | in-progress | completed | failed
  - Rows processed / Total rows
  - Processing speed (rows/sec)
- Metrics cards:
  - Total entities, completed entities
  - Elapsed time, ETA
  - Current entity being processed
- Live log stream (collapsible)
- Cancel job button

**Results Dashboard:**
1. **Dataset-Level Overview:**
   - Header: Dataset name, profiled date
   - Summary cards:
     - Total entities profiled
     - Total rows across all entities
     - Total columns
     - Average quality score
     - Overall dataset quality grade (Gold/Silver/Bronze badge)
   - Quality grade distribution chart (Pie or Bar chart)
     - Count of Gold, Silver, Bronze entities
   - Quality score distribution (Histogram)

2. **Entity Summary View:**
   - Entity cards in grid layout:
     - Entity name
     - Entity type (table, query)
     - Row count, column count
     - Quality score and grade badge (color-coded)
     - Quick stats: null %, PII detected, candidate keys
   - Filters:
     - Search by entity name
     - Filter by quality grade (All, Gold, Silver, Bronze)
     - Filter by entity type
     - Sort by: name, quality score, row count
   - Click entity card to drill down

3. **Entity Detail View:**
   - Entity header:
     - Entity name and type
     - Quality grade badge
     - Summary stats
   - Tabs:
     - **Overview:** Key metrics, charts
     - **Columns:** Column-level profiling table
     - **Data Quality:** Quality metrics breakdown
     - **Visualizations:** Charts and graphs
   
   **Columns Tab Table:**
   - Columns: Column Name, Data Type, Null %, Unique Count, Distinct Count, Quality Score, Flags (PII, Key)
   - Sortable by any column
   - Expandable rows for detailed statistics:
     - For numeric: min, max, mean, median, std dev, quartiles, outliers
     - For string: length stats, patterns, character sets
     - For date: date range, format patterns
     - Value distribution (top 10 values with frequencies)
   - Export column details

**Job History Page:**
- List of all profiling jobs
- Filters: date range, status, dataset
- Search by dataset/entity name
- Actions: View results, re-run, delete

### 3. Real-Time Progress Updates
```typescript
// Implement WebSocket connection for real-time updates:
// - Connect to WebSocket endpoint when job starts
// - Receive progress updates and update UI
// - Display entity completion status
// - Update progress bar and metrics
// - Handle connection errors and reconnection
```

### 4. Visualizations with Recharts
```typescript
// Implement the following charts:
// 1. Quality Grade Distribution: Pie Chart (Gold/Silver/Bronze)
// 2. Entity Quality Scores: Bar Chart
// 3. Null Percentage by Column: Bar Chart
// 4. Value Distribution: Histogram
// 5. Data Quality Metrics: Gauge Chart or Scorecard
// 6. Pattern Frequency: Bar Chart
// 7. Candidate Keys: Network/Tree Diagram (if applicable)
```

### 5. State Management
```typescript
// Zustand store structure:
// - connectionStore: saved connections, selected connection
// - jobStore: current job, job list, job progress
// - resultsStore: dataset profiles, entity profiles, selected entity
// - uiStore: loading states, modals, notifications

// Redux Toolkit alternative:
// - slices for: connections, jobs, results
// - async thunks for API calls
// - selectors for derived data
```

---

## Configuration & Environment

### Backend (.env.example)
```
# Database (Oracle for metadata storage)
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=XEPDB1
ORACLE_USER=profiler_user
ORACLE_PASSWORD=secure_password

# Application
APP_SECRET_KEY=your-secret-key-here
STORAGE_BASE_PATH=/var/profiling_results
LOG_LEVEL=INFO

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Security
ENCRYPTION_KEY=your-encryption-key-for-credentials
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/api/v1
```

---

## Dependencies

### Backend (requirements.txt)
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
alembic==1.13.1
pydantic==2.5.3
pydantic-settings==2.1.0
psycopg[binary]==3.1.18      # PostgreSQL connector
oracledb==2.0.0              # Oracle connector
pandas==2.1.4                # Data processing
numpy==1.26.3
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
aiofiles==23.2.1
websockets==12.0
redis==5.0.1
cryptography==42.0.0
pytest==7.4.4
pytest-asyncio==0.23.3
httpx==0.26.0
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    "axios": "^1.6.5",
    "zustand": "^4.4.7",
    "@tanstack/react-query": "^5.17.9",
    "@mui/material": "^5.15.4",
    "@emotion/react": "^11.11.3",
    "@emotion/styled": "^11.11.0",
    "recharts": "^2.10.3",
    "react-hook-form": "^7.49.3",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",
    "date-fns": "^3.0.6",
    "lucide-react": "^0.303.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.11",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1"
  }
}
```

---

## Docker Setup

### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: ../docker/backend.Dockerfile
    ports:
      - "8000:8000"
    environment:
      - ORACLE_HOST=oracle
      - STORAGE_BASE_PATH=/app/profiling_results
    volumes:
      - profiling_results:/app/profiling_results
      - ./backend:/app
    depends_on:
      - oracle

  frontend:
    build:
      context: ./frontend
      dockerfile: ../docker/frontend.Dockerfile
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

  oracle:
    image: container-registry.oracle.com/database/express:21.3.0-xe
    ports:
      - "1521:1521"
    environment:
      - ORACLE_PWD=OraclePassword123
    volumes:
      - oracle_data:/opt/oracle/oradata

volumes:
  oracle_data:
  profiling_results:
```

---

## Implementation Instructions

### Phase 1 Focus Areas:
1. ✅ **Backend:**
   - FastAPI app with all API endpoints
   - PostgreSQL and Oracle connectors
   - All 10 profiling rules implemented
   - Database models and schemas
   - File-based result storage
   - WebSocket for real-time progress

2. ✅ **Frontend:**
   - Complete UI flow: Connections → Configuration → Progress → Results
   - Dataset dashboard with quality grades
   - Entity summary with filtering/sorting
   - Entity detail view with column-level data
   - Real-time progress tracking
   - Responsive design with Material-UI

3. ✅ **Integration:**
   - Frontend consumes backend APIs
   - WebSocket connection for progress updates
   - Error handling and loading states
   - Form validation

### Code Quality Requirements:
- Type hints for all Python functions
- TypeScript strict mode enabled
- Comprehensive docstrings and comments
- Unit tests for profiling rules (pytest)
- Component tests for key UI components
- API integration tests
- Error handling and logging throughout
- Input validation on both frontend and backend

### Security Considerations:
- Encrypt database credentials before storing
- Validate SQL queries to prevent injection
- Sanitize user inputs
- Use environment variables for sensitive config
- HTTPS/TLS in production
- CORS configuration

---

## Expected Deliverables

Generate the complete project structure with:
1. ✅ All Python backend files with complete implementations
2. ✅ All TypeScript/React frontend files with complete implementations
3. ✅ Configuration files (requirements.txt, package.json, .env.example)
4. ✅ Docker setup (Dockerfiles, docker-compose.yml)
5. ✅ README files with setup instructions for both backend and frontend
6. ✅ Database migration scripts (Alembic) for Oracle schema setup
7. ✅ Sample test files demonstrating testing approach

Focus on creating production-ready, maintainable code with proper architecture, error handling, and documentation.

---

**Start generating the complete project structure now, beginning with the backend core components and profiling engine, followed by the frontend application.**