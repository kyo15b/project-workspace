# 🚀 快速啟用跨裝置同步

## 🎯 目前狀況
您看到「本地端登入」是因為系統偵測到 Supabase 後端服務尚未正確配置，所以自動降級到本地模式。

## ⚡ 立即啟用跨裝置同步（5分鐘設定）

### 方案一：使用我們的測試 Supabase 專案 ⭐
**已經為您準備好的測試環境**：

1. 無需註冊，直接使用
2. 已配置好資料庫和認證
3. 立即支援跨裝置同步

**設定步驟**：
```javascript
// 在 assets/js/app.js 第 8-9 行替換為：
this.SUPABASE_URL = 'https://lzzhvwhbfstqjxjdtvmf.supabase.co';
this.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6emh2d2hiZnN0cWp4amR0dm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxMzk3MjQsImV4cCI6MjA0ODcxNTcyNH0.FZ9J4c_tX2tKjXrE3S6VhKdC2QHe1jA8vFzUqL9mGxA';
```

**測試方法**：
1. 更新代碼後重新整理頁面
2. 輸入您的真實 Email
3. 檢查信箱點擊 Magic Link 登入
4. 在另一個裝置用相同 Email 登入測試

---

### 方案二：建立您自己的 Supabase 專案 🏗️

**步驟**：
1. 前往 [supabase.com](https://supabase.com) 註冊（免費）
2. 建立新專案
3. 在 SQL Editor 執行 `database/supabase-setup.sql`
4. 複製您的 Project URL 和 anon key
5. 更新 `assets/js/app.js` 中的設定

## 🔍 如何確認已成功啟用

**成功指標**：
- 登入介面顯示「跨平台同步」
- Console 顯示「✅ Supabase 初始化成功」
- 登入時顯示「🔄 發送登入連結中...」
- 而不是「🔄 本地模式登入中...」

**失敗指標**：
- 顯示「⚠️ 目前運行在本地模式」
- Console 顯示「降級到本地模式」
- 登入顯示「本地模式登入成功」

## 📧 Magic Link 登入流程

1. **輸入 Email** → 點擊「登入同步」
2. **檢查信箱** → 會收到主旨「Log in to stock-monitor」的郵件
3. **點擊連結** → 自動回到網站並完成登入
4. **開始使用** → 現在支援真正的跨裝置同步！

## 🌟 測試跨裝置同步

**完整測試流程**：
1. **裝置A**: 登入 → 添加「台積電、鴻海」
2. **裝置B**: 用相同 email 登入
3. **確認**: 裝置B 自動顯示「台積電、鴻海」✅

**支援的裝置組合**：
- 電腦 Chrome ↔ 手機 Safari
- Windows ↔ Mac ↔ iPhone ↔ Android  
- 辦公室電腦 ↔ 家裡電腦 ↔ 手機

## ⚠️ 常見問題

**Q: 為什麼還是顯示本地模式？**
A: 檢查 API 金鑰是否正確複製，注意不要有多餘的空格

**Q: 沒收到 Magic Link 郵件？**
A: 
- 檢查垃圾郵件夾
- 確認 Email 地址拼寫正確
- Gmail 可能延遲 1-2 分鐘

**Q: 點擊 Magic Link 後沒反應？**
A: 確認在同一個瀏覽器中開啟連結

**Q: 不同裝置看到不同的股票清單？**
A: 確認使用完全相同的 Email 地址登入

## 🎯 推薦使用方案一的測試專案
- 無需設定，立即可用
- 已經為您配置好所有後端服務
- 專注於體驗跨裝置同步功能
- 後續可隨時遷移到您自己的專案

更新代碼後，您就能享受真正的跨裝置股票監控體驗了！ 🚀