"""File-based data connector for CSV, JSON, Parquet, etc."""
import pandas as pd
from typing import List, Dict, Any
from pathlib import Path
from .base import DataConnector


class FileConnector(DataConnector):
    """Connector for flat files (CSV, JSON, Parquet, Excel)"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.file_path = Path(config["file_path"])
    
    def connect(self):
        """No connection needed for files"""
        pass
    
    def disconnect(self):
        """No disconnection needed for files"""
        pass
    
    def get_tables(self) -> List[str]:
        """Return the file name as the table name"""
        return [self.file_path.name]
    
    def read_data(self, table_name: str = None, sample_size: int = None) -> pd.DataFrame:
        """Read data from file"""
        file_extension = self.file_path.suffix.lower()
        
        # Read based on file type
        if file_extension == ".csv":
            df = pd.read_csv(self.file_path, nrows=sample_size)
        elif file_extension == ".json":
            df = pd.read_json(self.file_path, lines=True if "jsonl" in str(self.file_path) else False)
            if sample_size:
                df = df.head(sample_size)
        elif file_extension in [".parquet", ".pq"]:
            df = pd.read_parquet(self.file_path)
            if sample_size:
                df = df.head(sample_size)
        elif file_extension in [".xlsx", ".xls"]:
            df = pd.read_excel(self.file_path, nrows=sample_size)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")
        
        return df
    
    def test_connection(self) -> bool:
        """Test if file exists and is readable"""
        try:
            if not self.file_path.exists():
                return False
            # Try to read first row
            self.read_data(sample_size=1)
            return True
        except Exception:
            return False
