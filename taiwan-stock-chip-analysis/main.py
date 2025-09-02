"""
台股券商分點籌碼統計分析系統 - 主程式
"""
import argparse
import logging
import sys
from datetime import datetime, timedelta
from pathlib import Path
import colorama
from colorama import Fore, Back, Style

# 初始化 colorama
colorama.init()

# 添加專案模組到路徑
sys.path.append(str(Path(__file__).parent))
from config import *
from src.data_collector.twse_collector import TWSECollector
from src.analyzer.chip_analyzer import ChipAnalyzer
from src.utils.database import ChipDatabase

class ChipAnalysisSystem:
    """籌碼分析系統主類別"""
    
    def __init__(self):
        # 設定日誌
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('chip_analysis.log', encoding='utf-8'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # 初始化組件
        self.collector = TWSECollector()
        self.analyzer = ChipAnalyzer()
        self.database = ChipDatabase()
        
        self.print_banner()
    
    def print_banner(self):
        """顯示系統橫幅"""
        print(Fore.CYAN + Style.BRIGHT)
        print("=" * 60)
        print("    台股券商分點籌碼統計分析系統")
        print("    Taiwan Stock Broker Chip Analysis System")
        print("=" * 60)
        print(Style.RESET_ALL)
    
    def collect_data(self, stock_codes: list, date: str = None, save_to_db: bool = True):
        """
        收集指定股票的籌碼資料
        
        Args:
            stock_codes: 股票代碼列表
            date: 指定日期，None 表示今天
            save_to_db: 是否儲存到資料庫
        """
        print(f"{Fore.GREEN}🔄 開始收集籌碼資料...{Style.RESET_ALL}")
        
        if not date:
            date = datetime.now().strftime('%Y-%m-%d')
        
        all_data = []
        
        for stock_code in stock_codes:
            self.logger.info(f"正在收集股票 {stock_code} 的資料...")
            print(f"📊 收集股票 {stock_code} 的資料...")
            
            try:
                # 收集券商分點資料
                broker_data = self.collector.get_broker_trading_detail(stock_code, date)
                
                if broker_data is not None and not broker_data.empty:
                    print(f"✅ 股票 {stock_code}: 收集到 {len(broker_data)} 筆券商資料")
                    
                    if save_to_db:
                        # 儲存到資料庫
                        count = self.database.insert_broker_data(broker_data)
                        print(f"💾 已儲存 {count} 筆資料到資料庫")
                    
                    all_data.append(broker_data)
                else:
                    print(f"⚠️  股票 {stock_code}: 無券商資料")
                
            except Exception as e:
                self.logger.error(f"收集股票 {stock_code} 資料失敗: {e}")
                print(f"❌ 股票 {stock_code}: 收集失敗 - {e}")
        
        if all_data:
            print(f"{Fore.GREEN}✅ 資料收集完成！總共收集 {len(all_data)} 檔股票的資料{Style.RESET_ALL}")
        else:
            print(f"{Fore.YELLOW}⚠️  未收集到任何資料{Style.RESET_ALL}")
    
    def analyze_stock(self, stock_code: str, date: str = None, days: int = 1):
        """
        分析指定股票的籌碼資料
        
        Args:
            stock_code: 股票代碼
            date: 分析日期
            days: 分析天數
        """
        print(f"{Fore.BLUE}📈 開始分析股票 {stock_code} 的籌碼...{Style.RESET_ALL}")
        
        try:
            # 從資料庫讀取資料
            if date:
                data = self.database.get_broker_data(stock_code=stock_code, date=date)
            else:
                # 分析最近N天的資料
                end_date = datetime.now().strftime('%Y-%m-%d')
                start_date = (datetime.now() - timedelta(days=days-1)).strftime('%Y-%m-%d')
                data = self.database.get_broker_data(
                    stock_code=stock_code, 
                    start_date=start_date, 
                    end_date=end_date
                )
            
            if data.empty:
                print(f"❌ 沒有找到股票 {stock_code} 的籌碼資料")
                return
            
            print(f"📊 找到 {len(data)} 筆券商分點資料")
            
            # 轉換欄位名稱以符合分析器期望格式
            data_for_analysis = data.rename(columns={
                'broker_code': '券商',
                'branch_name': '分點',
                'buy_volume': '買進股數',
                'sell_volume': '賣出股數',
                'buy_amount': '買進金額',
                'sell_amount': '賣出金額',
                'net_volume': '淨買賣股數',
                'net_amount': '淨買賣金額'
            })
            
            # 執行分析
            report = self.analyzer.generate_analysis_report(data_for_analysis, stock_code)
            
            # 顯示分析結果
            self.display_analysis_results(report, stock_code)
            
            # 儲存報告
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{stock_code}_analysis_{timestamp}"
            
            self.analyzer.save_report_to_excel(report, filename)
            print(f"💾 分析報告已儲存: {filename}.xlsx")
            
            # 儲存圖表
            if '券商圖表' in report:
                chart_file = OUTPUT_DIR / f"{filename}_broker_chart.html"
                report['券商圖表'].write_html(chart_file)
                print(f"📊 券商圖表已儲存: {chart_file}")
            
            if '淨買賣圖表' in report:
                net_chart_file = OUTPUT_DIR / f"{filename}_net_trading_chart.html"
                report['淨買賣圖表'].write_html(net_chart_file)
                print(f"📊 淨買賣圖表已儲存: {net_chart_file}")
                
        except Exception as e:
            self.logger.error(f"分析股票 {stock_code} 失敗: {e}")
            print(f"❌ 分析失敗: {e}")
    
    def display_analysis_results(self, report: dict, stock_code: str):
        """顯示分析結果"""
        print(f"\n{Fore.CYAN}{'='*50}")
        print(f"📋 {stock_code} 籌碼分析報告")
        print(f"{'='*50}{Style.RESET_ALL}")
        
        # 基本統計
        if '基本統計' in report:
            stats = report['基本統計']
            print(f"\n📊 {Fore.GREEN}基本統計:{Style.RESET_ALL}")
            print(f"   總記錄數: {stats.get('總記錄數', 0)}")
            print(f"   券商數量: {stats.get('券商數量', 0)}")
            print(f"   分點數量: {stats.get('分點數量', 0)}")
        
        # 主要券商
        if '主要券商' in report and not report['主要券商'].empty:
            print(f"\n🏆 {Fore.GREEN}前5大券商:{Style.RESET_ALL}")
            top_brokers = report['主要券商'].head()
            for idx, row in top_brokers.iterrows():
                broker_name = row.get('券商名稱', row.get('券商', '未知'))
                net_amount = row.get('淨買賣金額', 0)
                net_volume = row.get('淨買賣股數', 0)
                action = "買超" if net_amount > 0 else "賣超"
                color = Fore.RED if net_amount > 0 else Fore.GREEN
                
                print(f"   {idx+1}. {broker_name}: {color}{action} {abs(net_amount):,} 元 ({abs(net_volume):,} 張){Style.RESET_ALL}")
        
        # 異常交易
        if '異常交易' in report and not report['異常交易'].empty:
            unusual_count = len(report['異常交易'])
            print(f"\n⚠️  {Fore.YELLOW}發現 {unusual_count} 筆異常交易{Style.RESET_ALL}")
            
            top_unusual = report['異常交易'].head(3)
            for idx, row in top_unusual.iterrows():
                broker = row.get('券商', '未知券商')
                branch = row.get('分點', '未知分點')
                net_volume = row.get('淨買賣股數', 0)
                anomaly_score = row.get('異常程度', 0)
                
                print(f"   {broker}-{branch}: {net_volume:,} 張 (異常度: {anomaly_score:.2f})")
    
    def batch_analysis(self, stock_codes: list, days: int = 7):
        """批量分析多檔股票"""
        print(f"{Fore.MAGENTA}🔄 開始批量分析 {len(stock_codes)} 檔股票（最近{days}天）...{Style.RESET_ALL}")
        
        for i, stock_code in enumerate(stock_codes, 1):
            print(f"\n[{i}/{len(stock_codes)}] 分析股票 {stock_code}")
            self.analyze_stock(stock_code, days=days)
            
        print(f"\n{Fore.GREEN}✅ 批量分析完成！{Style.RESET_ALL}")
    
    def show_top_brokers(self, stock_code: str = None, days: int = 30):
        """顯示熱門券商排行"""
        print(f"{Fore.CYAN}🏆 查詢熱門券商排行（最近{days}天）{Style.RESET_ALL}")
        
        top_brokers = self.database.get_top_brokers(stock_code=stock_code, days=days)
        
        if top_brokers.empty:
            print("❌ 沒有找到券商資料")
            return
        
        print(f"\n找到 {len(top_brokers)} 家券商資料:")
        print("-" * 80)
        print(f"{'排名':<4} {'券商代碼':<8} {'券商名稱':<12} {'淨買賣金額':<15} {'分點數':<8} {'交易天數':<8}")
        print("-" * 80)
        
        for idx, row in top_brokers.iterrows():
            broker_code = row['broker_code']
            broker_name = BROKER_MAPPING.get(broker_code, '未知券商')
            net_amount = row['total_net_amount']
            branch_count = row['branch_count']
            trading_days = row['trading_days']
            
            color = Fore.RED if net_amount > 0 else Fore.GREEN
            action_symbol = "📈" if net_amount > 0 else "📉"
            
            print(f"{idx+1:<4} {broker_code:<8} {broker_name:<12} {color}{action_symbol} {net_amount:>12,}{Style.RESET_ALL} {branch_count:<8} {trading_days:<8}")

def main():
    """主程式入口"""
    parser = argparse.ArgumentParser(description='台股券商分點籌碼統計分析系統')
    
    subparsers = parser.add_subparsers(dest='command', help='可用指令')
    
    # 收集資料指令
    collect_parser = subparsers.add_parser('collect', help='收集籌碼資料')
    collect_parser.add_argument('stocks', nargs='+', help='股票代碼 (可指定多個)')
    collect_parser.add_argument('-d', '--date', help='指定日期 (YYYY-MM-DD)')
    collect_parser.add_argument('--no-db', action='store_true', help='不儲存到資料庫')
    
    # 分析指令
    analyze_parser = subparsers.add_parser('analyze', help='分析籌碼資料')
    analyze_parser.add_argument('stock', help='股票代碼')
    analyze_parser.add_argument('-d', '--date', help='分析日期 (YYYY-MM-DD)')
    analyze_parser.add_argument('--days', type=int, default=1, help='分析天數 (預設1天)')
    
    # 批量分析指令
    batch_parser = subparsers.add_parser('batch', help='批量分析多檔股票')
    batch_parser.add_argument('stocks', nargs='+', help='股票代碼列表')
    batch_parser.add_argument('--days', type=int, default=7, help='分析天數 (預設7天)')
    
    # 熱門券商指令
    top_parser = subparsers.add_parser('top', help='顯示熱門券商排行')
    top_parser.add_argument('-s', '--stock', help='特定股票代碼')
    top_parser.add_argument('--days', type=int, default=30, help='查詢天數 (預設30天)')
    
    # 互動式指令
    subparsers.add_parser('interactive', help='進入互動式模式')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # 初始化系統
    system = ChipAnalysisSystem()
    
    try:
        if args.command == 'collect':
            system.collect_data(args.stocks, args.date, not args.no_db)
        
        elif args.command == 'analyze':
            system.analyze_stock(args.stock, args.date, args.days)
        
        elif args.command == 'batch':
            system.batch_analysis(args.stocks, args.days)
        
        elif args.command == 'top':
            system.show_top_brokers(args.stock, args.days)
        
        elif args.command == 'interactive':
            interactive_mode(system)
    
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}使用者中斷程式{Style.RESET_ALL}")
    except Exception as e:
        print(f"{Fore.RED}❌ 程式執行錯誤: {e}{Style.RESET_ALL}")

