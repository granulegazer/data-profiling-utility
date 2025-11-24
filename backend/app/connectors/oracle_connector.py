"""Oracle database connector"""
import cx_Oracle
import pandas as pd
from typing import List, Dict, Any
from .base import DataConnector


class OracleConnector(DataConnector):
    """Connector for Oracle databases"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.connection = None
    
    def connect(self):
        """Establish connection to Oracle database"""
        dsn = cx_Oracle.makedsn(
            self.config["host"],
            self.config["port"],
            service_name=self.config["service"]
        )
        self.connection = cx_Oracle.connect(
            user=self.config["user"],
            password=self.config["password"],
            dsn=dsn
        )
    
    def disconnect(self):
        """Close connection to Oracle database"""
        if self.connection:
            self.connection.close()
            self.connection = None
    
    def get_tables(self) -> List[str]:
        """Get list of tables in Oracle database"""
        query = """
        SELECT table_name 
        FROM user_tables 
        ORDER BY table_name
        """
        cursor = self.connection.cursor()
        cursor.execute(query)
        tables = [row[0] for row in cursor.fetchall()]
        cursor.close()
        return tables
    
    def read_data(self, table_name: str, sample_size: int = None) -> pd.DataFrame:
        """Read data from Oracle table"""
        query = f"SELECT * FROM {table_name}"
        if sample_size:
            query += f" WHERE ROWNUM <= {sample_size}"
        
        return pd.read_sql(query, self.connection)
    
    def test_connection(self) -> bool:
        """Test Oracle connection"""
        try:
            self.connect()
            cursor = self.connection.cursor()
            cursor.execute("SELECT 1 FROM DUAL")
            cursor.fetchone()
            cursor.close()
            return True
        except Exception:
            return False
        finally:
            self.disconnect()
