# Data Profiling Utility - Screen Flow & Functionalities

## Overview
The Data Profiling Utility consists of 5 main screens designed for CSV file profiling with a simple, intuitive workflow.

---

## Screen Navigation Flow

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
   │   └─→ 2. CONFIGURATION SCREEN (Multi-step Wizard)
   │       │
   │       ├─ STEP 1: Data Source Setup
   │       │  • Select connection type (Flat File for CSV)
   │       │  • File upload interface with drag-and-drop
   │       │  • Multi-file selection
   │       │  └─→ [Next] button
   │       │
   │       ├─ STEP 2: Dataset & Entity Selection
   │       │  • Job Name input (required)
   │       │  • Uploaded files list with parsing config
   │       │    - Delimiter, header row settings per file
   │       │  • [Add More Files] button
   │       │  └─→ [Back] [Next] buttons
   │       │
   │       ├─ STEP 3: Profiling Options
   │       │  • Profile all columns or select specific
   │       │  • Sample size configuration
   │       │  └─→ [Back] [Start Profiling] buttons
   │       │
   │       └─→ [Start Profiling] Button
   │           │
   │           └─→ 3. DATASET PROFILE DASHBOARD
   │               │
   │               ├─ Dataset-Level Summary Cards
   │               │  • Total Entities, Avg Quality, Total Rows/Columns
   │               │  • Overall quality grade badge
   │               │
   │               ├─ Data Quality Visualizations
   │               │  • Quality Grade Distribution Chart
   │               │  • Entity Quality Scores Chart
   │               │
   │               ├─ Entity List/Grid
   │               │  • Summary cards per entity
   │               │  • Search, filter, sort capabilities
   │               │
   │               └─→ [Click Entity Card/Row]
   │                   │
   │                   └─→ 4. DETAILED ATTRIBUTE VIEW
   │                       │
   │                       ├─ Header with entity info
   │                       ├─ Breadcrumb: Home > Job > Dataset > Entity > Attributes
   │                       ├─ Navigation Tabs (Attribute-Level Focus):
   │                       │  • Overview (Dataset-Level Summary)
   │                       │  • Column Statistics (Attribute-Level)
   │                       │  • Data Type Analysis (Attribute-Level)
   │                       │  • Numeric Analysis (Attribute-Level)
   │                       │  • String Analysis (Attribute-Level)
   │                       │  • Date/Time Analysis (Attribute-Level)
   │                       │  • Column Quality (Attribute-Level)
   │                       │  • Value Distribution (Attribute-Level)
   │                       │  • PII Detection (Attribute-Level)
   │                       │  • Referential Integrity (Dataset-Level)
   │                       │  • Candidate Keys (Dataset-Level)
   │                       │
   │                       └─→ [Back to Dashboard]
   │
   └─→ [View Job History] or Top Nav: [History]
       │
       └─→ 5. JOB HISTORY SCREEN
           │
           ├─ Filter Panel (date, status, source)
           ├─ Jobs Table/List
           └─→ [Click Job] → Dashboard (read-only)
