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
        # Sanitize table name to prevent SQL injection
        from psycopg2 import sql
        
        if sample_size:
            query = sql.SQL("SELECT * FROM {} LIMIT %s").format(
                sql.Identifier(table_name)
            )
            return pd.read_sql(query.as_string(self.connection), self.connection, params=[sample_size])
        else:
            query = sql.SQL("SELECT * FROM {}").format(
                sql.Identifier(table_name)
            )
            return pd.read_sql(query.as_string(self.connection), self.connection)
    
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