def interactive_mode(system):
    """互動式模式"""
    print(f"{Fore.CYAN}🎯 進入互動式模式 (輸入 'help' 查看指令，'exit' 離開){Style.RESET_ALL}")
    
    while True:
        try:
            user_input = input(f"\n{Fore.GREEN}📊 chip-analysis>{Style.RESET_ALL} ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() == 'exit':
                print("👋 再見！")
                break
            
            if user_input.lower() == 'help':
                print("""
📚 可用指令:
   collect <股票代碼>     - 收集指定股票的籌碼資料
   analyze <股票代碼>     - 分析指定股票的籌碼
   top [股票代碼]         - 顯示熱門券商排行
   default               - 使用預設股票清單進行分析
   exit                  - 離開程式
   help                  - 顯示此說明
                """)
                continue
            
            parts = user_input.split()
            command = parts[0].lower()
            
            if command == 'collect' and len(parts) > 1:
                stock_codes = parts[1:]
                system.collect_data(stock_codes)
            
            elif command == 'analyze' and len(parts) > 1:
                stock_code = parts[1]
                system.analyze_stock(stock_code)
            
            elif command == 'top':
                stock_code = parts[1] if len(parts) > 1 else None
                system.show_top_brokers(stock_code)
            
            elif command == 'default':
                print("🎯 使用預設股票清單進行分析...")
                system.batch_analysis(DEFAULT_STOCK_CODES[:5])  # 分析前5檔
            
            else:
                print("❌ 無效指令，請輸入 'help' 查看可用指令")
        
        except KeyboardInterrupt:
            print(f"\n{Fore.YELLOW}使用者中斷，回到主選單{Style.RESET_ALL}")
        except Exception as e:
            print(f"❌ 執行錯誤: {e}")

if __name__ == "__main__":
    main()