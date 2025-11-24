"""Base connector interface"""
from abc import ABC, abstractmethod
import pandas as pd
from typing import Dict, Any, List


class DataConnector(ABC):
    """Abstract base class for data connectors"""
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize connector with configuration"""
        self.config = config
    
    @abstractmethod
    def connect(self):
        """Establish connection to data source"""
        pass
    
    @abstractmethod
    def disconnect(self):
        """Close connection to data source"""
        pass
    
    @abstractmethod
    def get_tables(self) -> List[str]:
        """Get list of available tables/datasets"""
        pass
    
    @abstractmethod
    def read_data(self, table_name: str, sample_size: int = None) -> pd.DataFrame:
        """Read data from source into DataFrame"""
        pass
    
    @abstractmethod
    def test_connection(self) -> bool:
        """Test if connection is valid"""
        pass