```

---

## Screen Descriptions

### 1. Home Screen (`/`)

**Purpose**: Landing page with quick access to profiling jobs and system overview

**Components**:
- **Quick Stats Section**
  - Total Jobs count
  - Active Jobs count
  - Completed Jobs count
  - Failed Jobs count

- **Recent Jobs List**
  - Shows last 5 profiling jobs
  - Displays: Job name, Status (badge), Date, Quick actions
  - Click on job → Navigate to Dashboard

- **Actions**
  - "New Profiling Job" button → Navigate to Configuration
  - "View All Jobs" link → Navigate to History

**Navigation**:
- Click "New Profiling Job" → `/configure`
- Click job row → `/dashboard/{jobId}`
- Click "View All Jobs" → `/history`
- NavBar "Home" → Stay on `/`
- NavBar "History" → `/history`

---

### 2. Configuration Screen (`/configure`)

**Purpose**: 3-step wizard to set up and start a new CSV profiling job

**Note**: Currently supports **Flat Files (CSV only)**. Database and Data Lake options are placeholders for future implementation.

#### **Step 1: Job Configuration & Data Source**

**Components**:
- **Job Name Input** (First field - Required)
  - Text input field with asterisk (*)
  - Placeholder: "e.g., Customer Data Profiling"
  - Must be filled before proceeding
  - Validation: Cannot be empty

- **Data Source Selection** (Second field)
  - **Connection Type Dropdown**:
    - Database (PostgreSQL, Oracle)
    - Data Lake API
    - Flat File (CSV, JSON, XML, Excel)
  - Currently only "Flat File" options are functional
  - Database and Data Lake shown but disabled for future

- **File Upload Area** (for Flat File)
  - Visual drag-and-drop zone with border styling
  - "Upload CSV Files" button → Opens file picker (hidden input)
  - Accepts: `.csv` files only
  - Multiple file selection enabled
  - Shows "Uploading..." indicator during upload
  - Displays list of successfully uploaded files with:
    - File name
    - File size (KB)
  - Files can be removed from list (future enhancement)

**Functionality**:
- **Step Order**: User must enter job name FIRST before selecting data source
- Job name field is validated on blur (cannot be empty)
- Select data source from dropdown (Database/Data Lake/Flat File)
- Based on selection, appropriate upload/connection interface appears
- For Flat File:
  - User clicks "Upload CSV Files" button
  - File picker opens (multiple selection)
  - Selected files uploaded to backend `/api/v1/upload` endpoint
  - Each file uploaded individually via FormData
  - Backend returns `file_id` for each uploaded file
  - Frontend stores file metadata: `{name, size, path: file_id}`
  - Uploaded files list updated in real-time
  - Upload button disabled during upload process
  - Alert shown on success/failure

**Navigation**:
- "Cancel" → Navigate to Home `/`
- "Next →" → Step 2 (enabled only if job name filled AND at least 1 file uploaded)

---

#### **Step 2: File Parsing Configuration**

**Purpose**: Configure how uploaded files should be parsed

**Automatic Processing**:
- **File Encoding Detection**: Automatically detect and display file encoding (UTF-8, ISO-8859-1, etc.)
- **File Preview**: Show first 5-10 rows of the file to help user verify settings

**Components**:
- **Uploaded Files Section**
  - If files uploaded (from Step 1):
    - Heading: "Configure File Parsing (N files)"
    - For each file, display card with:
      - **File name** (bold) and size (KB)
      - **Detected Encoding**: Display auto-detected encoding (e.g., "UTF-8")
        - Option to manually override if needed
      - **Column Delimiter**: Dropdown with common options
        - Options: 
          - `,` (Comma)
          - `\t` (Tab)
          - `;` (Semicolon)
          - `|` (Pipe)
          - Custom (text input for other delimiters)
        - Default: Auto-detected or `,` (comma)
      - **Has Header Row** checkbox
        - Default: checked (yes)
        - Label: "First row contains column names"
      - **Preview** button: Show first few rows with detected/selected delimiter
    - **Add More Files** button → Upload additional files
  - If no files uploaded:
    - Message: "No files uploaded yet. Go back to Step 1 to upload files."

**Functionality**:
- System automatically detects file encoding for each uploaded file
- User selects delimiter from common options dropdown (easier than typing)
- Option for custom delimiter if not in the list
- Toggle whether first row is header
- Preview data with selected settings to verify correctness
- **Add More Files**: Upload additional CSV files → Added to list with own parsing config
- Each file can have different delimiter and header settings
- Validation on "Next": At least one file must be configured

**Current Implementation**:
- Delimiter dropdown with common options (to be implemented)
- Encoding auto-detection (to be implemented)
- Preview functionality (to be implemented)
- Currently: Manual text input for delimiter, single global setting

**Navigation**:
- "← Back" → Step 1 (returns to file upload screen)
- "Next →" → Step 3 (enabled only if job name is filled)

---

#### **Step 3: Profiling Options**

**Purpose**: Configure what and how much to profile

**Components**:
- **Column Selection** (Radio buttons)
  - Option 1: "Profile All Columns" (default, selected)
  - Option 2: "Select Specific Columns" (disabled/grayed out - future feature)
  
- **Sample Size** (for CSV files)
  - Number input field
  - Label: "Sample Size (rows)"
  - Placeholder: "Leave empty to profile entire file"
  - Optional: If left empty, profiles all rows in file(s)

**Functionality**:
- **Column Selection**:
  - Currently only "Profile All Columns" is functional
  - "Select Specific Columns" is UI placeholder for future
- **Sample Size**:
  - Enter number of rows to limit profiling (e.g., 1000, 10000)
  - If empty/null: Profile all rows in the file(s)
  - Useful for large files to reduce processing time
- Validation on "Start Profiling":
  - Job name must be filled (checked in Step 2)
  - At least 1 file must be uploaded
  - Sample size must be positive integer if provided

**Navigation**:
- "← Back" → Step 2 (returns to dataset selection)
- "Start Profiling" → 
  - Validates all inputs
  - Creates job via API call
  - On success: Navigate to `/dashboard/{jobId}`
  - On failure: Show error alert

**API Integration**:
- Button click triggers API call: `POST /api/v1/jobs`
- Request payload:
  ```json
  {
    "name": "Job Name from Step 2",
    "description": "Profiling N CSV file(s)",
    "file_paths": ["file_id_1", "file_id_2", ...],
    "csv_config": {
      "delimiter": ",",
      "encoding": "utf-8",
      "has_header": true
    },
    "treat_files_as_dataset": true,
    "sample_size": null or 1000
  }
  ```
- Response: `{ "job_id": "uuid", "name": "...", "status": "pending", ... }`
- On success: Navigate to `/dashboard/{job_id}`
- On error: Display error message from API

---

### 3. Dashboard Screen (`/dashboard/{jobId}`)

**Purpose**: Overview of profiling job results with dataset-level insights

**Components**:
- **Job Header**
  - Job name and status badge
  - Timestamp
  - Quick stats (Total Datasets, Total Rows, Total Columns)

- **Dataset Summary Cards**
  - One card per CSV file/dataset
  - Shows: Dataset name, Row count, Column count, Quality grade (Gold/Silver/Bronze/Red)
  - Click card → Navigate to Detailed Attribute View

- **Quality Distribution Chart**
  - Pie/donut chart showing quality grade distribution
  - Legend: Gold (90-100%), Silver (70-89%), Bronze (50-69%), Red (<50%)

- **Entity Table**
  - Lists all profiled datasets/entities
  - Columns: Entity Name, Row Count, Column Count, Quality Grade, Last Profiled
  - Click row → Navigate to Detailed Attribute View

**Functionality**:
- View job execution results
- Monitor data quality at dataset level
- Quick navigation to detailed entity profiles
- Visual quality distribution

**Navigation**:
- Click dataset card → `/entity/{entityId}`
- Click entity table row → `/entity/{entityId}`
- NavBar "Home" → `/`
- Browser back → Previous page

---

### 4. Detailed Attribute View Screen (`/entity/{entityId}`)

**Purpose**: Column-by-column profiling results for a specific dataset/entity

**Components**:
- **Entity Header**
  - Entity name
  - Quality badge
  - Breadcrumb: Home > Job > Dataset > Entity > Attributes
  - Quick stats (Row Count, Column Count, Quality Score)

- **Navigation Tabs with Attribute-Level Focus**:

#### Tab 1: **Overview** (Dataset-Level Rules Summary)
- **Dataset Statistics**:
  - Total record count
  - Total column count
  - Dataset size (bytes/MB/GB)
  - Profiling timestamp and duration
- **Dataset-Level Data Quality Metrics**:
  - Overall completeness score (% non-null across all columns)
  - Overall data quality score (0-100)
  - Data quality grade badge (Gold/Silver/Bronze/Red)
  - PII risk score
- **Summary Visualizations**:
  - Quality score gauge
  - Completeness percentage bar
  - Grade indicator with color coding

#### Tab 2: **Column Statistics** (Attribute-Level Rules - All 8)
- **Table View** with expandable rows
- **For Each Column**:
  1. **Column Statistics**: Record count, null count, null %, unique count, distinct count, duplicate count
  2. **Data Type Analysis**: Inferred type, type consistency, format patterns, type mismatches
  3. **Numeric Analysis** (if numeric): Min, max, mean, median, std dev, variance, Q1, Q3, percentiles, outliers
  4. **String Analysis** (if text): Min/max/avg length, pattern frequency, character sets, leading/trailing spaces
  5. **Date/Time Analysis** (if date): Min/max date, range span, format patterns, timezone, invalid dates
  6. **Column-Level Data Quality**: Completeness %, validity %, consistency, conformity rate, quality score, quality grade
  7. **Value Distribution**: Frequency distribution, top N values, bottom N values, histogram bins, cardinality, mode
  8. **PII Detection**: Email, phone, SSN, credit card patterns, confidence score, risk level

#### Tab 3: **Data Quality** (Detailed Quality Breakdown)
- **Dataset-Level Quality Rules Results**:
  - Rule 1: Dataset Statistics (pass/fail)
  - Rule 2: Data Quality Metrics (scores and grades)
  - Rule 3: Referential Integrity (validation results)
  - Rule 4: Candidate Key Discovery (keys found)
- **Column-Level Quality Summary**:
  - List of columns with quality issues
  - Quality score distribution across columns
  - Top issues by severity
  - Quality trends (if multiple runs)
- **Visualizations**:
  - Quality score distribution histogram
  - Issue severity breakdown
  - Column quality heatmap

#### Tab 4: **Patterns & Distributions** (Value Analysis)
- **Per Column**:
  - Value distribution charts (histograms, bar charts)
  - Frequency tables (top N most/least common values)
  - Pattern frequency analysis
  - Format pattern detection (emails, phones, dates, etc.)
  - Character set distribution
  - Cardinality metrics
- **Visualizations**:
  - Interactive histograms
  - Frequency bar charts
  - Pattern pie charts

#### Tab 5: **Referential Integrity** (Cross-Column Analysis - Dataset-Level Rule 3)
- **Foreign Key Validation**:
  - Detected relationships between columns/tables
  - Orphan record detection
  - Missing reference validation
- **Cross-Table Consistency Checks**:
  - Value consistency across related columns
  - Referential integrity violations
- **Visualizations**:
  - Relationship diagrams
  - Violation count tables
  - Orphan record charts

#### Tab 6: **Candidate Keys** (Key Discovery - Dataset-Level Rule 4)
- **Single-Column Candidates**:
  - Columns with all unique values
  - Uniqueness percentage (100% or near-100%)
- **Composite Key Suggestions**:
  - Multi-column uniqueness combinations
  - Cardinality analysis
- **Primary Key Recommendations**:
  - Based on non-null + unique criteria
  - Key quality scores
- **Visualizations**:
  - Uniqueness distribution
  - Key candidate ranking
  - Composite key relationship diagrams

#### Tab 7: **PII Detection** (Sensitive Data - Attribute-Level Rule 8)
- **Per Column PII Results**:
  - PII patterns detected (email, phone, SSN, credit card, IP, address, names, DOB)
  - GDPR sensitive data categories
  - PII confidence score (0-100)
  - PII risk level (Low/Medium/High)
  - Sensitive data flags
- **Entity-Level PII Summary**:
  - Total PII columns detected
  - Overall PII risk score
  - Compliance indicators (GDPR, CCPA)
- **Visualizations**:
  - PII risk heatmap by column
  - Pattern detection confidence chart
  - Risk level distribution

**Functionality**:
- Column-by-column (attribute-level) profiling view
- Deep dive into individual column statistics
- Analyze per-column data quality, patterns, and distributions
- Review quality rule violations at both attribute and dataset levels
- Identify PII and sensitive data per column
- Export attribute-level results (future)

**Navigation**:
- Click tab → Switch view
- "← Back to Dashboard" → `/dashboard/{jobId}`
- "Export Attribute Report" → Download column-level results (future)
- NavBar "Home" → `/`

---

### 5. History Screen (`/history`)

**Purpose**: View and manage all profiling jobs (past and present)

**Components**:
- **Jobs Table**
  - Columns: Job Name, Status, Source Type, Created Date, Actions
  - Status badges: Pending, Running, Completed, Failed
  - Sortable columns
  - Search/filter functionality (future)

- **Actions per Job**:
  - "View" → Navigate to Dashboard
  - "Delete" → Delete job (with confirmation)
  - "Re-run" → Create new job with same config (future)

**Functionality**:
- View all historical profiling jobs
- Monitor job status
- Navigate to job results
- Delete old jobs
- Filter and search jobs (future)

**Navigation**:
- Click "View" → `/dashboard/{jobId}`
- Click job row → `/dashboard/{jobId}`
- NavBar "Home" → `/`
- NavBar "New Profiling Job" → `/configure`

---

## Navigation Bar (Persistent)

**Present on all screens**:
- **Left Side**:
  - "Home" link → `/`
  - "History" link → `/history`
  
- **Right Side**:
  - "New Profiling Job" button → `/configure`

---

## Key Design Improvements

### **Updated Configuration Flow (3 Steps)**

**Step 1: Job Configuration & Data Source**
- ✅ **Job Name is now the FIRST field** - User enters job name before anything else
- ✅ **Data Source Dropdown** - Single dropdown to select: Database, Data Lake API, or Flat File
- ✅ File upload after source selection

**Step 2: File Parsing Configuration** 
- ✅ **Automatic Encoding Detection** - System detects file encoding (UTF-8, ISO-8859-1, etc.)
- ✅ **Delimiter Dropdown** - Easy selection from common delimiters:
  - `,` (Comma)
  - `\t` (Tab)
  - `;` (Semicolon)
  - `|` (Pipe)
  - Custom (manual input)
- ✅ **Has Header Row** checkbox
- ✅ **File Preview** - Verify parsing with sample rows

**Step 3: Profiling Options** (unchanged)
- Column selection
- Sample size configuration

### **Benefits of New Flow**
1. **Better Organization**: Job name upfront establishes context
2. **Easier Delimiter Selection**: Dropdown vs manual typing reduces errors
3. **Auto-Detection**: Encoding automatically detected, one less thing to configure
4. **Validation**: File preview helps verify settings before profiling
5. **Flexibility**: Each file can have different delimiter settings

---

## User Journey Examples

### **Journey 1: First-Time User - Profile CSV Files**
```
Home → [+ New Profiling Job] → 
Step 1: Enter job name: "Q4 Sales Data Analysis" (FIRST) →
        Select Data Source: [Flat File] from dropdown →
        Click [Upload CSV Files] → 
        Select 3 files: customers.csv, orders.csv, products.csv →
        Files upload successfully (see file list with sizes) → [Next] →
