"""PostgreSQL database connector"""
import psycopg2
import pandas as pd
from typing import List, Dict, Any
from .base import DataConnector


class PostgresConnector(DataConnector):
    """Connector for PostgreSQL databases"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.connection = None
    
    def connect(self):
        """Establish connection to PostgreSQL database"""
        self.connection = psycopg2.connect(
            host=self.config["host"],
            port=self.config["port"],
            database=self.config["database"],
            user=self.config["user"],
            password=self.config["password"]
        )
    
    def disconnect(self):
        """Close connection to PostgreSQL database"""
        if self.connection:
            self.connection.close()
            self.connection = None
    
    def get_tables(self) -> List[str]:
        """Get list of tables in PostgreSQL database"""
        query = """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
        """
        cursor = self.connection.cursor()
        cursor.execute(query)
        tables = [row[0] for row in cursor.fetchall()]
        cursor.close()
        return tables
    
    def read_data(self, table_name: str, sample_size: int = None) -> pd.DataFrame:
        """Read data from PostgreSQL table"""
        query = f"SELECT * FROM {table_name}"
        if sample_size:
            query += f" LIMIT {sample_size}"
        
        return pd.read_sql(query, self.connection)
    
    def test_connection(self) -> bool:
        """Test PostgreSQL connection"""
        try:
            self.connect()
            cursor = self.connection.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            cursor.close()
            return True
        except Exception:
            return False
        finally:
            self.disconnect()
