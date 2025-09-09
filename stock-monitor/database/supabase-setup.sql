-- Supabase 股票監控系統資料庫結構
-- 執行此腳本來建立必要的資料表和安全政策

-- 1. 建立用戶股票清單表
CREATE TABLE IF NOT EXISTS user_stocks (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    stocks JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 確保每個用戶只有一筆記錄
    CONSTRAINT unique_user_stocks UNIQUE (user_id)
);

-- 2. 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_user_stocks_user_id ON user_stocks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stocks_email ON user_stocks(email);
CREATE INDEX IF NOT EXISTS idx_user_stocks_updated_at ON user_stocks(updated_at);

-- 3. 啟用 Row Level Security (RLS)
ALTER TABLE user_stocks ENABLE ROW LEVEL SECURITY;

-- 4. 建立安全政策 - 用戶只能存取自己的資料
CREATE POLICY "Users can only access their own stock data" ON user_stocks
    FOR ALL USING (auth.uid() = user_id);

-- 5. 建立觸發器來自動更新 updated_at 欄位
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_stocks_updated_at 
    BEFORE UPDATE ON user_stocks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. 建立股票歷史記錄表（可選，用於追蹤變更）
CREATE TABLE IF NOT EXISTS user_stocks_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stocks_snapshot JSONB NOT NULL,
    action TEXT NOT NULL, -- 'add', 'remove', 'update'
    stock_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 歷史記錄表的安全政策
ALTER TABLE user_stocks_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own stock history" ON user_stocks_history
    FOR ALL USING (auth.uid() = user_id);

-- 8. 建立函數來記錄股票變更歷史
CREATE OR REPLACE FUNCTION log_stock_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO user_stocks_history (user_id, stocks_snapshot, action)
        VALUES (NEW.user_id, NEW.stocks, 'created');
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO user_stocks_history (user_id, stocks_snapshot, action)
        VALUES (NEW.user_id, NEW.stocks, 'updated');
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO user_stocks_history (user_id, stocks_snapshot, action)
        VALUES (OLD.user_id, OLD.stocks, 'deleted');
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 9. 建立觸發器來自動記錄變更
CREATE TRIGGER log_user_stocks_changes
    AFTER INSERT OR UPDATE OR DELETE ON user_stocks
    FOR EACH ROW
    EXECUTE FUNCTION log_stock_change();

-- 10. 建立視圖來顯示用戶統計
CREATE OR REPLACE VIEW user_stocks_stats AS
SELECT 
    u.email,
    CASE 
        WHEN us.stocks IS NOT NULL 
        THEN jsonb_array_length(us.stocks)
        ELSE 0 
    END as stock_count,
    us.updated_at as last_sync,
    us.created_at as joined_date
FROM auth.users u
LEFT JOIN user_stocks us ON u.id = us.user_id;

-- 完成！
-- 執行此腳本後，您的 Supabase 專案就具備了：
-- ✅ 用戶股票資料表
-- ✅ 安全的存取控制
-- ✅ 自動時間戳更新
-- ✅ 變更歷史追蹤
-- ✅ 效能優化的索引
-- ✅ 用戶統計視圖