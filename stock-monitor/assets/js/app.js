class StockMonitor {
    constructor() {
        this.currentUser = localStorage.getItem('currentUser') || null;
        this.stocks = [];
        this.apiKey = 'demo'; // 使用示範 API key，實際使用時需要申請真實的 API key
        
        // Supabase 後端配置 - 公開測試專案
        this.SUPABASE_URL = 'https://lzzhvwhbfstqjxjdtvmf.supabase.co';
        this.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6emh2d2hiZnN0cWp4amR0dm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxMzk3MjQsImV4cCI6MjA0ODcxNTcyNH0.FZ9J4c_tX2tKjXrE3S6VhKdC2QHe1jA8vFzUqL9mGxA';
        this.supabase = null;
        this.user = null;
        
        // 錯誤管理系統
        this.errorManager = new ErrorManager();
        
        // 初始化 Supabase
        this.initSupabase();
        
        this.init();
    }

    // 初始化 Supabase
    async initSupabase() {
        try {
            // 檢查 Supabase 是否可用
            if (typeof window.supabase === 'undefined') {
                console.warn('Supabase 庫未載入，使用本地模式');
                this.initLocalMode();
                return;
            }

            this.supabase = window.supabase.createClient(this.SUPABASE_URL, this.SUPABASE_ANON_KEY);
            console.log('Supabase 客戶端建立成功');
            
            // 測試連線
            const { data, error } = await this.supabase.auth.getSession();
            if (error && error.message.includes('Invalid API key')) {
                console.error('Supabase API 金鑰無效，降級到本地模式');
                this.initLocalMode();
                return;
            }
            
            console.log('✅ Supabase 初始化成功，支援真正的跨裝置同步');
            
            // 監聽認證狀態變化
            this.supabase.auth.onAuthStateChange((event, session) => {
                console.log('🔄 認證狀態變化:', event, session?.user?.email || '未登入');
                this.handleAuthChange(event, session);
            });
            
        } catch (error) {
            console.error('❌ Supabase 初始化失敗:', error);
            this.errorManager.logError(error, 'initSupabase', '初始化 Supabase 連接');
            this.initLocalMode();
        }
    }

    // 認證狀態變化處理
    async handleAuthChange(event, session) {
        if (session && session.user) {
            this.user = session.user;
            this.currentUser = session.user.email;
            localStorage.setItem('currentUser', this.currentUser);
            
            // 載入用戶股票
            await this.loadStocks();
            this.renderStocks();
            this.showUserInfo();
            this.hideAuthSection();
            
        } else {
            this.user = null;
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            
            this.showAuthSection();
            this.hideUserInfo();
        }
    }

    async init() {
        console.log('應用程式初始化開始...');
        
        // 等待 Supabase 初始化完成
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.initAuth();
        this.bindEvents();
        await this.initStockDatabase();
        
        // 如果沒有用戶認證，手動載入本地股票
        if (!this.user) {
            await this.loadStocks();
            this.renderStocks();
        }
        
        this.startAutoRefresh();
        console.log('應用程式初始化完成');
    }

    async initStockDatabase() {
        if (window.stockDataFetcher && window.stockDataFetcher.needsUpdate()) {
            console.log('正在更新股票資料庫...');
            this.showUpdateStatus('🔄 正在更新股票資料庫...');
            
            try {
                const success = await window.stockDataFetcher.updateStockList();
                if (success) {
                    this.showUpdateStatus('✅ 股票資料庫已更新', 3000);
                } else {
                    this.showUpdateStatus('⚠️ 使用離線股票資料', 3000);
                }
            } catch (error) {
                console.error('股票資料庫更新失敗:', error);
                this.showUpdateStatus('⚠️ 使用離線股票資料', 3000);
            }
        }
    }

    showCloudLoadNotification() {
        const notification = document.createElement('div');
        notification.id = 'cloudLoadNotification';
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            z-index: 10001;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: slideInRight 0.5s ease-out;
            border-left: 4px solid #ffffff;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">☁️</span>
                <div>
                    <div style="font-weight: 700;">從模擬雲端載入成功</div>
                    <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">
                        資料來源: 瀏覽器本地存儲 (同一瀏覽器內有效)
                    </div>
                </div>
            </div>
        `;
        
        // 添加動畫CSS
        if (!document.getElementById('cloudNotificationStyle')) {
            const style = document.createElement('style');
            style.id = 'cloudNotificationStyle';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // 4秒後自動消失
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    showUpdateStatus(message, hideAfter = null) {
        // 在頁面顯示更新狀態
        let statusDiv = document.getElementById('updateStatus');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'updateStatus';
            statusDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px 15px;
                border-radius: 6px;
                font-size: 14px;
                z-index: 10000;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(statusDiv);
        }
        
        statusDiv.textContent = message;
        statusDiv.style.opacity = '1';
        
        if (hideAfter) {
            setTimeout(() => {
                statusDiv.style.opacity = '0';
                setTimeout(() => statusDiv.remove(), 300);
            }, hideAfter);
        }
    }

    initAuth() {
        console.log(`初始化認證狀態, currentUser: ${this.currentUser}`);
        if (this.currentUser) {
            this.showUserInfo();
            this.hideAuthSection();
            console.log(`已登入使用者: ${this.currentUser}`);
        } else {
            this.showAuthSection();
            this.hideUserInfo();
            console.log('使用者未登入，顯示登入介面');
        }
    }

    showAuthSection() {
        document.getElementById('authSection').style.display = 'block';
    }

    hideAuthSection() {
        document.getElementById('authSection').style.display = 'none';
    }

    showUserInfo() {
        document.getElementById('userInfo').style.display = 'flex';
        document.getElementById('currentUser').textContent = this.currentUser;
        this.updateSyncStatus('✅ 已同步');
    }

    hideUserInfo() {
        document.getElementById('userInfo').style.display = 'none';
    }

    updateSyncStatus(status) {
        document.getElementById('syncStatus').textContent = status;
    }

    updateStockListTitle() {
        const titleElement = document.querySelector('.stocks-section h2');
        if (titleElement) {
            if (this.currentUser) {
                if (this.supabase && this.user) {
                    titleElement.innerHTML = `
                        監控清單 
                        <span style="font-size: 14px; color: #27ae60; font-weight: normal; margin-left: 10px;">
                            ✨ 跨裝置同步 (${this.stocks.length})
                        </span>
                    `;
                } else {
                    titleElement.innerHTML = `
                        監控清單 
                        <span style="font-size: 14px; color: #f39c12; font-weight: normal; margin-left: 10px;">
                            ⚠️ 本地模式 (${this.stocks.length})
                        </span>
                    `;
                }
            } else {
                titleElement.innerHTML = `
                    監控清單 
                    <span style="font-size: 14px; color: #666; font-weight: normal; margin-left: 10px;">
                        💾 本地存儲 (${this.stocks.length})
                    </span>
                `;
            }
        }
    }

    bindEvents() {
        document.getElementById('addStock').addEventListener('click', async () => {
            await this.addStock();
        });

        const stockCodeInput = document.getElementById('stockCode');
        stockCodeInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                await this.addStock();
            }
        });

        stockCodeInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        stockCodeInput.addEventListener('focus', (e) => {
            if (e.target.value.trim()) {
                this.handleSearch(e.target.value);
            }
        });

        stockCodeInput.addEventListener('blur', () => {
            setTimeout(() => this.hideSearchResults(), 200);
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSearchResults();
            }
        });

        // 登入相關事件
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.handleLogin();
        });

        document.getElementById('skipAuth').addEventListener('click', () => {
            this.skipAuth();
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        document.getElementById('userEmail').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });
    }

    async handleLogin() {
        const email = document.getElementById('userEmail').value.trim();
        
        if (!email) {
            this.showAuthStatus('請輸入 Email 地址', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showAuthStatus('請輸入有效的 Email 地址', 'error');
            return;
        }

        this.showAuthStatus('🔄 發送登入連結中...', 'loading');

        try {
            if (this.supabase) {
                // 使用 Supabase Magic Link 登入
                const { data, error } = await this.supabase.auth.signInWithOtp({
                    email: email,
                    options: {
                        shouldCreateUser: true
                    }
                });

                if (error) {
                    throw error;
                }

                this.showAuthStatus('✅ 登入連結已發送到您的信箱！請檢查郵件並點擊連結完成登入。', 'success');
                
            } else {
                // 降級到本地模式
                this.handleLocalLogin(email);
            }
            
        } catch (error) {
            console.error('登入失敗:', error);
            this.errorManager.logError(error, 'login', '用戶登入');
            this.showAuthStatus(`❌ 登入失敗: ${error.message}`, 'error');
            
            // 降級到本地模式
            this.handleLocalLogin(email);
        }
    }

    // 本地模式登入（降級方案）
    async handleLocalLogin(email) {
        console.log('使用本地模式登入:', email);
        
        this.showAuthStatus('🔄 本地模式登入中...', 'loading');
        
        setTimeout(async () => {
            this.currentUser = email;
            localStorage.setItem('currentUser', email);
            
            await this.loadStocks();
            this.showUserInfo();
            this.hideAuthSection();
            this.renderStocks();
            
            this.showAuthStatus('✅ 本地模式登入成功 (限本瀏覽器)', 'success');
        }, 1000);
    }

    async handleLogout() {
        try {
            if (this.supabase && this.user) {
                // Supabase 登出
                await this.supabase.auth.signOut();
                console.log('Supabase 登出成功');
            } else {
                // 本地模式登出
                this.currentUser = null;
                localStorage.removeItem('currentUser');
                
                this.hideUserInfo();
                this.showAuthSection();
                
                // 清空股票列表
                this.stocks = [];
                this.renderStocks();
            }
            
            // 清空輸入框
            document.getElementById('userEmail').value = '';
            this.showAuthStatus('已登出', 'info');
            
        } catch (error) {
            console.error('登出失敗:', error);
            this.showAuthStatus('登出時發生錯誤', 'error');
        }
    }

    skipAuth() {
        this.hideAuthSection();
        // 載入本地股票清單
        this.stocks = JSON.parse(localStorage.getItem('monitoredStocks')) || [];
        this.renderStocks();
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showAuthStatus(message, type = 'info') {
        const statusElement = document.getElementById('authStatus');
        statusElement.textContent = message;
        statusElement.className = `auth-status ${type}`;
        
        if (type === 'success') {
            setTimeout(() => {
                statusElement.textContent = '';
            }, 3000);
        }
    }

    async addStock(stockCode = null) {
        const stockCodeInput = document.getElementById('stockCode');
        const input = stockCode || stockCodeInput.value.trim();

        if (!input) {
            alert('請輸入股票代號或選擇股票');
            return;
        }

        // 將輸入轉換為股票代號
        const finalStockCode = this.resolveToStockCode(input);
        
        if (!finalStockCode) {
            alert('找不到相關股票，請確認輸入的代號或名稱是否正確');
            return;
        }

        if (this.stocks.includes(finalStockCode)) {
            alert('此股票已在監控清單中');
            return;
        }

        // 統一以股票代號儲存
        this.stocks.push(finalStockCode);
        await this.saveToStorage();
        stockCodeInput.value = '';
        this.hideSearchResults();
        this.renderStocks();
    }

    // 將輸入（代號或名稱）解析為標準股票代號
    resolveToStockCode(input) {
        // 優先使用動態股票資料庫
        if (window.stockDataFetcher) {
            const results = window.stockDataFetcher.searchStock(input);
            if (results.length > 0) {
                return results[0].code;
            }
        }
        
        // 備援：使用靜態資料庫
        const results = searchStock(input);
        if (results.length > 0) {
            return results[0].code;
        }
        
        // 如果搜尋不到，檢查是否直接是有效的股票代號
        const stockInfo = this.getStockInfo(input);
        if (stockInfo && stockInfo.name !== input) {
            return input;
        }
        
        return null;
    }

    // 增強的股票資訊獲取
    getStockInfo(code) {
        // 優先使用動態資料庫
        if (window.stockDataFetcher) {
            const fullStockList = window.stockDataFetcher.getFullStockList();
            if (fullStockList[code]) {
                return {
                    name: fullStockList[code].name,
                    fullName: fullStockList[code].fullName,
                    category: fullStockList[code].category,
                    market: fullStockList[code].market
                };
            }
        }
        
        // 備援：使用靜態資料庫
        return getStockInfo(code);
    }

    async removeStock(stockCode) {
        this.stocks = this.stocks.filter(code => code !== stockCode);
        await this.saveToStorage();
        this.renderStocks();
    }

    async loadStocks() {
        if (this.currentUser) {
            // 已登入：從雲端載入
            console.log(`嘗試從雲端載入股票: ${this.currentUser}`);
            this.updateSyncStatus('🔄 從雲端載入股票...');
            
            try {
                const cloudStocks = await this.loadFromCloud();
                if (cloudStocks && cloudStocks.length > 0) {
                    this.stocks = cloudStocks;
                    this.updateSyncStatus(`✅ 模擬雲端載入成功: ${this.stocks.length} 檔股票`);
                    console.log(`從模擬雲端載入股票成功: ${this.stocks.length} 檔`, this.stocks);
                    
                    // 顯示模擬雲端載入提示
                    this.showCloudLoadNotification();
                } else {
                    // 雲端無資料，檢查本地是否有股票
                    const localStocks = JSON.parse(localStorage.getItem('monitoredStocks')) || [];
                    if (localStocks.length > 0) {
                        this.stocks = localStocks;
                        await this.saveToCloud(); // 將本地股票上傳到模擬雲端
                        this.updateSyncStatus(`✅ 本地 ${this.stocks.length} 檔股票已同步到模擬雲端`);
                    } else {
                        this.stocks = [];
                        this.updateSyncStatus('💫 新帳戶，請開始添加股票');
                    }
                }
            } catch (error) {
                console.error('從雲端載入股票失敗:', error);
                // 降級到本地存儲
                const localStocks = JSON.parse(localStorage.getItem('monitoredStocks')) || [];
                this.stocks = localStocks;
                this.updateSyncStatus('⚠️ 雲端載入失敗，使用本地資料');
            }
        } else {
            // 未登入：從本地載入
            this.stocks = JSON.parse(localStorage.getItem('monitoredStocks')) || [];
            console.log(`本地載入股票: 共 ${this.stocks.length} 檔股票`, this.stocks);
        }
    }

    async saveToStorage() {
        // 先保存到本地（備份）
        localStorage.setItem('monitoredStocks', JSON.stringify(this.stocks));
        
        if (this.currentUser) {
            // 已登入：同步到真正的雲端
            try {
                this.updateSyncStatus('🔄 同步到雲端...');
                await this.saveToCloud();
                this.updateSyncStatus(`✅ 已同步 ${this.stocks.length} 檔股票到雲端`);
                console.log(`股票已同步到雲端: ${this.currentUser}, 共 ${this.stocks.length} 檔股票`);
            } catch (error) {
                console.error('雲端同步失敗:', error);
                this.updateSyncStatus('⚠️ 雲端同步失敗，已保存至本地');
                
                // 降級：保存到 localStorage
                const cloudKey = `stocks_${this.currentUser}`;
                localStorage.setItem(cloudKey, JSON.stringify(this.stocks));
            }
        }
    }

    // Supabase 雲端同步功能
    async saveToCloud() {
        if (!this.currentUser) {
            throw new Error('用戶未登入');
        }

        try {
            if (this.supabase && this.user) {
                console.log(`開始保存到 Supabase: ${this.currentUser}`);
                
                const stockData = {
                    user_id: this.user.id,
                    email: this.currentUser,
                    stocks: JSON.stringify(this.stocks),
                    updated_at: new Date().toISOString()
                };

                // 使用 upsert 更新或插入用戶股票資料
                const { data, error } = await this.supabase
                    .from('user_stocks')
                    .upsert(stockData, { 
                        onConflict: 'user_id',
                        returning: 'minimal'
                    });

                if (error) {
                    throw error;
                }

                console.log(`Supabase 保存成功: ${this.stocks.length} 檔股票`);
                
            } else {
                // 降級到本地存儲
                console.log('Supabase 不可用，使用本地存儲');
                localStorage.setItem('monitoredStocks', JSON.stringify(this.stocks));
                localStorage.setItem(`user_stocks_${this.currentUser}`, JSON.stringify({
                    stocks: this.stocks,
                    updated_at: new Date().toISOString()
                }));
            }
            
        } catch (error) {
            console.error('雲端保存失敗:', error);
            // 降級到本地存儲
            localStorage.setItem('monitoredStocks', JSON.stringify(this.stocks));
            throw error;
        }
    }

    async loadFromCloud() {
        if (!this.currentUser) {
            console.log('用戶未登入，載入本地股票');
            const localStocks = JSON.parse(localStorage.getItem('monitoredStocks')) || [];
            return localStocks;
        }

        try {
            if (this.supabase && this.user) {
                console.log(`從 Supabase 載入: ${this.currentUser}`);
                
                const { data, error } = await this.supabase
                    .from('user_stocks')
                    .select('stocks, updated_at')
                    .eq('user_id', this.user.id)
                    .single();

                if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                    throw error;
                }

                if (data && data.stocks) {
                    const stocks = JSON.parse(data.stocks);
                    console.log(`Supabase 載入成功: ${stocks.length} 檔股票`);
                    console.log('最後更新時間:', data.updated_at);
                    return stocks;
                } else {
                    console.log('Supabase 中找不到用戶股票資料');
                    return null;
                }
                
            } else {
                // 降級到本地存儲
                console.log('Supabase 不可用，使用本地存儲');
                const localData = localStorage.getItem(`user_stocks_${this.currentUser}`);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    return parsed.stocks || [];
                }
                return JSON.parse(localStorage.getItem('monitoredStocks')) || [];
            }
            
        } catch (error) {
            console.error('雲端載入失敗:', error);
            // 降級到本地存儲
            const localStocks = JSON.parse(localStorage.getItem('monitoredStocks')) || [];
            return localStocks;
        }
    }

    // 本地模式初始化
    initLocalMode() {
        console.log('⚠️  初始化本地模式 - 僅支援單一瀏覽器同步');
        this.supabase = null;
        
        // 更新 UI 提示
        setTimeout(() => {
            if (document.querySelector('.auth-description')) {
                const descriptions = document.querySelectorAll('.auth-description');
                descriptions.forEach(desc => {
                    if (desc.textContent.includes('Supabase')) {
                        desc.innerHTML = `
                            <span style="color: #f39c12;">⚠️ 目前運行在本地模式</span><br>
                            <span style="font-size: 12px; opacity: 0.8;">
                                僅支援同一瀏覽器內的分頁間同步<br>
                                需要設定 Supabase 來實現真正的跨裝置同步
                            </span>
                        `;
                    }
                });
            }
        }, 1000);
    }

    // 載入所有用戶資料（調試用）
    async loadAllUsersData() {
        try {
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('user_stocks')
                    .select('email, updated_at, stocks');
                
                if (error) throw error;
                
                const result = {};
                data.forEach(row => {
                    result[row.email] = {
                        stocks: JSON.parse(row.stocks || '[]'),
                        updated_at: row.updated_at
                    };
                });
                
                return result;
            } else {
                return { [this.currentUser]: { stocks: this.stocks } };
            }
        } catch (error) {
            console.error('載入用戶資料失敗:', error);
            return {};
        }
    }

    async fetchStockData(stockCode) {
        try {
            // 優先使用真實 API，失敗後使用模擬資料
            const realData = await this.fetchRealStockData(stockCode);
            if (realData) {
                return realData;
            }
            
            // 備援：使用模擬資料
            console.warn(`無法獲取 ${stockCode} 的真實股價，使用模擬資料`);
            const response = await this.simulateApiCall(stockCode);
            return response;
        } catch (error) {
            console.error(`獲取股票 ${stockCode} 資料失敗:`, error);
            return null;
        }
    }

    // 獲取真實股價數據
    async fetchRealStockData(stockCode) {
        const endpoints = [
            // Yahoo Finance API (免費，較穩定)
            () => this.fetchFromYahooFinance(stockCode),
            // 台灣證交所 API
            () => this.fetchFromTWSE(stockCode),
            // 櫃買中心 API
            () => this.fetchFromTPEX(stockCode)
        ];

        for (const endpoint of endpoints) {
            try {
                const data = await endpoint();
                if (data) {
                    return data;
                }
            } catch (error) {
                console.log(`API 端點失敗，嘗試下一個: ${error.message}`);
            }
        }

        return null;
    }

    // Yahoo Finance API
    async fetchFromYahooFinance(stockCode) {
        try {
            // 根據商品類型確定 symbol 格式
            const stockInfo = this.getStockInfo ? this.getStockInfo(stockCode) : getStockInfo(stockCode);
            let symbol;
            
            if (stockInfo.symbol) {
                // 使用預設的 TradingView symbol
                symbol = stockInfo.symbol.replace('TWSE:', '').replace('TAIFEX:', '');
                if (stockInfo.category === '指數') {
                    symbol = `^${symbol}`;
                } else if (stockInfo.category === '期貨' || stockInfo.category === '選擇權') {
                    symbol = `${symbol}=F`;
                } else {
                    symbol = `${symbol}.TW`;
                }
            } else {
                // 一般台股格式: 2330.TW
                symbol = `${stockCode}.TW`;
            }
            
            const corsProxy = 'https://api.allorigins.win/get?url=';
            const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
            
            const response = await fetch(`${corsProxy}${encodeURIComponent(yahooUrl)}`);
            const data = await response.json();
            const content = JSON.parse(data.contents);
            
            if (content.chart && content.chart.result && content.chart.result[0]) {
                const result = content.chart.result[0];
                const meta = result.meta;
                const quote = result.indicators.quote[0];
                
                const stockInfo = this.getStockInfo ? this.getStockInfo(stockCode) : getStockInfo(stockCode);
                
                return {
                    code: stockCode,
                    name: stockInfo.name,
                    fullName: stockInfo.fullName,
                    category: stockInfo.category,
                    price: meta.regularMarketPrice ? meta.regularMarketPrice.toFixed(2) : 'N/A',
                    change: meta.regularMarketPrice && meta.previousClose ? 
                        (meta.regularMarketPrice - meta.previousClose).toFixed(2) : 'N/A',
                    changePercent: meta.regularMarketPrice && meta.previousClose ? 
                        (((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100).toFixed(2) : 'N/A',
                    volume: meta.regularMarketVolume ? meta.regularMarketVolume.toLocaleString() : 'N/A',
                    high: meta.regularMarketDayHigh ? meta.regularMarketDayHigh.toFixed(2) : 'N/A',
                    low: meta.regularMarketDayLow ? meta.regularMarketDayLow.toFixed(2) : 'N/A',
                    open: quote.open && quote.open.length > 0 ? 
                        quote.open[quote.open.length - 1].toFixed(2) : 'N/A',
                    timestamp: new Date().toLocaleTimeString(),
                    source: 'Yahoo Finance'
                };
            }
        } catch (error) {
            console.error('Yahoo Finance API 失敗:', error);
        }
        return null;
    }

    // 台灣證交所 API
    async fetchFromTWSE(stockCode) {
        try {
            const today = new Date().toISOString().slice(0, 7).replace('-', ''); // YYYYMM
            const corsProxy = 'https://api.allorigins.win/get?url=';
            const twseUrl = `https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?date=${today}01&stockNo=${stockCode}`;
            
            const response = await fetch(`${corsProxy}${encodeURIComponent(twseUrl)}`);
            const data = await response.json();
            const content = JSON.parse(data.contents);
            
            if (content.stat === 'OK' && content.data && content.data.length > 0) {
                const latestData = content.data[content.data.length - 1];
                const stockInfo = this.getStockInfo ? this.getStockInfo(stockCode) : getStockInfo(stockCode);
                
                return {
                    code: stockCode,
                    name: stockInfo.name,
                    fullName: stockInfo.fullName,
                    category: stockInfo.category,
                    price: latestData[6], // 收盤價
                    change: latestData[7], // 漲跌價差
                    changePercent: ((parseFloat(latestData[7]) / parseFloat(latestData[6])) * 100).toFixed(2),
                    volume: latestData[1], // 成交股數
                    high: latestData[4], // 最高價
                    low: latestData[5], // 最低價
                    open: latestData[3], // 開盤價
                    timestamp: new Date().toLocaleTimeString(),
                    source: 'TWSE'
                };
            }
        } catch (error) {
            console.error('TWSE API 失敗:', error);
        }
        return null;
    }

    // 櫃買中心 API
    async fetchFromTPEX(stockCode) {
        try {
            const today = new Date();
            const year = today.getFullYear() - 1911; // 民國年
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const corsProxy = 'https://api.allorigins.win/get?url=';
            const tpexUrl = `https://www.tpex.org.tw/web/stock/aftertrading/otc_quotes_no1430/stk_wn1430_result.php?l=zh-tw&d=${year}/${month}&stkno=${stockCode}`;
            
            const response = await fetch(`${corsProxy}${encodeURIComponent(tpexUrl)}`);
            const data = await response.json();
            const content = JSON.parse(data.contents);
            
            if (content.aaData && content.aaData.length > 0) {
                const latestData = content.aaData[content.aaData.length - 1];
                const stockInfo = this.getStockInfo ? this.getStockInfo(stockCode) : getStockInfo(stockCode);
                
                return {
                    code: stockCode,
                    name: stockInfo.name,
                    fullName: stockInfo.fullName,
                    category: stockInfo.category,
                    price: latestData[2], // 收盤價
                    change: latestData[3], // 漲跌
                    changePercent: latestData[4], // 漲跌%
                    volume: latestData[6], // 成交量
                    high: latestData[8], // 最高價
                    low: latestData[9], // 最低價
                    open: latestData[7], // 開盤價
                    timestamp: new Date().toLocaleTimeString(),
                    source: 'TPEX'
                };
            }
        } catch (error) {
            console.error('TPEX API 失敗:', error);
        }
        return null;
    }

    // 模擬 API 呼叫（備援方案）
    async simulateApiCall(stockCode) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // 獲取股票資訊  
                const stockInfo = this.getStockInfo ? this.getStockInfo(stockCode) : getStockInfo(stockCode);
                
                // 產生模擬股價資料
                const basePrice = Math.random() * 500 + 50;
                const change = (Math.random() - 0.5) * 20;
                const changePercent = (change / basePrice * 100);
                
                resolve({
                    code: stockCode,
                    name: stockInfo.name,
                    fullName: stockInfo.fullName,
                    category: stockInfo.category,
                    price: basePrice.toFixed(2),
                    change: change.toFixed(2),
                    changePercent: changePercent.toFixed(2),
                    volume: Math.floor(Math.random() * 10000000).toLocaleString(),
                    high: (basePrice + Math.random() * 10).toFixed(2),
                    low: (basePrice - Math.random() * 10).toFixed(2),
                    open: (basePrice + (Math.random() - 0.5) * 5).toFixed(2),
                    timestamp: new Date().toLocaleTimeString(),
                    source: '模擬數據'
                });
            }, 1000);
        });
    }

    createStockCard(stockData) {
        if (!stockData) {
            return `
                <div class="stock-card error">
                    <div class="stock-header">
                        <span class="stock-code">載入失敗</span>
                        <button class="remove-btn" onclick="stockMonitor.removeStock('${stockData?.code || ''}')">&times;</button>
                    </div>
                    <p>無法獲取股票資料</p>
                </div>
            `;
        }

        const priceClass = stockData.change >= 0 ? 
            (stockData.change > 0 ? 'price-up' : 'price-flat') : 'price-down';

        const changeSymbol = stockData.change >= 0 ? '+' : '';
        
        // 確保使用相同的格式顯示股票資訊
        const displayInfo = {
            code: stockData.code,
            name: stockData.name || '未知',
            category: stockData.category || '未分類'
        };

        return `
            <div class="stock-card" onclick="stockMonitor.openChart('${stockData.code}')" title="點擊查看 K 線圖">
                <div class="stock-header">
                    <div class="stock-title">
                        <span class="stock-code">${displayInfo.code}</span>
                        <span class="stock-name">${displayInfo.name}</span>
                        <span class="stock-category">${displayInfo.category}</span>
                    </div>
                </div>
                
                <div class="stock-price ${priceClass}">$${stockData.price}</div>
                
                <div class="stock-change ${priceClass}">
                    ${changeSymbol}${stockData.change}<br>
                    <small>${changeSymbol}${stockData.changePercent}%</small>
                </div>
                
                <div class="stock-data-item">
                    <span class="stock-data-value">${stockData.volume}</span>
                </div>
                
                <div class="stock-data-item">
                    <span class="stock-data-value">$${stockData.high}</span>
                </div>
                
                <div class="stock-data-item">
                    <span class="stock-data-value">$${stockData.low}</span>
                </div>
                
                <div class="stock-data-item">
                    <span class="stock-data-value">$${stockData.open}</span>
                </div>
                
                <div class="stock-timestamp">
                    ${stockData.timestamp}
                    ${stockData.source ? `<span class="data-source" title="數據來源">[${stockData.source}]</span>` : ''}
                </div>
                
                <div class="stock-actions">
                    <button class="chart-btn" onclick="event.stopPropagation(); stockMonitor.openChart('${stockData.code}')" title="查看 K 線圖">📈</button>
                    <button class="remove-btn" onclick="event.stopPropagation(); stockMonitor.removeStock('${stockData.code}')" title="移除股票">&times;</button>
                </div>
            </div>
        `;
    }

    async renderStocks() {
        const stockListContainer = document.getElementById('stockList');
        
        // 更新標題顯示資料來源
        this.updateStockListTitle();
        
        if (this.stocks.length === 0) {
            stockListContainer.innerHTML = '<p class="loading">尚未添加任何股票到監控清單</p>';
            return;
        }

        // 顯示載入狀態
        stockListContainer.innerHTML = this.stocks.map(code => {
            const stockInfo = this.getStockInfo(code);
            return `
                <div class="stock-card" onclick="stockMonitor.openChart('${code}')" title="點擊查看 K 線圖">
                    <div class="stock-header">
                        <div class="stock-title">
                            <span class="stock-code">${code}</span>
                            <span class="stock-name">${stockInfo.name}</span>
                            <span class="stock-category">${stockInfo.category}</span>
                        </div>
                    </div>
                    
                    <div class="stock-price">載入中...</div>
                    <div class="stock-change">-</div>
                    <div class="stock-data-item">
                        <span class="stock-data-label">開盤</span>
                        <span class="stock-data-value">-</span>
                    </div>
                    <div class="stock-data-item">
                        <span class="stock-data-label">最高</span>
                        <span class="stock-data-value">-</span>
                    </div>
                    <div class="stock-data-item">
                        <span class="stock-data-label">最低</span>
                        <span class="stock-data-value">-</span>
                    </div>
                    <div class="stock-data-item">
                        <span class="stock-data-label">成交量</span>
                        <span class="stock-data-value">-</span>
                    </div>
                    <div class="stock-timestamp">載入中...</div>
                    
                    <div class="stock-actions">
                        <button class="chart-btn" onclick="event.stopPropagation(); stockMonitor.openChart('${code}')" title="查看 K 線圖">📈</button>
                        <button class="remove-btn" onclick="event.stopPropagation(); stockMonitor.removeStock('${code}')" title="移除股票">&times;</button>
                    </div>
                </div>
            `;
        }).join('');

        // 並行獲取所有股票資料
        const stockDataPromises = this.stocks.map(code => this.fetchStockData(code));
        const stocksData = await Promise.all(stockDataPromises);

        // 渲染股票卡片
        stockListContainer.innerHTML = stocksData.map(data => this.createStockCard(data)).join('');
    }

    handleSearch(query) {
        const searchResultsContainer = document.getElementById('searchResults');
        
        if (!query.trim()) {
            this.hideSearchResults();
            return;
        }

        // 優先使用動態股票資料庫搜尋
        let results = [];
        if (window.stockDataFetcher) {
            results = window.stockDataFetcher.searchStock(query);
        }
        
        // 如果動態資料庫沒有結果，使用靜態資料庫
        if (results.length === 0) {
            results = searchStock(query);
        }
        
        if (results.length === 0) {
            searchResultsContainer.innerHTML = `
                <div class="search-result-item search-no-results">
                    <div class="search-result-main">
                        <div class="search-result-name">找不到 "${query}" 相關的股票</div>
                        <div class="search-suggestion">請嘗試輸入完整的股票代號或公司名稱</div>
                    </div>
                </div>
            `;
        } else {
            const resultText = results.length === 1 ? '找到 1 檔股票' : `找到 ${results.length} 檔相關股票`;
            searchResultsContainer.innerHTML = `
                <div class="search-result-header">${resultText}</div>
                ${results.map(stock => `
                    <div class="search-result-item" onclick="stockMonitor.selectStock('${stock.code}')">
                        <div class="search-result-main">
                            <div class="search-result-code">${stock.code}</div>
                            <div class="search-result-name">${stock.name}</div>
                        </div>
                        <div class="search-result-category">${stock.category}</div>
                    </div>
                `).join('')}
            `;
        }
        
        searchResultsContainer.style.display = 'block';
    }

    selectStock(stockCode) {
        // 確保輸入框顯示代號而不是名稱
        document.getElementById('stockCode').value = stockCode;
        this.hideSearchResults();
        this.addStock(stockCode);
    }

    hideSearchResults() {
        const searchResultsContainer = document.getElementById('searchResults');
        searchResultsContainer.style.display = 'none';
    }

    openChart(stockCode) {
        // 顯示選項選單
        this.showChartOptions(stockCode);
    }

    showChartOptions(stockCode) {
        const stockInfo = getStockInfo(stockCode);
        
        // 建立選項彈窗
        const modal = document.createElement('div');
        modal.className = 'chart-modal';
        modal.innerHTML = `
            <div class="chart-modal-content">
                <div class="chart-modal-header">
                    <h3>選擇 ${stockCode} ${stockInfo.name} 的圖表來源</h3>
                    <button class="modal-close" onclick="this.closest('.chart-modal').remove()">&times;</button>
                </div>
                <div class="chart-options">
                    <a href="https://tw.tradingview.com/symbols/TWSE-${stockCode}/" target="_blank" class="chart-option tradingview">
                        <div class="option-icon">📈</div>
                        <div class="option-info">
                            <div class="option-title">TradingView</div>
                            <div class="option-desc">專業技術分析工具</div>
                        </div>
                    </a>
                    
                    <a href="https://tw.stock.yahoo.com/quote/${stockCode}" target="_blank" class="chart-option yahoo">
                        <div class="option-icon">💹</div>
                        <div class="option-info">
                            <div class="option-title">Yahoo 股市</div>
                            <div class="option-desc">即時報價與基本分析</div>
                        </div>
                    </a>
                    
                    <a href="https://www.cnyes.com/twstock/${stockCode}" target="_blank" class="chart-option cnyes">
                        <div class="option-icon">📊</div>
                        <div class="option-info">
                            <div class="option-title">鉅亨網</div>
                            <div class="option-desc">完整財經資訊</div>
                        </div>
                    </a>
                    
                    <a href="https://goodinfo.tw/tw/StockDetail.asp?STOCK_ID=${stockCode}" target="_blank" class="chart-option goodinfo">
                        <div class="option-icon">🔍</div>
                        <div class="option-info">
                            <div class="option-title">Goodinfo</div>
                            <div class="option-desc">詳細基本面分析</div>
                        </div>
                    </a>
                    
                    <button onclick="stockMonitor.openEmbeddedChart('${stockCode}')" class="chart-option embedded">
                        <div class="option-icon">🖥️</div>
                        <div class="option-info">
                            <div class="option-title">內建圖表</div>
                            <div class="option-desc">簡易技術分析 (測試版)</div>
                        </div>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 點擊背景關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    openEmbeddedChart(stockCode) {
        // 關閉選項彈窗
        const modal = document.querySelector('.chart-modal');
        if (modal) modal.remove();
        
        // 開啟內建圖表頁面
        window.open(`chart.html?stock=${stockCode}`, '_blank');
    }

    showSyncDebugInfo() {
        const debugInfo = {
            currentUser: this.currentUser,
            currentStocks: this.stocks,
            localStorage: {}
        };

        // 收集所有相關的 localStorage 資料
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('stocks_') || key.startsWith('cloud_') || key === 'monitoredStocks' || key === 'currentUser')) {
                try {
                    debugInfo.localStorage[key] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    debugInfo.localStorage[key] = localStorage.getItem(key);
                }
            }
        }
        
        // 添加後端服務資訊
        debugInfo.backendService = this.supabase ? 'Supabase (真正跨裝置同步)' : '本地模式 (限單一瀏覽器)';
        debugInfo.supabaseStatus = this.supabase ? '✅ 已連接' : '❌ 未連接';
        debugInfo.crossDeviceSync = this.supabase ? '✅ 支援' : '❌ 不支援';
        
        if (this.currentUser) {
            debugInfo.userType = this.user ? 'Supabase 用戶' : '本地用戶';
            debugInfo.syncScope = this.supabase ? '跨裝置、跨瀏覽器' : '僅限當前瀏覽器';
        }

        // 建立調試彈窗
        const modal = document.createElement('div');
        modal.className = 'chart-modal';
        modal.innerHTML = `
            <div class="chart-modal-content" style="max-width: 600px; max-height: 70vh;">
                <div class="chart-modal-header">
                    <h3>同步調試資訊</h3>
                    <button class="modal-close" onclick="this.closest('.chart-modal').remove()">&times;</button>
                </div>
                <div style="padding: 20px; overflow-y: auto; max-height: 500px;">
                    <h4>目前狀態</h4>
                    <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; overflow-x: auto;">${JSON.stringify(debugInfo, null, 2)}</pre>
                    
                    <div style="margin-top: 20px;">
                        <button onclick="stockMonitor.testCloudConnection()" style="background: #3498db; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-right: 10px;">測試雲端連線</button>
                        <button onclick="stockMonitor.forceSyncCurrentStocks()" style="background: #27ae60; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-right: 10px;">強制同步股票</button>
                        <button onclick="stockMonitor.clearAllSyncData()" style="background: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 4px;">清除所有資料</button>
                    </div>
                    
                    <div style="margin-top: 15px; font-size: 12px; color: #666;">
                        <strong>說明：</strong><br>
                        • currentUser: 當前登入使用者<br>
                        • currentStocks: 目前顯示的股票清單<br>
                        • localStorage: 瀏覽器儲存的所有相關資料
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 點擊背景關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    clearAllSyncData() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('stocks_') || key === 'monitoredStocks' || key === 'currentUser')) {
                keys.push(key);
            }
        }
        
        keys.forEach(key => localStorage.removeItem(key));
        
        // 重新整理頁面
        window.location.reload();
    }

    async forceSyncCurrentStocks() {
        if (this.currentUser) {
            await this.saveToStorage();
            this.updateSyncStatus(`🔄 強制同步完成: ${this.stocks.length} 檔股票`);
        } else {
            alert('請先登入才能同步');
        }
        
        // 關閉彈窗並重新顯示調試資訊
        document.querySelector('.chart-modal').remove();
        setTimeout(() => this.showSyncDebugInfo(), 100);
    }

    async testCloudConnection() {
        if (!this.currentUser) {
            alert('請先登入');
            return;
        }

        try {
            this.updateSyncStatus('🔄 測試雲端連線...');
            const allData = await this.loadAllUsersData();
            const userCount = Object.keys(allData).length;
            alert(`雲端連線成功！\n資料庫中共有 ${userCount} 位用戶\n您的資料: ${allData[this.currentUser] ? '已存在' : '未存在'}`);
            this.updateSyncStatus('✅ 雲端連線測試完成');
        } catch (error) {
            alert(`雲端連線失敗: ${error.message}`);
            this.updateSyncStatus('❌ 雲端連線測試失敗');
        }
        
        // 關閉彈窗並重新顯示調試資訊
        document.querySelector('.chart-modal').remove();
        setTimeout(() => this.showSyncDebugInfo(), 100);
    }

    startAutoRefresh() {
        // 每 30 秒自動更新一次
        setInterval(() => {
            if (this.stocks.length > 0) {
                this.renderStocks();
            }
        }, 30000);
    }
}

