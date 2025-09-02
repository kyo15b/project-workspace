# 台股券商分點籌碼統計分析系統

## 專案簡介
這是一個專門用於抓取和分析台灣股市券商分點籌碼資料的系統，可以幫助投資者追蹤主力大戶的進出動向。

## 主要功能
- 🔍 **資料抓取**: 從多個資料源抓取券商分點進出明細
- 📊 **統計分析**: 分析主力券商的買賣行為和趨勢
- 📈 **視覺化**: 生成圖表展示籌碼分佈和變化
- 📋 **報表生成**: 輸出分析報告和統計數據

## 資料來源
- 台灣證券交易所 (TWSE) OpenAPI
- 櫃買中心 (TPEX) OpenAPI  
- 富果 (Fugle) API
- 其他公開資料源

## 專案結構
```
taiwan-stock-chip-analysis/
├── src/
│   ├── data_collector/     # 資料收集模組
│   ├── analyzer/          # 分析模組
│   └── utils/             # 工具函數
├── tests/                 # 測試檔案
├── docs/                  # 文件
├── data/                  # 資料存放
│   ├── raw/              # 原始資料
│   └── processed/        # 處理後資料
└── output/               # 輸出結果
```

## 安裝需求
- Python 3.8+
- pandas
- requests
- matplotlib/plotly (視覺化)
- sqlite3 (資料存儲)

## 使用方法
```bash
# 安裝依賴
pip install -r requirements.txt

# 執行資料收集
python src/data_collector/main.py

# 執行分析
python src/analyzer/main.py
```

## 注意事項
- 請遵守各資料源的API使用條款
- 建議設置合理的請求間隔避免被限制
- 此工具僅供研究和學習使用，投資決策請謹慎評估

## 免責聲明
本系統提供的資料和分析僅供參考，不構成投資建議。投資有風險，請謹慎評估後決定。