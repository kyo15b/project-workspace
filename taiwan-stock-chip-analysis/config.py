"""
配置檔案 - 系統設定和常數
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# 載入環境變數
load_dotenv()

# 專案根目錄
PROJECT_ROOT = Path(__file__).parent

# 資料目錄
DATA_DIR = PROJECT_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
OUTPUT_DIR = PROJECT_ROOT / "output"

# 資料庫設定
DB_PATH = os.getenv("DB_PATH", "data/chip_analysis.db")

# API 設定
FUGLE_API_KEY = os.getenv("FUGLE_API_KEY")
TEJ_API_KEY = os.getenv("TEJ_API_KEY")

# 請求設定
REQUEST_DELAY = float(os.getenv("REQUEST_DELAY", 1.0))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", 3))
TIMEOUT = int(os.getenv("TIMEOUT", 30))

# 分析設定
MINIMUM_VOLUME_THRESHOLD = int(os.getenv("MINIMUM_VOLUME_THRESHOLD", 1000))
TOP_BROKERS_COUNT = int(os.getenv("TOP_BROKERS_COUNT", 20))

# 輸出設定
OUTPUT_FORMAT = os.getenv("OUTPUT_FORMAT", "csv,excel").split(",")
CHART_THEME = os.getenv("CHART_THEME", "plotly_white")

# TWSE API URLs
TWSE_API_BASE = "https://openapi.twse.com.tw/v1"
TPEX_API_BASE = "https://www.tpex.org.tw/openapi/v1"

# 常用股票代碼 (可根據需要調整)
DEFAULT_STOCK_CODES = [
    "2330",  # 台積電
    "2454",  # 聯發科
    "2317",  # 鴻海
    "2412",  # 中華電
    "2882",  # 國泰金
    "2308",  # 台達電
    "2002",  # 中鋼
    "1303",  # 南亞
    "1301",  # 台塑
    "2886",  # 兆豐金
]

# 券商代碼對應表 (部分常見券商)
BROKER_MAPPING = {
    "1160": "日盛證券",
    "1020": "合庫證券", 
    "5720": "大華證券",
    "5380": "第一金證券",
    "5920": "元富證券",
    "5850": "統一證券",
    "6450": "康和證券",
    "9100": "群益證券",
    "9200": "凱基證券",
    "9600": "富邦證券",
    "9800": "元大證券",
    "9900": "國泰證券",
}

# 確保目錄存在
for directory in [DATA_DIR, RAW_DATA_DIR, PROCESSED_DATA_DIR, OUTPUT_DIR]:
    directory.mkdir(parents=True, exist_ok=True)