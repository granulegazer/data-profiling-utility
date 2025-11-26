# Data Profiling Utility - Screen Flow & Functionalities

## Overview
The Data Profiling Utility consists of 5 main screens designed for CSV file profiling with a simple, intuitive workflow.

---

## Screen Navigation Flow

```
Home → Configuration (3 Steps) → Dashboard → Entity View
  ↓                                    ↓
History ←──────────────────────────────┘
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

#### **Step 1: Data Source Setup**

**Components**:
- **Connection Type Selector**
  - Options: Database, Data Lake, Flat File (CSV)
  - Currently only "Flat File" is functional
  
- **File Upload Area** (for Flat File)
  - Drag-and-drop zone (visual only)
  - "Upload CSV Files" button → Opens file picker
  - Accepts: `.csv` files only (multiple selection enabled)
  - Shows upload progress indicator
  - Displays list of successfully uploaded files with size

**Functionality**:
- Select CSV files from local system
- Upload files to backend `/api/v1/upload` endpoint
- Files stored on server, file IDs returned
- Uploaded files list updated in real-time

**Navigation**:
- "Cancel" → Navigate to Home `/`
- "Next →" → Step 2 (only if files uploaded)

---

#### **Step 2: Dataset & Entity Selection**

**Purpose**: Configure job details and CSV parsing options

**Components**:
- **Job Name** (Required)
  - Text input for job identification
  - Placeholder: "e.g., Customer Data Profiling"
  
- **Uploaded Files List**
  - Shows all uploaded CSV files
  - For each file:
    - File name and size
    - **Delimiter** input (default: `,`)
    - **Has header row** checkbox (default: checked)
  
- **Add More Files** button
  - Opens file picker to upload additional CSV files

**Functionality**:
- Enter descriptive job name
- Configure CSV parsing per file:
  - Set delimiter (comma, tab, semicolon, etc.)
  - Specify if first row contains headers
- Add more files if needed
- Validation: Job name must not be empty

**Navigation**:
- "← Back" → Step 1
- "Next →" → Step 3 (requires job name)

---

#### **Step 3: Profiling Options**

**Purpose**: Configure what and how much to profile

**Components**:
- **Column Selection**
  - Radio button: "Profile All Columns" (default)
  - Radio button: "Select Specific Columns" (future)
  
- **Sample Size** (for CSV files)
  - Number input
  - Placeholder: "Leave empty to profile entire file"
  - Optional: If empty, profiles all rows

**Functionality**:
- Choose to profile all columns or select specific ones
- Set sample size to limit rows profiled (for large files)
- Validation happens on "Start Profiling"

**Navigation**:
- "← Back" → Step 2
- "Start Profiling" → Creates job via API → Navigate to `/dashboard/{jobId}`

**API Integration**:
- Calls `POST /api/v1/jobs` with:
  ```json
  {
    "name": "Job Name",
    "description": "Profiling N CSV file(s)",
    "file_paths": ["file_id_1", "file_id_2"],
    "csv_config": {
      "delimiter": ",",
      "encoding": "utf-8",
      "has_header": true
    },
    "treat_files_as_dataset": true,
    "sample_size": null
  }
  ```

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
  - Click card → Navigate to Entity View

- **Quality Distribution Chart**
  - Pie/donut chart showing quality grade distribution
  - Legend: Gold (90-100%), Silver (70-89%), Bronze (50-69%), Red (<50%)

- **Entity Table**
  - Lists all profiled datasets/entities
  - Columns: Entity Name, Row Count, Column Count, Quality Grade, Last Profiled
  - Click row → Navigate to Entity View

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

### 4. Entity View Screen (`/entity/{entityId}`)

**Purpose**: Detailed profiling results for a specific dataset/entity

**Components**:
- **Entity Header**
  - Entity name
  - Quality badge
  - Quick stats (Row Count, Column Count, Quality Score)

- **7 Tabs with Detailed Information**:

#### Tab 1: **Overview**
- Dataset summary statistics
- File size, row count, column count
- Profiling timestamp
- Overall quality score

#### Tab 2: **Column Statistics**
- Table with all columns
- For each column:
  - Column name
  - Data type
  - Null count & percentage
  - Unique count & percentage
  - Min/Max values
  - Mean, Median, Std Dev (for numeric)
  - Top N most frequent values

#### Tab 3: **Data Quality**
- Quality rules execution results
- Dataset-level rules (4 rules):
  - Row count validation
  - Duplicate row detection
  - Column count validation
  - File size checks
- Column-level issues summary

#### Tab 4: **Patterns & Formats**
- Data pattern detection
- Format validation (emails, phones, dates, etc.)
- Regular expression matches
- Pattern frequency distribution

#### Tab 5: **Data Integrity**
- Referential integrity checks (future)
- Cross-column validations
- Business rule violations
- Consistency checks

#### Tab 6: **Keys & Uniqueness**
- Primary key candidates
- Unique key detection
- Duplicate value analysis
- Cardinality metrics

#### Tab 7: **PII Detection**
- Personal Identifiable Information detection
- Sensitive data patterns
- Column-level PII classification
- Compliance indicators (GDPR, CCPA)

**Functionality**:
- Deep dive into dataset quality
- Analyze column-level statistics
- Review quality rule violations
- Identify PII and sensitive data
- Export results (future)

**Navigation**:
- Click tab → Switch view
- "← Back to Dashboard" → `/dashboard/{jobId}`
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

## Current Implementation Status

### ✅ Fully Implemented
- All 5 screens with routing
- 3-step configuration wizard
- CSV file upload integration with backend
- Job creation API integration
- Navigation flow between all screens

### 🔄 Partially Implemented
- Dashboard and Entity View use mock data
- Backend API endpoints exist but need profiling logic
- Quality calculations pending

### 📋 Future Enhancements
- Database and Data Lake connections
- Real-time job progress tracking
- Advanced filtering and search
- Result export functionality
- PII detection algorithms
- Pattern recognition engine
- Custom quality rules configuration

---

## API Endpoints Used

| Screen | Endpoint | Method | Purpose |
|--------|----------|--------|---------|
| Configuration Step 1 | `/api/v1/upload` | POST | Upload CSV files |
| Configuration Step 3 | `/api/v1/jobs` | POST | Create profiling job |
| Dashboard | `/api/v1/jobs/{jobId}` | GET | Get job details |
| Dashboard | `/api/v1/jobs/{jobId}/results` | GET | Get job results |
| Entity View | `/api/v1/results/entity/{entityId}` | GET | Get entity profile |
| History | `/api/v1/jobs` | GET | List all jobs |
| History | `/api/v1/jobs/{jobId}` | DELETE | Delete job |

---

## Data Flow

1. **User uploads CSV files** → Files sent to backend → File IDs returned
2. **User configures job** → Job details captured in form state
3. **User starts profiling** → Job creation request sent to backend → Job ID returned
4. **Backend processes files** → Profiling engine analyzes CSV data
5. **Results stored** → Job status updated to "Completed"
6. **User views results** → Frontend fetches results from API → Displays in Dashboard/Entity View
