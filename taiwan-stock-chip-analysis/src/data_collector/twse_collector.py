"""
台灣證券交易所 (TWSE) 資料收集器
負責從證交所 API 抓取券商分點進出資料
"""
import requests
import pandas as pd
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import sys
import os

# 添加專案根目錄到路徑
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from config import *

class TWSECollector:
    """台灣證券交易所資料收集器"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # 設定日誌
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
    def get_stock_day_trading(self, stock_code: str, date: str = None) -> Optional[Dict]:
        """
        取得個股當日交易資訊
        
        Args:
            stock_code: 股票代碼
            date: 日期 (YYYY-MM-DD)，預設為今天
        
        Returns:
            股票交易資料字典
        """
        if not date:
            date = datetime.now().strftime('%Y%m%d')
        else:
            date = date.replace('-', '')
            
        url = f"{TWSE_API_BASE}/exchangeReport/STOCK_DAY"
        params = {
            'response': 'json',
            'date': date,
            'stockNo': stock_code
        }
        
        try:
            self.logger.info(f"正在抓取股票 {stock_code} 於 {date} 的交易資料...")
            response = self.session.get(url, params=params, timeout=TIMEOUT)
            response.raise_for_status()
            
            data = response.json()
            if data.get('stat') == 'OK':
                return data
            else:
                self.logger.warning(f"API 回應異常: {data.get('stat', 'Unknown')}")
                return None
                
        except requests.exceptions.RequestException as e:
            self.logger.error(f"請求失敗: {e}")
            return None
        except ValueError as e:
            self.logger.error(f"JSON 解析失敗: {e}")
            return None
            
    def get_broker_trading_detail(self, stock_code: str, date: str = None) -> Optional[pd.DataFrame]:
        """
        取得券商分點進出明細
        
        Args:
            stock_code: 股票代碼
            date: 日期 (YYYY-MM-DD)
            
        Returns:
            券商分點資料 DataFrame
        """
        if not date:
            date = datetime.now().strftime('%Y%m%d')
        else:
            date = date.replace('-', '')
            
        # TWSE 的券商分點資料 API
        url = "https://www.twse.com.tw/exchangeReport/BFIAMU"
        params = {
            'response': 'json',
            'date': date,
            'stockNo': stock_code
        }
        
        try:
            self.logger.info(f"正在抓取股票 {stock_code} 券商分點資料...")
            time.sleep(REQUEST_DELAY)  # 避免請求過快
            
            response = self.session.get(url, params=params, timeout=TIMEOUT)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('stat') == 'OK' and 'data' in data:
                # 轉換為 DataFrame
                df = pd.DataFrame(data['data'], columns=data.get('fields', []))
                df['date'] = date
                df['stock_code'] = stock_code
                return df
            else:
                self.logger.warning(f"無券商資料: {stock_code} - {date}")
                return None
                
        except requests.exceptions.RequestException as e:
            self.logger.error(f"請求失敗: {e}")
            return None
        except Exception as e:
            self.logger.error(f"資料處理失敗: {e}")
            return None
    
    def get_institutional_trading(self, date: str = None) -> Optional[pd.DataFrame]:
        """
        取得三大法人買賣超資料
        
        Args:
            date: 日期 (YYYY-MM-DD)
            
        Returns:
            三大法人資料 DataFrame
        """
        if not date:
            date = datetime.now().strftime('%Y%m%d')
        else:
            date = date.replace('-', '')
            
        url = f"{TWSE_API_BASE}/fund/BFI82U"
        params = {
            'response': 'json',
            'date': date
        }
        
        try:
            self.logger.info(f"正在抓取三大法人買賣超資料 {date}...")
            response = self.session.get(url, params=params, timeout=TIMEOUT)
            response.raise_for_status()
            
            data = response.json()
            if data.get('stat') == 'OK' and 'data' in data:
                df = pd.DataFrame(data['data'], columns=data.get('fields', []))
                df['date'] = date
                return df
            else:
                self.logger.warning(f"無三大法人資料: {date}")
                return None
                
        except Exception as e:
            self.logger.error(f"取得三大法人資料失敗: {e}")
            return None
    
    def collect_batch_data(self, stock_codes: List[str], start_date: str, end_date: str) -> Dict[str, pd.DataFrame]:
        """
        批量收集多檔股票的資料
        
        Args:
            stock_codes: 股票代碼列表
            start_date: 開始日期 (YYYY-MM-DD)
            end_date: 結束日期 (YYYY-MM-DD)
            
        Returns:
            {stock_code: DataFrame} 的字典
        """
        results = {}
        
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        
        for stock_code in stock_codes:
            self.logger.info(f"開始收集股票 {stock_code} 的資料...")
            stock_data = []
            
            current_date = start_dt
            while current_date <= end_dt:
                date_str = current_date.strftime('%Y-%m-%d')
                
                # 跳過週末
                if current_date.weekday() < 5:  # Monday is 0, Sunday is 6
                    broker_data = self.get_broker_trading_detail(stock_code, date_str)
                    if broker_data is not None and not broker_data.empty:
                        stock_data.append(broker_data)
                
                current_date += timedelta(days=1)
                time.sleep(REQUEST_DELAY)  # 控制請求頻率
            
            if stock_data:
                results[stock_code] = pd.concat(stock_data, ignore_index=True)
                self.logger.info(f"股票 {stock_code} 收集完成，共 {len(results[stock_code])} 筆資料")
            else:
                self.logger.warning(f"股票 {stock_code} 無資料")
        
        return results
    
    def save_to_csv(self, data: pd.DataFrame, filename: str):
        """儲存資料到 CSV"""
        filepath = RAW_DATA_DIR / f"{filename}.csv"
        data.to_csv(filepath, index=False, encoding='utf-8-sig')
        self.logger.info(f"資料已儲存到 {filepath}")

if __name__ == "__main__":
    # 測試程式
    collector = TWSECollector()
    
    # 測試抓取台積電的券商分點資料
    test_data = collector.get_broker_trading_detail("2330")
    if test_data is not None:
        print("券商分點資料範例:")
        print(test_data.head())
        
        # 儲存測試資料
        collector.save_to_csv(test_data, "test_broker_data_2330")