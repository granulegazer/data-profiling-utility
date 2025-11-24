# Data Profiling Utility

A scalable data profiling platform for large and diverse datasets from data lakes, databases, and semi-structured files. Supports enterprise-style profiling rules and custom rules, delivering deep insights into data quality, patterns, completeness, and overall readiness.

## Features

### Backend (Python + FastAPI)
- **Multiple Data Source Connectors**:
  - Oracle Database
  - PostgreSQL
  - Flat Files (CSV, JSON, Parquet, Excel)
  - REST APIs / Data Lakes
- **Enterprise-Grade Profiling Rules**:
  - Completeness checks
  - Uniqueness analysis
  - Validity checks
  - Consistency checks
  - Accuracy checks (outlier detection)
- **Custom Profiling Rules**:
  - Email pattern detection
  - Phone number pattern detection
  - Date pattern validation
  - Numeric range validation
- **Statistical Analysis**:
  - Basic statistics (min, max, mean, median, std dev)
  - Distribution analysis
  - Pattern recognition
  - Top values frequency
- **Results Storage**: SQLite database (easily configurable for PostgreSQL/MySQL)

### Frontend (React + Vite)
- **Intuitive Data Source Configuration**: Easy-to-use forms for connecting to various data sources
- **Job Management**: Create, view, and manage profiling jobs
- **Results Visualization**:
  - Aggregated view: Quick overview of profiling results
  - Detailed view: In-depth analysis of each column
- **Quality Issue Tracking**: Visual indicators for data quality problems

## Quick Start

### Prerequisites
- Docker and Docker Compose (recommended)
- OR Python 3.11+ and Node.js 20+ (for local development)

### Option 1: Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/granulegazer/data-profiling-utility.git
cd data-profiling-utility

# Start the application
docker-compose up
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run the server
uvicorn app.main:app --reload
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run the development server
npm run dev
```

## Usage

### 1. Configure Data Source

Navigate to the "Create New Job" tab and:
1. Enter a job name
2. Select your data source type (File, PostgreSQL, Oracle, or API)
3. Provide connection details
4. (Optional) Test the connection
5. Click "Start Profiling"

### 2. View Jobs

Go to the "View Jobs" tab to see all profiling jobs with their status:
- **Pending**: Job is queued
- **Running**: Profiling in progress
- **Completed**: Job finished successfully
- **Failed**: Job encountered an error

### 3. View Results

Click "View Results" on a completed job to see:

**Aggregated View**:
- Overall statistics (total rows, columns)
- Column summary table
- Quick quality indicators

**Detailed View**:
- Complete column-by-column analysis
- Statistical measures
- Pattern analysis
- Quality issues with severity levels
- Top value distributions

## Data Sources

### File Upload
Supported formats:
- CSV
- JSON / JSONL
- Parquet
- Excel (.xlsx, .xls)

### PostgreSQL
Required configuration:
- Host
- Port (default: 5432)
- Database name
- Username
- Password

### Oracle
Required configuration:
- Host
- Port (default: 1521)
- Service name
- Username
- Password

### API / Data Lake
Required configuration:
- Base URL
- Endpoint/dataset name
- (Optional) Authentication headers

## Profiling Rules

### Generic Rules (OEDQ/IDQ Style)

1. **Completeness**: Measures the percentage of non-null values
2. **Uniqueness**: Identifies unique values and duplicates
3. **Validity**: Checks for data type consistency and special characters
4. **Consistency**: Detects case inconsistencies and whitespace issues
5. **Accuracy**: Uses statistical methods to detect outliers

### Custom Rules

1. **Email Pattern**: Validates email address formats
2. **Phone Pattern**: Detects phone number patterns
3. **Date Pattern**: Identifies date formats
4. **Numeric Range**: Validates values within expected ranges

## API Documentation

The backend provides a RESTful API with the following endpoints:

- `POST /api/v1/test-connection`: Test data source connection
- `POST /api/v1/profiling-jobs`: Create a new profiling job
- `GET /api/v1/profiling-jobs`: List all profiling jobs
- `GET /api/v1/profiling-jobs/{job_id}`: Get specific job details
- `GET /api/v1/profiling-jobs/{job_id}/results`: Get profiling results for a job
- `GET /api/v1/profiling-results/{result_id}`: Get detailed result information
- `POST /api/v1/upload-file`: Upload a file for profiling
- `DELETE /api/v1/profiling-jobs/{job_id}`: Delete a profiling job

Full interactive API documentation is available at `/docs` when running the backend.

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=sqlite:///./profiling_results.db
ORACLE_HOST=your-oracle-host
ORACLE_PORT=1521
ORACLE_SERVICE=your-service
ORACLE_USER=your-user
ORACLE_PASSWORD=your-password
POSTGRES_HOST=your-postgres-host
POSTGRES_PORT=5432
POSTGRES_DB=your-database
POSTGRES_USER=your-user
POSTGRES_PASSWORD=your-password
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  (Vite + React + Axios)                                 │
│  - Data Source Configuration                            │
│  - Job Management                                       │
│  - Results Visualization                                │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  FastAPI Backend                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              API Routes                          │   │
│  └────────────┬─────────────────────────────────────┘   │
│               │                                          │
│  ┌────────────▼──────────┐  ┌─────────────────────┐    │
│  │   Profiling Engine    │  │   Data Connectors   │    │
│  │  - Generic Rules      │  │  - Oracle           │    │
│  │  - Custom Rules       │  │  - PostgreSQL       │    │
│  │  - Statistical        │  │  - File             │    │
│  │    Analysis           │  │  - API              │    │
│  └───────────────────────┘  └─────────────────────┘    │
│               │                                          │
│  ┌────────────▼─────────────────────────────────────┐   │
│  │           SQLAlchemy ORM                         │   │
│  └────────────┬─────────────────────────────────────┘   │
└───────────────┼──────────────────────────────────────────┘
                │
                ▼
        ┌───────────────┐
        │   SQLite DB   │
        │   (Results)   │
        └───────────────┘
```

## Development

### Running Tests

```bash
# Backend tests (when implemented)
cd backend
pytest

# Frontend tests (when implemented)
cd frontend
npm test
```

### Code Style

- Backend: Follow PEP 8 guidelines
- Frontend: ESLint configuration included

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or contributions, please open an issue on GitHub.
