/**
 * 台股資料抓取工具
 * 自動從證交所、櫃買中心等官方來源更新股票清單
 */

class StockDataFetcher {
    constructor() {
        this.apiEndpoints = {
            // 上市股票 - 台灣證券交易所
            listed: 'https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY_ALL',
            // 上櫃股票 - 櫃買中心  
            otc: 'https://www.tpex.org.tw/web/stock/aftertrading/daily_close_quotes/stk_quote_result.php',
            // 股票基本資料
            basicInfo: 'https://www.twse.com.tw/rwd/zh/company/companyInfo'
        };
        
        this.stockList = new Map();
        this.lastUpdateTime = localStorage.getItem('stockListLastUpdate') || null;
        this.updateInterval = 24 * 60 * 60 * 1000; // 24小時更新一次
    }

    /**
     * 檢查是否需要更新股票清單
     */
    needsUpdate() {
        if (!this.lastUpdateTime) return true;
        
        const timeSinceUpdate = Date.now() - parseInt(this.lastUpdateTime);
        return timeSinceUpdate > this.updateInterval;
    }

    /**
     * 抓取上市股票清單
     */
    async fetchListedStocks() {
        try {
            console.log('正在抓取上市股票資料...');
            
            // 由於 CORS 限制，我們需要使用代理或後端服務
            // 這裡先提供模擬實作，實際部署時需要後端支援
            const response = await this.fetchWithFallback(this.apiEndpoints.listed);
            
            if (response && response.data) {
                this.parseListedStockData(response.data);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('抓取上市股票失敗:', error);
            return false;
        }
    }

    /**
     * 抓取上櫃股票清單
     */
    async fetchOTCStocks() {
        try {
            console.log('正在抓取上櫃股票資料...');
            
            const response = await this.fetchWithFallback(this.apiEndpoints.otc);
            
            if (response && response.aaData) {
                this.parseOTCStockData(response.aaData);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('抓取上櫃股票失敗:', error);
            return false;
        }
    }

    /**
     * 解析上市股票資料
     */
    parseListedStockData(data) {
        if (!Array.isArray(data)) return;
        
        data.forEach(item => {
            if (Array.isArray(item) && item.length >= 3) {
                const stockCode = item[0];
                const stockName = item[1];
                
                if (stockCode && stockName) {
                    this.stockList.set(stockCode, {
                        code: stockCode,
                        name: this.cleanStockName(stockName),
                        fullName: stockName,
                        market: '上市',
                        category: this.guessCategory(stockName)
                    });
                }
            }
        });
    }

    /**
     * 解析上櫃股票資料
     */
    parseOTCStockData(data) {
        if (!Array.isArray(data)) return;
        
        data.forEach(item => {
            if (Array.isArray(item) && item.length >= 2) {
                const stockCode = item[0];
                const stockName = item[1];
                
                if (stockCode && stockName) {
                    this.stockList.set(stockCode, {
                        code: stockCode,
                        name: this.cleanStockName(stockName),
                        fullName: stockName,
                        market: '上櫃',
                        category: this.guessCategory(stockName)
                    });
                }
            }
        });
    }

    /**
     * 清理股票名稱（移除特殊符號）
     */
    cleanStockName(name) {
        return name.replace(/[\*\+\-\s]/g, '').trim();
    }

    /**
     * 根據股票名稱猜測產業分類
     */
    guessCategory(name) {
        const categoryKeywords = {
            '半導體': ['台積電', '聯電', '聯發科', '南亞科', '瑞昱', '聯詠'],
            '金融保險': ['金控', '銀行', '保險', '證券', '投信'],
            '電子零組件': ['鴻海', '國巨', '台達電', '光寶'],
            '光電': ['友達', '群創', '亞光', '大立光'],
            '通信網路': ['中華電', '遠傳', '台灣大', '宏達電'],
            '航運': ['長榮', '陽明', '萬海'],
            '航空': ['華航', '長榮航'],
            '鋼鐵': ['中鋼', '豐興'],
            '汽車': ['和泰車', '裕隆'],
            'ETF': ['元大', '富邦', '國泰', 'ETF']
        };

        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => name.includes(keyword))) {
                return category;
            }
        }

        return '其他';
    }

    /**
     * 使用備援方式抓取資料（處理 CORS 問題）
     */
    async fetchWithFallback(url) {
        try {
            // 方法1: 直接抓取
            const response = await fetch(url, {
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.log('直接抓取失敗，嘗試備援方案');
        }

        try {
            // 方法2: 使用公開 CORS 代理
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            
            if (response.ok) {
                const data = await response.json();
                return JSON.parse(data.contents);
            }
        } catch (error) {
            console.log('代理抓取也失敗');
        }

        // 方法3: 使用預建的靜態資料作為備援
        return this.getFallbackData();
    }

    /**
     * 備援資料（手動維護的常見股票清單）
     */
    getFallbackData() {
        console.log('使用備援股票資料');
        
        // 返回預建的股票清單
        const fallbackStocks = [
            // 權值股前50大
            { code: '2330', name: '台積電', fullName: '台灣積體電路製造股份有限公司', category: '半導體' },
            { code: '2317', name: '鴻海', fullName: '鴻海精密工業股份有限公司', category: '電子零組件' },
            { code: '2454', name: '聯發科', fullName: '聯發科技股份有限公司', category: '半導體' },
            // ... 可擴充更多
        ];

        fallbackStocks.forEach(stock => {
            this.stockList.set(stock.code, stock);
        });

        return { fallback: true };
    }

    /**
     * 更新股票清單
     */
    async updateStockList() {
        console.log('開始更新股票清單...');
        
        const results = await Promise.allSettled([
            this.fetchListedStocks(),
            this.fetchOTCStocks()
        ]);

        let successCount = 0;
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                successCount++;
            }
        });

        if (successCount > 0) {
            // 保存到 localStorage
            const stockData = Object.fromEntries(this.stockList);
            localStorage.setItem('fullStockList', JSON.stringify(stockData));
            localStorage.setItem('stockListLastUpdate', Date.now().toString());
            
            console.log(`股票清單更新完成，共 ${this.stockList.size} 檔股票`);
            return true;
        } else {
            console.log('股票清單更新失敗，使用現有資料');
            return false;
        }
    }

    /**
     * 獲取完整股票清單
     */
    getFullStockList() {
        const cached = localStorage.getItem('fullStockList');
        if (cached) {
            return JSON.parse(cached);
        }
        return {};
    }

    /**
     * 搜尋股票（支援代號和名稱）
     */
    searchStock(query) {
        const stockData = this.getFullStockList();
        const results = [];
        const lowerQuery = query.toLowerCase();

        Object.values(stockData).forEach(stock => {
            if (stock.code.includes(query) || 
                stock.name.toLowerCase().includes(lowerQuery) ||
                stock.fullName.toLowerCase().includes(lowerQuery)) {
                results.push(stock);
            }
        });

        return results.slice(0, 10); // 限制 10 個結果
    }
}

// 全域實例
window.stockDataFetcher = new StockDataFetcher();