Step 2: File Parsing Configuration:
        System detects encoding: "UTF-8" for all files ✓
        For customers.csv: Select delimiter from dropdown: "," (Comma) →
        Has header: ✓ (checked) →
        Click [Preview] to verify → looks good ✓
        Configure orders.csv and products.csv similarly → [Next] →
Step 3: [Profile All Columns] selected (default) →
        Sample Size: leave empty (profile all rows) → [Start Profiling] →
Dashboard: 
  • Job created successfully
  • Navigate to Dashboard with job_id
  • See Dataset Summary: 3 entities, scores, row/column totals
  • View Quality Distribution Chart
  • Browse Entity List
  • Click "customers.csv" entity card →
Detailed Attribute View: 
  • Tab through Overview, Column Statistics, Data Type Analysis, etc.
  • Review column-by-column (attribute-level) metrics
  • Analyze per-column statistics, quality, and distributions
  • [Back to Dashboard] → Review other entities
```

### **Journey 2: Returning User - Add More Files**
```
Home → [+ New Profiling Job] →
Step 1: Enter job name: "Customer Analysis" →
        Select [Flat File] → Upload 2 CSV files → [Next] →
Step 2: System detects encoding for both files →
        Configure file1.csv: Delimiter dropdown = "," (Comma), Header = ✓ →
        Configure file2.csv: Delimiter dropdown = ";" (Semicolon), Header = ✓ →
        Click [Add More Files] → Upload 1 more file →
        Now 3 files total, configure third file →
        [Next] →