// 錯誤管理系統
class ErrorManager {
    constructor() {
        this.errorLog = [];
        this.createErrorUI();
    }

    // 創建錯誤顯示界面
    createErrorUI() {
        // 錯誤通知容器
        if (!document.getElementById('errorContainer')) {
            const errorContainer = document.createElement('div');
            errorContainer.id = 'errorContainer';
            errorContainer.className = 'error-container';
            document.body.appendChild(errorContainer);
        }

        // 錯誤回報按鈕
        if (!document.getElementById('errorReportBtn')) {
            const reportBtn = document.createElement('button');
            reportBtn.id = 'errorReportBtn';
            reportBtn.className = 'error-report-btn';
            reportBtn.innerHTML = '🐛 回報問題';
            reportBtn.title = '回報技術問題給管理員';
            reportBtn.onclick = () => this.showErrorReport();
            document.body.appendChild(reportBtn);
        }
    }

    // 記錄錯誤
    logError(error, context = '', userAction = '') {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            message: error.message || error,
            stack: error.stack || '',
            context: context,
            userAction: userAction,
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: stockMonitor?.currentUser || 'anonymous'
        };

        this.errorLog.push(errorInfo);
        console.error('🐛 錯誤記錄:', errorInfo);

        // 顯示用戶友好的錯誤訊息
        this.showUserError(this.getUserFriendlyMessage(error, context));

