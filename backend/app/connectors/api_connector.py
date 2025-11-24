"""API-based data connector for data lakes and REST APIs"""
import httpx
import pandas as pd
from typing import List, Dict, Any
from .base import DataConnector


class APIConnector(DataConnector):
    """Connector for REST API data sources"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.base_url = config["base_url"]
        self.headers = config.get("headers", {})
        self.auth = config.get("auth")
    
    def connect(self):
        """No persistent connection needed for API"""
        pass
    
    def disconnect(self):
        """No disconnection needed for API"""
        pass
    
    def get_tables(self) -> List[str]:
        """Get available endpoints/datasets from API"""
        # This is a simplified implementation
        # In reality, this would query the API's metadata endpoint
        endpoints = self.config.get("endpoints", [])
        return endpoints
    
    def read_data(self, table_name: str, sample_size: int = None) -> pd.DataFrame:
        """Fetch data from API endpoint"""
        url = f"{self.base_url}/{table_name}"
        params = {}
        if sample_size:
            params["limit"] = sample_size
        
        with httpx.Client() as client:
            response = client.get(
                url,
                headers=self.headers,
                params=params,
                auth=self.auth,
                timeout=60.0
            )
            response.raise_for_status()
            data = response.json()
        
        # Handle different response formats
        if isinstance(data, list):
            df = pd.DataFrame(data)
        elif isinstance(data, dict):
            # Assume data is in a 'data' or 'results' key
            if "data" in data:
                df = pd.DataFrame(data["data"])
            elif "results" in data:
                df = pd.DataFrame(data["results"])
            else:
                df = pd.DataFrame([data])
        else:
            raise ValueError("Unsupported API response format")
        
        return df
    
    def test_connection(self) -> bool:
        """Test API connection"""
        try:
            with httpx.Client() as client:
                response = client.get(
                    self.base_url,
                    headers=self.headers,
                    auth=self.auth,
                    timeout=10.0
                )
                return response.status_code < 400
        except Exception:
            return False