Step 3: Enter sample size: 5000 (only profile first 5000 rows) → [Start Profiling] →
Dashboard → View results for sampled data
```

### **Journey 3: Review Job History**
```
Home → Recent Jobs: Click "Q4 Sales Data Analysis (Nov 26)" →
Dashboard (read-only) → Browse entities →
Click "orders.csv" → Detailed Attribute View → Review Column Statistics tab →
Review per-column profiling results →
[Back to Dashboard] → [Export Attribute Report]
```

### **Journey 4: Explore Historical Jobs**
```
Home → Top Nav: [History] →
History Screen:
  • See list of all profiling jobs
  • Filter by date range
  • Sort by completion time
  • Click [View] on "Customer Analysis - Nov 20" →
Dashboard: View completed job results
```

### **Journey 5: Large File with Sampling**
```
Home → [+ New Profiling Job] →
Step 1: Upload large_dataset.csv (500MB, 10M rows) → [Next] →
Step 2: Enter job name: "Large Dataset Sample" → [Next] →
Step 3: Sample Size: 10000 (profile only 10K rows to save time) → [Start Profiling] →
Dashboard: See results for 10K row sample →
Detailed Attribute View: Analyze sampled data quality column-by-column
```

## Current Implementation Status

### ✅ Fully Implemented
- All 5 screens with routing and navigation
- 3-step configuration wizard for CSV files
- CSV file upload integration with backend (`POST /api/v1/upload`)
- Job creation API integration (`POST /api/v1/jobs`)
- Navigation flow between all screens
- File upload with progress indication
- Job name validation
- Delimiter and header configuration
- Sample size option
- Responsive layout and styling

### 🔄 Partially Implemented (Uses Mock Data)
- Dashboard visualizations (charts show static data)
- Entity summary cards (mock quality scores)
- Detailed Attribute View tabs (mock column statistics)
- Quality grade calculations (Gold/Silver/Bronze badges are hardcoded)
- Backend API endpoints exist but profiling logic not implemented
- Job progress tracking UI ready but not connected to real-time updates

### 📋 Future Enhancements (Not Yet Started)
- **Data Sources**:
  - Database connections (Oracle, PostgreSQL)
  - Data Lake API profiling
  - Additional file formats (JSON, XML, Excel)
- **Profiling Engine**:
  - Actual dataset-level rules implementation (4 rules)
  - Actual attribute-level rules implementation (8 rules per column)
  - Real quality score calculations
  - PII detection algorithms
  - Pattern recognition engine
  - Candidate key discovery
  - Referential integrity checks
- **UI Features**:
  - Real-time job progress tracking with WebSockets
  - Advanced filtering and search in entity list
  - Result export functionality (JSON/CSV/PDF)
  - Historical comparison between profiling runs
  - Column-specific profiling (select specific columns)
  - Custom quality rules configuration
  - Interactive chart drill-downs
  - Data lineage visualization
- **Backend Features**:
  - Enhanced filesystem storage with compression
  - Job queue and background processing
  - Concurrent job execution
  - Job resumption after failures
  - Result retention and archival with automatic cleanup
  - Filesystem indexing for faster result retrieval
- **Security & Management**:
  - User authentication and authorization
  - Role-based access control (RBAC)
  - Encrypted credential storage
  - Audit logging
  - API rate limiting

---

## API Endpoints Used

| Screen | Endpoint | Method | Purpose |
|--------|----------|--------|---------|
| Configuration Step 1 | `/api/v1/upload` | POST | Upload CSV files |
| Configuration Step 3 | `/api/v1/jobs` | POST | Create profiling job |
| Dashboard | `/api/v1/jobs/{jobId}` | GET | Get job details |
| Dashboard | `/api/v1/jobs/{jobId}/results` | GET | Get job results |
| Detailed Attribute View | `/api/v1/results/entity/{entityId}` | GET | Get entity profile (column-by-column) |
| History | `/api/v1/jobs` | GET | List all jobs |
| History | `/api/v1/jobs/{jobId}` | DELETE | Delete job |

---

## Data Flow

1. **User uploads CSV files** → Files sent to backend → File IDs returned
2. **User configures job** → Job details captured in form state
3. **User starts profiling** → Job creation request sent to backend → Job ID returned
4. **Backend processes files** → Profiling engine analyzes CSV data
5. **Results stored in filesystem** → Hierarchical JSON files in `profiling_results/{job_id}/` → Job status updated to "Completed"
6. **User views results** → Frontend fetches results from API (reads from filesystem) → Displays in Dashboard/Detailed Attribute View
