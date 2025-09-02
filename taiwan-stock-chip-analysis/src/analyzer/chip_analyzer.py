"""
籌碼分析器
分析券商分點進出資料，找出主力動向和異常交易
"""
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
import logging
import sys
import os
from typing import Dict, List, Tuple, Optional

# 添加專案根目錄到路徑
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from config import *

class ChipAnalyzer:
    """籌碼分析器類別"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei']  # 設定中文字體
        plt.rcParams['axes.unicode_minus'] = False
        
    def load_data(self, filepath: str) -> pd.DataFrame:
        """載入券商分點資料"""
        try:
            data = pd.read_csv(filepath, encoding='utf-8-sig')
            self.logger.info(f"成功載入資料: {filepath}")
            return data
        except Exception as e:
            self.logger.error(f"載入資料失敗: {e}")
            return pd.DataFrame()
    
    def clean_broker_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        清理券商資料
        - 移除無效資料
        - 轉換資料型態
        - 計算淨買賣量
        """
        if df.empty:
            return df
            
        try:
            # 假設資料欄位 (需根據實際 API 回傳調整)
            required_columns = ['券商', '分點', '買進股數', '賣出股數', '買進金額', '賣出金額']
            
            # 檢查必要欄位
            missing_cols = [col for col in required_columns if col not in df.columns]
            if missing_cols:
                self.logger.warning(f"缺少欄位: {missing_cols}")
            
            # 轉換數值型態
            numeric_columns = ['買進股數', '賣出股數', '買進金額', '賣出金額']
            for col in numeric_columns:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col].astype(str).str.replace(',', ''), errors='coerce').fillna(0)
            
            # 計算淨買賣量和金額
            if '買進股數' in df.columns and '賣出股數' in df.columns:
                df['淨買賣股數'] = df['買進股數'] - df['賣出股數']
            
            if '買進金額' in df.columns and '賣出金額' in df.columns:
                df['淨買賣金額'] = df['買進金額'] - df['賣出金額']
            
            # 移除全零的資料
            df = df[(df['買進股數'] > 0) | (df['賣出股數'] > 0)]
            
            self.logger.info(f"資料清理完成，剩餘 {len(df)} 筆資料")
            return df
            
        except Exception as e:
            self.logger.error(f"資料清理失敗: {e}")
            return df
    
    def analyze_top_brokers(self, df: pd.DataFrame, top_n: int = 20) -> pd.DataFrame:
        """
        分析主要券商排行
        
        Args:
            df: 券商資料
            top_n: 前 N 名券商
            
        Returns:
            主要券商統計資料
        """
        if df.empty or '券商' not in df.columns:
            return pd.DataFrame()
        
        try:
            # 依券商群組統計
            broker_stats = df.groupby('券商').agg({
                '買進股數': 'sum',
                '賣出股數': 'sum', 
                '買進金額': 'sum',
                '賣出金額': 'sum',
                '淨買賣股數': 'sum',
                '淨買賣金額': 'sum',
                '分點': 'count'  # 分點數量
            }).reset_index()
            
            # 重新命名欄位
            broker_stats.rename(columns={'分點': '分點數量'}, inplace=True)
            
            # 計算總交易量 (買進 + 賣出)
            broker_stats['總交易股數'] = broker_stats['買進股數'] + broker_stats['賣出股數']
            broker_stats['總交易金額'] = broker_stats['買進金額'] + broker_stats['賣出金額']
            
            # 依總交易量排序
            broker_stats = broker_stats.sort_values('總交易金額', ascending=False).head(top_n)
            
            # 加入券商名稱
            broker_stats['券商名稱'] = broker_stats['券商'].map(BROKER_MAPPING).fillna('未知券商')
            
            self.logger.info(f"完成前 {top_n} 券商分析")
            return broker_stats
            
        except Exception as e:
            self.logger.error(f"券商分析失敗: {e}")
            return pd.DataFrame()
    
    def analyze_branch_activity(self, df: pd.DataFrame, min_volume: int = None) -> pd.DataFrame:
        """
        分析分點活躍度
        
        Args:
            df: 券商資料
            min_volume: 最小交易量門檻
            
        Returns:
            分點活躍度統計
        """
        if min_volume is None:
            min_volume = MINIMUM_VOLUME_THRESHOLD
            
        try:
            # 依分點群組統計
            branch_stats = df.groupby(['券商', '分點']).agg({
                '買進股數': 'sum',
                '賣出股數': 'sum',
                '淨買賣股數': 'sum',
                '淨買賣金額': 'sum'
            }).reset_index()
            
            # 計算總交易量
            branch_stats['總交易股數'] = branch_stats['買進股數'] + branch_stats['賣出股數']
            
            # 過濾小額交易
            branch_stats = branch_stats[branch_stats['總交易股數'] >= min_volume]
            
            # 依淨買賣股數排序
            branch_stats = branch_stats.sort_values('淨買賣股數', ascending=False)
            
            # 加入券商名稱
            branch_stats['券商名稱'] = branch_stats['券商'].map(BROKER_MAPPING).fillna('未知券商')
            
            self.logger.info(f"完成分點活躍度分析，共 {len(branch_stats)} 個有效分點")
            return branch_stats
            
        except Exception as e:
            self.logger.error(f"分點分析失敗: {e}")
            return pd.DataFrame()
    
    def detect_unusual_activity(self, df: pd.DataFrame, std_threshold: float = 2.0) -> pd.DataFrame:
        """
        偵測異常交易活動
        
        Args:
            df: 券商資料
            std_threshold: 標準差閾值
            
        Returns:
            異常交易記錄
        """
        try:
            if df.empty or '淨買賣股數' not in df.columns:
                return pd.DataFrame()
            
            # 計算淨買賣股數的統計值
            mean_net = df['淨買賣股數'].mean()
            std_net = df['淨買賣股數'].std()
            
            # 找出超過閾值的異常交易
            threshold_upper = mean_net + (std_threshold * std_net)
            threshold_lower = mean_net - (std_threshold * std_net)
            
            unusual_trades = df[
                (df['淨買賣股數'] > threshold_upper) | 
                (df['淨買賣股數'] < threshold_lower)
            ].copy()
            
            # 計算異常程度
            unusual_trades['異常程度'] = abs(unusual_trades['淨買賣股數'] - mean_net) / std_net
            unusual_trades = unusual_trades.sort_values('異常程度', ascending=False)
            
            self.logger.info(f"發現 {len(unusual_trades)} 筆異常交易")
            return unusual_trades
            
        except Exception as e:
            self.logger.error(f"異常檢測失敗: {e}")
            return pd.DataFrame()
    
    def create_broker_chart(self, broker_stats: pd.DataFrame, stock_code: str = "") -> go.Figure:
        """建立券商交易圖表"""
        if broker_stats.empty:
            return go.Figure()
            
        try:
            fig = go.Figure()
            
            # 買進量 (正值)
            fig.add_trace(go.Bar(
                name='買進',
                x=broker_stats['券商名稱'],
                y=broker_stats['買進股數'],
                marker_color='red',
                opacity=0.7
            ))
            
            # 賣出量 (負值顯示)
            fig.add_trace(go.Bar(
                name='賣出',
                x=broker_stats['券商名稱'],
                y=-broker_stats['賣出股數'],
                marker_color='green',
                opacity=0.7
            ))
            
            fig.update_layout(
                title=f'{stock_code} 主要券商買賣分佈',
                xaxis_title='券商',
                yaxis_title='股數 (張)',
                barmode='relative',
                template=CHART_THEME,
                height=600
            )
            
            return fig
            
        except Exception as e:
            self.logger.error(f"圖表建立失敗: {e}")
            return go.Figure()
    
    def create_net_trading_chart(self, branch_stats: pd.DataFrame, top_n: int = 20) -> go.Figure:
        """建立淨買賣圖表"""
        if branch_stats.empty:
            return go.Figure()
            
        try:
            # 取前 N 個分點
            top_branches = branch_stats.head(top_n)
            
            # 建立條狀圖
            colors = ['red' if x > 0 else 'green' for x in top_branches['淨買賣股數']]
            
            fig = go.Figure(data=[
                go.Bar(
                    x=top_branches['淨買賣股數'],
                    y=[f"{row['券商名稱']}-{row['分點']}" for _, row in top_branches.iterrows()],
                    orientation='h',
                    marker_color=colors,
                    opacity=0.7
                )
            ])
            
            fig.update_layout(
                title=f'前{top_n}名分點淨買賣量',
                xaxis_title='淨買賣股數 (張)',
                yaxis_title='券商分點',
                template=CHART_THEME,
                height=800
            )
            
            return fig
            
        except Exception as e:
            self.logger.error(f"圖表建立失敗: {e}")
            return go.Figure()
    
    def generate_analysis_report(self, df: pd.DataFrame, stock_code: str = "") -> Dict:
        """
        產生分析報告
        
        Returns:
            包含各種分析結果的字典
        """
        report = {}
        
        try:
            # 基本統計
            total_records = len(df)
            total_brokers = df['券商'].nunique() if '券商' in df.columns else 0
            total_branches = len(df.groupby(['券商', '分點'])) if all(col in df.columns for col in ['券商', '分點']) else 0
            
            report['基本統計'] = {
                '總記錄數': total_records,
                '券商數量': total_brokers,
                '分點數量': total_branches,
                '分析日期': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            if not df.empty:
                # 主要券商分析
                report['主要券商'] = self.analyze_top_brokers(df)
                
                # 分點活躍度
                report['活躍分點'] = self.analyze_branch_activity(df)
                
                # 異常交易
                report['異常交易'] = self.detect_unusual_activity(df)
                
                # 圖表
                report['券商圖表'] = self.create_broker_chart(report['主要券商'], stock_code)
                report['淨買賣圖表'] = self.create_net_trading_chart(report['活躍分點'])
            
            self.logger.info("分析報告產生完成")
            return report
            
        except Exception as e:
            self.logger.error(f"報告產生失敗: {e}")
            return {'錯誤': str(e)}
    
    def save_report_to_excel(self, report: Dict, filename: str):
        """儲存報告到 Excel"""
        try:
            filepath = OUTPUT_DIR / f"{filename}.xlsx"
            
            with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
                # 基本統計
                if '基本統計' in report:
                    basic_stats = pd.DataFrame([report['基本統計']])
                    basic_stats.to_excel(writer, sheet_name='基本統計', index=False)
                
                # 主要券商
                if '主要券商' in report and not report['主要券商'].empty:
                    report['主要券商'].to_excel(writer, sheet_name='主要券商', index=False)
                
                # 活躍分點
                if '活躍分點' in report and not report['活躍分點'].empty:
                    report['活躍分點'].to_excel(writer, sheet_name='活躍分點', index=False)
                
                # 異常交易
                if '異常交易' in report and not report['異常交易'].empty:
                    report['異常交易'].to_excel(writer, sheet_name='異常交易', index=False)
            
            self.logger.info(f"報告已儲存到 {filepath}")
            
        except Exception as e:
            self.logger.error(f"儲存報告失敗: {e}")

if __name__ == "__main__":
    # 測試分析器
    analyzer = ChipAnalyzer()
    
    # 建立測試資料
    test_data = pd.DataFrame({
        '券商': ['9800', '9600', '9900', '1160', '5850'] * 10,
        '分點': ['總公司', '台北', '新竹', '台中', '高雄'] * 10,
        '買進股數': np.random.randint(1000, 50000, 50),
        '賣出股數': np.random.randint(1000, 50000, 50),
        '買進金額': np.random.randint(100000, 5000000, 50),
        '賣出金額': np.random.randint(100000, 5000000, 50)
    })
    
    # 清理資料
    clean_data = analyzer.clean_broker_data(test_data)
    print("清理後的資料範例:")
    print(clean_data.head())
    
    # 生成分析報告
    report = analyzer.generate_analysis_report(clean_data, "2330")
    print("\n主要券商分析:")
    print(report['主要券商'].head())