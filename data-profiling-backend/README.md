# Data Profiling Backend

FastAPI backend for the Data Profiling Utility application.

## Features

- FastAPI REST API
- PostgreSQL and Oracle database support
- Connection management with encrypted credentials
- Async profiling jobs
- Dataset-level and attribute-level profiling rules
- Real-time progress tracking
- JSON file storage for results

## Setup

### Prerequisites

- Python 3.9+
- Oracle Database (for metadata)
- Redis (for async jobs)

### Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the application:
```bash
python -m app.main
```

Or with uvicorn:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Project Structure

```
app/
├── api/           # API route handlers
├── core/          # Core configuration and security
├── models/        # Pydantic models
├── services/      # Business logic services
└── profiling/     # Profiling engine
```

## Development

Run tests:
```bash
pytest
```

Format code:
```bash
black app/
```

Type checking:
```bash
mypy app/
```
