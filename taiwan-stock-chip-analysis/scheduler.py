"""
自動化排程系統
每日自動下載台股券商分點籌碼資料
"""
import schedule
import time
import logging
from datetime import datetime, timedelta
import sys
from pathlib import Path
import colorama
from colorama import Fore, Style

# 初始化 colorama
colorama.init()

# 添加專案模組到路徑
sys.path.append(str(Path(__file__).parent))
from config import *
from src.data_collector.twse_collector import TWSECollector
from src.utils.database import ChipDatabase

class AutoScheduler:
    """自動排程器"""
    
    def __init__(self):
        # 設定日誌
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('scheduler.log', encoding='utf-8'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # 初始化組件
        self.collector = TWSECollector()
        self.database = ChipDatabase()
        
        # 預設要追蹤的股票清單
        self.watch_list = DEFAULT_STOCK_CODES
        
        self.logger.info("自動排程器初始化完成")
        self.print_banner()
    
    def print_banner(self):
        """顯示系統橫幅"""
        print(f"{Fore.CYAN}{Style.BRIGHT}")
        print("=" * 60)
        print("    台股籌碼自動收集排程器")
        print("    Taiwan Stock Chip Auto Scheduler")
        print("=" * 60)
        print(f"{Style.RESET_ALL}")
    
    def daily_collection_job(self):
        """每日資料收集任務"""
        start_time = datetime.now()
        self.logger.info("=" * 50)
        self.logger.info(f"開始每日資料收集任務: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            success_count = 0
            error_count = 0
            
            # 取得交易日期 (排除週末)
            today = datetime.now()
            if today.weekday() >= 5:  # 週末不收集
                self.logger.info("今日為週末，跳過資料收集")
                return
            
            date_str = today.strftime('%Y-%m-%d')
            
            for i, stock_code in enumerate(self.watch_list, 1):
                try:
                    print(f"{Fore.BLUE}[{i}/{len(self.watch_list)}] 收集股票 {stock_code}...{Style.RESET_ALL}")
                    self.logger.info(f"正在收集股票 {stock_code} 的資料...")
                    
                    # 收集券商分點資料
                    broker_data = self.collector.get_broker_trading_detail(stock_code, date_str)
                    
                    if broker_data is not None and not broker_data.empty:
                        # 儲存到資料庫
                        count = self.database.insert_broker_data(broker_data)
                        success_count += 1
                        
                        print(f"{Fore.GREEN}✅ 股票 {stock_code}: 收集 {len(broker_data)} 筆資料，儲存 {count} 筆{Style.RESET_ALL}")
                        self.logger.info(f"股票 {stock_code} 資料收集成功: {count} 筆")
                    else:
                        print(f"{Fore.YELLOW}⚠️  股票 {stock_code}: 無資料{Style.RESET_ALL}")
                        self.logger.warning(f"股票 {stock_code} 無券商資料")
                    
                    # 避免請求過快
                    time.sleep(REQUEST_DELAY)
                    
                except Exception as e:
                    error_count += 1
                    print(f"{Fore.RED}❌ 股票 {stock_code}: 收集失敗 - {e}{Style.RESET_ALL}")
                    self.logger.error(f"股票 {stock_code} 資料收集失敗: {e}")
            
            # 生成每日摘要
            self.generate_daily_summary(date_str, success_count, error_count)
            
            # 清理舊資料 (可選)
            if today.day == 1:  # 每月1號清理
                self.cleanup_old_data()
            
            end_time = datetime.now()
            duration = end_time - start_time
            
            print(f"\n{Fore.GREEN}🎉 每日資料收集完成！{Style.RESET_ALL}")
            print(f"成功: {success_count} 檔, 失敗: {error_count} 檔")
            print(f"耗時: {duration.total_seconds():.1f} 秒")
            
            self.logger.info(f"每日資料收集完成 - 成功: {success_count}, 失敗: {error_count}, 耗時: {duration}")
            
        except Exception as e:
            self.logger.error(f"每日資料收集任務失敗: {e}")
            print(f"{Fore.RED}❌ 每日資料收集任務失敗: {e}{Style.RESET_ALL}")
    
    def generate_daily_summary(self, date: str, success_count: int, error_count: int):
        """生成每日收集摘要"""
        try:
            summary = {
                'date': date,
                'total_stocks': len(self.watch_list),
                'success_count': success_count,
                'error_count': error_count,
                'collection_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            # 可以擴展儲存每日摘要到資料庫
            self.logger.info(f"每日摘要 - {date}: 成功 {success_count} 檔, 失敗 {error_count} 檔")
            
        except Exception as e:
            self.logger.error(f"生成每日摘要失敗: {e}")
    
    def cleanup_old_data(self):
        """清理舊資料"""
        try:
            print(f"{Fore.YELLOW}🧹 執行資料清理...{Style.RESET_ALL}")
            deleted_count = self.database.cleanup_old_data(days_to_keep=365)
            print(f"{Fore.GREEN}✅ 清理完成，刪除 {deleted_count} 筆舊資料{Style.RESET_ALL}")
            self.logger.info(f"資料清理完成，刪除 {deleted_count} 筆舊資料")
        except Exception as e:
            self.logger.error(f"資料清理失敗: {e}")
    
    def weekly_analysis_job(self):
        """每週分析任務"""
        try:
            self.logger.info("開始每週分析任務")
            print(f"{Fore.MAGENTA}📊 執行每週分析...{Style.RESET_ALL}")
            
            # 這裡可以加入週報生成等功能
            # 例如: 生成前5大股票的週分析報告
            
            self.logger.info("每週分析任務完成")
            
        except Exception as e:
            self.logger.error(f"每週分析任務失敗: {e}")
    
    def setup_schedule(self):
        """設定排程"""
        # 每個交易日上午9點30分收集資料 (開盤後)
        schedule.every().monday.at("09:30").do(self.daily_collection_job)
        schedule.every().tuesday.at("09:30").do(self.daily_collection_job)
        schedule.every().wednesday.at("09:30").do(self.daily_collection_job)
        schedule.every().thursday.at("09:30").do(self.daily_collection_job)
        schedule.every().friday.at("09:30").do(self.daily_collection_job)
        
        # 每個交易日下午2點30分再收集一次 (收盤後)
        schedule.every().monday.at("14:30").do(self.daily_collection_job)
        schedule.every().tuesday.at("14:30").do(self.daily_collection_job)
        schedule.every().wednesday.at("14:30").do(self.daily_collection_job)
        schedule.every().thursday.at("14:30").do(self.daily_collection_job)
        schedule.every().friday.at("14:30").do(self.daily_collection_job)
        
        # 每週日上午10點執行週分析
        schedule.every().sunday.at("10:00").do(self.weekly_analysis_job)
        
        # 每月1號凌晨2點清理舊資料
        schedule.every().month.at("02:00").do(self.cleanup_old_data)
        
        print(f"{Fore.GREEN}✅ 排程設定完成{Style.RESET_ALL}")
        print("排程安排:")
        print("  📅 每個交易日 09:30 - 資料收集 (開盤後)")  
        print("  📅 每個交易日 14:30 - 資料收集 (收盤後)")
        print("  📅 每週日 10:00 - 週報分析")
        print("  📅 每月1號 02:00 - 清理舊資料")
        
        self.logger.info("排程設定完成")
    
    def run_scheduler(self):
        """執行排程器"""
        print(f"{Fore.CYAN}🚀 排程器開始運行...{Style.RESET_ALL}")
        print("按 Ctrl+C 停止排程器")
        
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # 每分鐘檢查一次
                
        except KeyboardInterrupt:
            print(f"\n{Fore.YELLOW}⏹️  使用者停止排程器{Style.RESET_ALL}")
            self.logger.info("排程器被使用者停止")
        except Exception as e:
            print(f"{Fore.RED}❌ 排程器執行錯誤: {e}{Style.RESET_ALL}")
            self.logger.error(f"排程器執行錯誤: {e}")
    
    def add_stock(self, stock_code: str):
        """添加股票到監控清單"""
        if stock_code not in self.watch_list:
            self.watch_list.append(stock_code)
            self.logger.info(f"已添加股票 {stock_code} 到監控清單")
            print(f"✅ 已添加股票 {stock_code} 到監控清單")
        else:
            print(f"⚠️  股票 {stock_code} 已在監控清單中")
    
    def remove_stock(self, stock_code: str):
        """從監控清單移除股票"""
        if stock_code in self.watch_list:
            self.watch_list.remove(stock_code)
            self.logger.info(f"已移除股票 {stock_code} 從監控清單")
            print(f"✅ 已移除股票 {stock_code} 從監控清單")
        else:
            print(f"⚠️  股票 {stock_code} 不在監控清單中")
    
    def show_watch_list(self):
        """顯示監控清單"""
        print(f"\n{Fore.CYAN}📋 目前監控清單:{Style.RESET_ALL}")
        for i, stock_code in enumerate(self.watch_list, 1):
            stock_name = "台積電" if stock_code == "2330" else stock_code
            print(f"  {i}. {stock_code} - {stock_name}")
        print(f"總計: {len(self.watch_list)} 檔股票")
    
    def manual_collection(self):
        """手動執行一次資料收集"""
        print(f"{Fore.BLUE}🔄 手動執行資料收集...{Style.RESET_ALL}")
        self.daily_collection_job()

def main():
    """主程式"""
    import argparse
    
    parser = argparse.ArgumentParser(description='台股籌碼自動收集排程器')
    parser.add_argument('--run', action='store_true', help='啟動排程器')
    parser.add_argument('--manual', action='store_true', help='手動執行一次收集')
    parser.add_argument('--add-stock', help='添加股票到監控清單')
    parser.add_argument('--remove-stock', help='從監控清單移除股票')
    parser.add_argument('--show-list', action='store_true', help='顯示監控清單')
    
    args = parser.parse_args()
    
    scheduler = AutoScheduler()
    
    if args.add_stock:
        scheduler.add_stock(args.add_stock)
    elif args.remove_stock:
        scheduler.remove_stock(args.remove_stock)
    elif args.show_list:
        scheduler.show_watch_list()
    elif args.manual:
        scheduler.manual_collection()
    elif args.run:
        scheduler.setup_schedule()
        scheduler.run_scheduler()
    else:
        print("使用方法:")
        print("  python scheduler.py --run          # 啟動排程器")
        print("  python scheduler.py --manual       # 手動收集一次")
        print("  python scheduler.py --add-stock 2330    # 添加監控股票")
        print("  python scheduler.py --show-list    # 顯示監控清單")

if __name__ == "__main__":
    main()