"""
資料庫操作工具
用於儲存和查詢籌碼分析資料
"""
import sqlite3
import pandas as pd
import logging
from pathlib import Path
import sys
import os
from typing import List, Optional, Dict, Any

# 添加專案根目錄到路徑
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from config import *

class ChipDatabase:
    """籌碼分析資料庫管理器"""
    
    def __init__(self, db_path: str = None):
        if db_path is None:
            db_path = PROJECT_ROOT / DB_PATH
        
        self.db_path = Path(db_path)
        self.logger = logging.getLogger(__name__)
        
        # 確保資料庫目錄存在
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        # 初始化資料庫
        self.init_database()
    
    def get_connection(self) -> sqlite3.Connection:
        """取得資料庫連線"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # 使結果可以用欄位名稱存取
        return conn
    
    def init_database(self):
        """初始化資料庫表格"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # 券商分點交易表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS broker_trading (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    stock_code TEXT NOT NULL,
                    broker_code TEXT NOT NULL,
                    branch_name TEXT NOT NULL,
                    buy_volume INTEGER DEFAULT 0,
                    sell_volume INTEGER DEFAULT 0,
                    buy_amount INTEGER DEFAULT 0,
                    sell_amount INTEGER DEFAULT 0,
                    net_volume INTEGER GENERATED ALWAYS AS (buy_volume - sell_volume),
                    net_amount INTEGER GENERATED ALWAYS AS (buy_amount - sell_amount),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(date, stock_code, broker_code, branch_name)
                )
            ''')
            
            # 每日統計摘要表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS daily_summary (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    stock_code TEXT NOT NULL,
                    total_volume INTEGER DEFAULT 0,
                    total_amount INTEGER DEFAULT 0,
                    broker_count INTEGER DEFAULT 0,
                    branch_count INTEGER DEFAULT 0,
                    top_buyer_broker TEXT,
                    top_seller_broker TEXT,
                    unusual_activity_count INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(date, stock_code)
                )
            ''')
            
            # 異常交易記錄表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS unusual_trading (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    stock_code TEXT NOT NULL,
                    broker_code TEXT NOT NULL,
                    branch_name TEXT NOT NULL,
                    net_volume INTEGER NOT NULL,
                    net_amount INTEGER NOT NULL,
                    anomaly_score REAL NOT NULL,
                    anomaly_type TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # 建立索引
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_broker_date_stock ON broker_trading(date, stock_code)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_daily_date_stock ON daily_summary(date, stock_code)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_unusual_date_stock ON unusual_trading(date, stock_code)')
            
            conn.commit()
            conn.close()
            
            self.logger.info("資料庫初始化完成")
            
        except sqlite3.Error as e:
            self.logger.error(f"資料庫初始化失敗: {e}")
    
    def insert_broker_data(self, df: pd.DataFrame) -> int:
        """
        插入券商分點資料
        
        Args:
            df: 包含券商分點資料的 DataFrame
            
        Returns:
            插入的記錄數量
        """
        try:
            conn = self.get_connection()
            
            # 準備資料
            records = []
            for _, row in df.iterrows():
                record = (
                    row.get('date', ''),
                    row.get('stock_code', ''),
                    row.get('券商', ''),
                    row.get('分點', ''),
                    int(row.get('買進股數', 0)),
                    int(row.get('賣出股數', 0)),
                    int(row.get('買進金額', 0)),
                    int(row.get('賣出金額', 0))
                )
                records.append(record)
            
            # 執行批量插入
            cursor = conn.cursor()
            cursor.executemany('''
                INSERT OR REPLACE INTO broker_trading 
                (date, stock_code, broker_code, branch_name, buy_volume, sell_volume, buy_amount, sell_amount)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', records)
            
            inserted_count = cursor.rowcount
            conn.commit()
            conn.close()
            
            self.logger.info(f"成功插入 {inserted_count} 筆券商資料")
            return inserted_count
            
        except Exception as e:
            self.logger.error(f"插入券商資料失敗: {e}")
            return 0
    
    def get_broker_data(self, stock_code: str = None, date: str = None, 
                       start_date: str = None, end_date: str = None) -> pd.DataFrame:
        """
        查詢券商分點資料
        
        Args:
            stock_code: 股票代碼
            date: 特定日期
            start_date: 起始日期
            end_date: 結束日期
            
        Returns:
            券商分點資料 DataFrame
        """
        try:
            conn = self.get_connection()
            
            # 建立查詢條件
            conditions = []
            params = []
            
            if stock_code:
                conditions.append("stock_code = ?")
                params.append(stock_code)
            
            if date:
                conditions.append("date = ?")
                params.append(date)
            elif start_date and end_date:
                conditions.append("date BETWEEN ? AND ?")
                params.extend([start_date, end_date])
            elif start_date:
                conditions.append("date >= ?")
                params.append(start_date)
            elif end_date:
                conditions.append("date <= ?")
                params.append(end_date)
            
            where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
            
            query = f'''
                SELECT date, stock_code, broker_code, branch_name,
                       buy_volume, sell_volume, buy_amount, sell_amount,
                       net_volume, net_amount
                FROM broker_trading
                {where_clause}
                ORDER BY date DESC, net_volume DESC
            '''
            
            df = pd.read_sql_query(query, conn, params=params)
            conn.close()
            
            self.logger.info(f"查詢到 {len(df)} 筆券商資料")
            return df
            
        except Exception as e:
            self.logger.error(f"查詢券商資料失敗: {e}")
            return pd.DataFrame()
    
    def insert_daily_summary(self, summary_data: Dict[str, Any]) -> bool:
        """插入每日統計摘要"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO daily_summary 
                (date, stock_code, total_volume, total_amount, broker_count, branch_count,
                 top_buyer_broker, top_seller_broker, unusual_activity_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                summary_data.get('date'),
                summary_data.get('stock_code'),
                summary_data.get('total_volume', 0),
                summary_data.get('total_amount', 0),
                summary_data.get('broker_count', 0),
                summary_data.get('branch_count', 0),
                summary_data.get('top_buyer_broker'),
                summary_data.get('top_seller_broker'),
                summary_data.get('unusual_activity_count', 0)
            ))
            
            conn.commit()
            conn.close()
            
            self.logger.info("每日摘要插入成功")
            return True
            
        except Exception as e:
            self.logger.error(f"插入每日摘要失敗: {e}")
            return False
    
    def get_top_brokers(self, stock_code: str = None, days: int = 30, limit: int = 20) -> pd.DataFrame:
        """
        查詢熱門券商排行
        
        Args:
            stock_code: 股票代碼
            days: 查詢天數
            limit: 回傳數量限制
            
        Returns:
            券商排行 DataFrame
        """
        try:
            conn = self.get_connection()
            
            # 計算起始日期
            from datetime import datetime, timedelta
            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
            
            conditions = ["date BETWEEN ? AND ?"]
            params = [start_date, end_date]
            
            if stock_code:
                conditions.append("stock_code = ?")
                params.append(stock_code)
            
            where_clause = " WHERE " + " AND ".join(conditions)
            
            query = f'''
                SELECT broker_code,
                       SUM(buy_volume) as total_buy_volume,
                       SUM(sell_volume) as total_sell_volume,
                       SUM(buy_amount) as total_buy_amount,
                       SUM(sell_amount) as total_sell_amount,
                       SUM(net_volume) as total_net_volume,
                       SUM(net_amount) as total_net_amount,
                       COUNT(DISTINCT branch_name) as branch_count,
                       COUNT(*) as trading_days
                FROM broker_trading
                {where_clause}
                GROUP BY broker_code
                ORDER BY ABS(total_net_amount) DESC
                LIMIT ?
            '''
            
            params.append(limit)
            df = pd.read_sql_query(query, conn, params=params)
            conn.close()
            
            return df
            
        except Exception as e:
            self.logger.error(f"查詢熱門券商失敗: {e}")
            return pd.DataFrame()
    
    def cleanup_old_data(self, days_to_keep: int = 365) -> int:
        """清理舊資料"""
        try:
            from datetime import datetime, timedelta
            cutoff_date = (datetime.now() - timedelta(days=days_to_keep)).strftime('%Y-%m-%d')
            
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # 刪除舊的券商交易資料
            cursor.execute("DELETE FROM broker_trading WHERE date < ?", (cutoff_date,))
            broker_deleted = cursor.rowcount
            
            # 刪除舊的每日摘要
            cursor.execute("DELETE FROM daily_summary WHERE date < ?", (cutoff_date,))
            summary_deleted = cursor.rowcount
            
            # 刪除舊的異常交易記錄
            cursor.execute("DELETE FROM unusual_trading WHERE date < ?", (cutoff_date,))
            unusual_deleted = cursor.rowcount
            
            conn.commit()
            conn.close()
            
            total_deleted = broker_deleted + summary_deleted + unusual_deleted
            self.logger.info(f"清理完成，刪除 {total_deleted} 筆舊資料")
            
            return total_deleted
            
        except Exception as e:
            self.logger.error(f"清理資料失敗: {e}")
            return 0

if __name__ == "__main__":
    # 測試資料庫功能
    db = ChipDatabase()
    
    # 建立測試資料
    import numpy as np
    test_data = pd.DataFrame({
        'date': ['2025-01-01'] * 5,
        'stock_code': ['2330'] * 5,
        '券商': ['9800', '9600', '9900', '1160', '5850'],
        '分點': ['總公司', '台北', '新竹', '台中', '高雄'],
        '買進股數': np.random.randint(1000, 50000, 5),
        '賣出股數': np.random.randint(1000, 50000, 5),
        '買進金額': np.random.randint(100000, 5000000, 5),
        '賣出金額': np.random.randint(100000, 5000000, 5)
    })
    
    # 測試插入資料
    count = db.insert_broker_data(test_data)
    print(f"插入了 {count} 筆測試資料")
    
    # 測試查詢資料
    result = db.get_broker_data(stock_code='2330')
    print(f"查詢結果: {len(result)} 筆資料")
    print(result.head())