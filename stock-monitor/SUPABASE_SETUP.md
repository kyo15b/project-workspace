# 🚀 Supabase 後端設定指南

## 📋 設定步驟

### 1. 建立 Supabase 專案
1. 前往 [supabase.com](https://supabase.com)
2. 註冊/登入帳號
3. 點擊 "New project"
4. 填寫專案資訊：
   - Name: `stock-monitor`
   - Database Password: (設定強密碼)
   - Region: 選擇最近的區域

### 2. 獲取專案憑證
1. 前往專案 Dashboard
2. 點擊 Settings → API
3. 複製以下資訊：
   - Project URL: `https://your-project-ref.supabase.co`
   - anon/public key: `eyJhbGciOi...`

### 3. 設定資料庫
1. 前往 SQL Editor
2. 複製 `database/supabase-setup.sql` 的內容
3. 執行 SQL 腳本
4. 確認資料表建立成功：
   - `user_stocks`
   - `user_stocks_history`
   - `user_stocks_stats` (視圖)

### 4. 設定認證
1. 前往 Authentication → Settings
2. 啟用 Email 認證
3. 設定 Site URL: `https://your-username.github.io`
4. 設定 Redirect URLs:
   - `https://your-username.github.io/project-workspace/stock-monitor/`
   - `http://localhost:3000` (開發用)

### 5. 更新前端設定
編輯 `assets/js/app.js`：
```javascript
// Supabase 後端配置
this.SUPABASE_URL = 'https://your-project-ref.supabase.co';
this.SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 6. 設定 Email 模板 (可選)
1. 前往 Authentication → Email Templates
2. 自訂 Magic Link 郵件模板
3. 添加品牌 Logo 和訊息

## 🔧 功能特性

### ✅ 已實作功能：
- **用戶認證**: Magic Link Email 登入
- **資料庫**: PostgreSQL with Row Level Security
- **跨裝置同步**: 真正的雲端資料庫
- **安全控制**: 用戶只能存取自己的資料
- **歷史記錄**: 追蹤所有股票變更
- **自動備份**: Supabase 自動備份
- **即時同步**: 支援多裝置即時更新

### 🔄 同步流程：
1. 用戶在 A 裝置登入並添加股票
2. 資料自動保存到 Supabase
3. 用戶在 B 裝置登入
4. 自動載入 A 裝置的股票清單
5. 任何變更即時同步到所有裝置

## 🏗️ 資料庫結構

### user_stocks 表
```sql
- id: 主鍵
- user_id: 用戶 UUID (外鍵)
- email: 用戶 Email
- stocks: 股票清單 (JSONB)
- created_at: 建立時間
- updated_at: 更新時間
```

### user_stocks_history 表
```sql
- id: 主鍵
- user_id: 用戶 UUID
- stocks_snapshot: 股票清單快照
- action: 動作類型 (add/remove/update)
- stock_code: 異動的股票代號
- created_at: 記錄時間
```

## 📊 優勢對比

| 功能 | 本地存儲 | Supabase 後端 |
|------|---------|---------------|
| 跨裝置同步 | ❌ | ✅ |
| 用戶認證 | ❌ | ✅ |
| 資料安全 | ❌ | ✅ |
| 歷史記錄 | ❌ | ✅ |
| 多用戶支援 | ❌ | ✅ |
| 即時更新 | ❌ | ✅ |
| 資料備份 | ❌ | ✅ |
| 可擴展性 | ❌ | ✅ |

## 🛠️ 故障排除

### 常見問題：
1. **登入失敗**: 檢查 Email 設定和 Redirect URLs
2. **CORS 錯誤**: 確認 Site URL 設定正確
3. **資料不同步**: 檢查 RLS 政策和用戶權限
4. **連線失敗**: 確認 API Key 和 Project URL

### 調試工具：
- 使用內建調試按鈕 🔍 查看同步狀態
- 檢查瀏覽器 Console 的詳細日誌
- Supabase Dashboard 的 Table Editor
- Authentication 頁面查看用戶清單

## 🔄 部署後測試

1. **單裝置測試**: 登入 → 添加股票 → 重新整理頁面
2. **跨裝置測試**: A 裝置添加股票 → B 裝置登入查看
3. **跨瀏覽器測試**: Chrome 添加 → Firefox 登入查看
4. **離線測試**: 斷網 → 重新連線 → 檢查同步

## 💡 進階功能

### 可擴展的功能：
- 股票價格提醒
- 投資組合分析
- 社群分享功能
- 股票新聞整合
- 技術指標計算
- 手機 App (React Native)

這個架構可以支援數千名用戶同時使用，並且具備完整的擴展性！