# 使用說明

## 🚀 快速開始

### 1. 安裝依賴套件
```bash
pip install -r requirements.txt
```

### 2. 設定環境變數（可選）
複製 `.env.example` 到 `.env` 並填入您的 API 金鑰：
```bash
cp .env.example .env
```

### 3. 基本使用

#### 收集籌碼資料
```bash
# 收集台積電的籌碼資料
python main.py collect 2330

# 收集多檔股票資料
python main.py collect 2330 2454 2317

# 指定日期收集
python main.py collect 2330 -d 2025-01-01
```

#### 分析籌碼資料
```bash
# 分析台積電籌碼
python main.py analyze 2330

# 分析最近7天的資料
python main.py analyze 2330 --days 7

# 分析特定日期
python main.py analyze 2330 -d 2025-01-01
```

#### 批量分析
```bash
# 批量分析多檔股票
python main.py batch 2330 2454 2317

# 分析最近30天
python main.py batch 2330 2454 --days 30
```

#### 查看熱門券商
```bash
# 查看所有股票的熱門券商
python main.py top

# 查看特定股票的熱門券商
python main.py top -s 2330

# 查看最近60天的資料
python main.py top --days 60
```

## 🎯 互動式模式

啟動互動式模式：
```bash
python main.py interactive
```

可用指令：
- `collect <股票代碼>` - 收集資料
- `analyze <股票代碼>` - 分析籌碼
- `top [股票代碼]` - 熱門券商排行
- `default` - 分析預設股票清單
- `help` - 顯示說明
- `exit` - 離開程式

## 📊 輸出說明

### 分析報告
- Excel 檔案：包含完整的統計資料表格
- HTML 圖表：互動式視覺化圖表
- 存放位置：`output/` 目錄

### 資料庫
- SQLite 資料庫：`data/chip_analysis.db`
- 包含券商交易、每日摘要、異常交易記錄

## 🔧 進階設定

### 修改預設股票清單
編輯 `config.py` 中的 `DEFAULT_STOCK_CODES`：
```python
DEFAULT_STOCK_CODES = [
    "2330",  # 台積電
    "2454",  # 聯發科
    # 添加您想要的股票代碼
]
```

### 調整分析參數
在 `config.py` 中：
- `MINIMUM_VOLUME_THRESHOLD`：最小交易量門檻
- `TOP_BROKERS_COUNT`：顯示券商數量
- `REQUEST_DELAY`：請求間隔時間

### 券商名稱對應
編輯 `BROKER_MAPPING` 字典來添加券商名稱對應。

## 📈 分析指標說明

### 主要券商分析
- **總交易量**：買進 + 賣出的總量
- **淨買賣量**：買進 - 賣出的淨量
- **分點數量**：該券商參與交易的分點數

### 異常交易偵測
- 使用統計學方法偵測異常大的交易量
- **異常程度**：超出平均值的標準差倍數

### 分點活躍度
- 依據交易量排序的分點排行
- 過濾掉小額交易

## ⚠️ 注意事項

1. **API 限制**：請遵守各資料源的使用條款
2. **請求頻率**：預設有 1 秒延遲，避免過快請求
3. **資料準確性**：僅供參考，不構成投資建議
4. **網路連線**：需要穩定的網路連線來取得資料

## 🐛 故障排除

### 常見問題

**Q: 收集不到資料**
A: 檢查網路連線、股票代碼是否正確、API 是否可用

**Q: 分析報錯**
A: 確認資料庫中有足夠的資料，檢查股票代碼格式

**Q: 圖表無法顯示**
A: 檢查 plotly 是否正確安裝，瀏覽器是否支援

### 日誌檔案
程式執行時會產生 `chip_analysis.log` 檔案，包含詳細的執行記錄。

## 📞 技術支援

如有問題，請查看：
1. `chip_analysis.log` 日誌檔案
2. GitHub Issues
3. 專案文件

## 🚧 開發中功能

- 即時資料串流
- 更多視覺化圖表
- Web 介面
- 警示通知系統