        // 自動上傳嚴重錯誤
        if (this.isCriticalError(error)) {
            this.reportError(errorInfo);
        }

        return errorInfo;
    }

    // 轉換為用戶友好的錯誤訊息
    getUserFriendlyMessage(error, context) {
        const message = error.message || error.toString();
        
        if (message.includes('Failed to fetch') || message.includes('Network')) {
            return '網路連線異常，請檢查網路設定後重試';
        }
        
        if (message.includes('Invalid API key') || message.includes('Unauthorized')) {
            return '登入認證失敗，系統已切換到本地模式';
        }
        
        if (message.includes('CORS')) {
            return '資料來源暫時無法存取，正在嘗試備援方案';
        }
        
        if (context.includes('stock')) {
            return '股票資料載入失敗，請稍後重試';
        }
        
        if (context.includes('login') || context.includes('auth')) {
            return '登入過程發生問題，請重新登入';
        }
        
        return `系統發生問題：${message}`;
    }

    // 顯示用戶友好的錯誤訊息
    showUserError(message, type = 'error', duration = 5000) {
        const errorContainer = document.getElementById('errorContainer');
        const errorDiv = document.createElement('div');
        errorDiv.className = `error-notification ${type}`;
        
        const icon = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
        
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">${icon}</span>
                <span class="error-message">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;

        errorContainer.appendChild(errorDiv);

        // 自動移除
        if (duration > 0) {
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, duration);
        }
    }

    // 判斷是否為嚴重錯誤
    isCriticalError(error) {
        const criticalKeywords = [
            'supabase',
            'authentication',
            'database',
            'cors',
            'invalid api key'
        ];

        const errorText = (error.message || error.toString()).toLowerCase();
        return criticalKeywords.some(keyword => errorText.includes(keyword));
    }

    // 顯示錯誤回報界面
    showErrorReport() {
        const recentErrors = this.errorLog.slice(-3); // 最近3個錯誤
        
        const modal = document.createElement('div');
        modal.className = 'error-report-modal';
        modal.innerHTML = `
            <div class="error-report-content">
                <h3>🐛 問題回報</h3>
                <p>請描述您遇到的問題，幫助我們改善系統：</p>
                
                <textarea id="errorDescription" placeholder="請描述您在做什麼時遇到問題，例如：點擊登入按鈕時頁面沒反應..." rows="4"></textarea>
                
                <div class="error-details">
                    <h4>📊 系統狀態：</h4>
                    <div class="system-status">
                        <div>🔗 後端連線: ${stockMonitor?.supabase ? '✅ 已連接' : '❌ 未連接'}</div>
                        <div>👤 登入狀態: ${stockMonitor?.currentUser ? '✅ 已登入' : '❌ 未登入'}</div>
                        <div>📈 監控股票: ${stockMonitor?.stocks?.length || 0} 檔</div>
                        <div>🌐 瀏覽器: ${navigator.userAgent.split(' ').pop()}</div>
                    </div>
                </div>
                
                ${recentErrors.length > 0 ? `
                <div class="recent-errors">
                    <h4>🔍 最近錯誤：</h4>
                    <div class="error-list">
                        ${recentErrors.map(err => `
                            <div class="error-item">
                                <strong>${err.timestamp.split('T')[1].split('.')[0]}</strong>: ${err.message}
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="error-report-actions">
                    <button onclick="this.closest('.error-report-modal').remove()" class="btn-cancel">取消</button>
                    <button onclick="stockMonitor.errorManager.submitErrorReport()" class="btn-submit">送出回報</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // 點擊外部關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // 提交錯誤回報
    async submitErrorReport() {
        const description = document.getElementById('errorDescription').value;
        
        if (!description.trim()) {
            this.showUserError('請描述您遇到的問題', 'warning');
            return;
        }

        const reportData = {
            description: description,
            timestamp: new Date().toISOString(),
            userId: stockMonitor?.currentUser || 'anonymous',
            systemInfo: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                supabaseStatus: stockMonitor?.supabase ? '已連接' : '未連接',
                stockCount: stockMonitor?.stocks?.length || 0,
                recentErrors: this.errorLog.slice(-3)
            }
        };

        try {
            await this.reportError(reportData);
            this.showUserError('問題已成功回報，感謝您的反饋！我們會盡快處理', 'info');
            document.querySelector('.error-report-modal').remove();
            
        } catch (error) {
            console.error('回報失敗:', error);
            
            // 備援：複製到剪貼板
            try {
                await navigator.clipboard.writeText(JSON.stringify(reportData, null, 2));
                this.showUserError('自動回報失敗，已複製問題資訊到剪貼板，請貼到聯絡管理員', 'warning', 8000);
            } catch (clipError) {
                this.showUserError('回報失敗，請截圖此頁面聯絡管理員', 'error', 10000);
            }
        }
    }

    // 發送錯誤回報到後端
    async reportError(errorData) {
        if (stockMonitor?.supabase) {
            try {
                // 嘗試儲存到 user_stocks_history 表作為特殊記錄
                const { error } = await stockMonitor.supabase
                    .from('user_stocks_history')
                    .insert([{
                        user_id: stockMonitor.user?.id || null,
                        stocks_snapshot: JSON.stringify(errorData),
                        action: 'error_report',
                        stock_code: 'SYSTEM_ERROR'
                    }]);
                
                if (!error) {
                    console.log('✅ 錯誤回報已發送到後端');
                    return;
                }
            } catch (supabaseError) {
                console.warn('Supabase 錯誤回報失敗:', supabaseError);
            }
        }
        
        // 備援：存儲到本地等待同步
        const pendingReports = JSON.parse(localStorage.getItem('pendingErrorReports') || '[]');
        pendingReports.push(errorData);
        localStorage.setItem('pendingErrorReports', JSON.stringify(pendingReports));
        console.log('📝 錯誤報告已存儲到本地，等待後續同步');
    }
}

// 初始化應用
const stockMonitor = new StockMonitor();