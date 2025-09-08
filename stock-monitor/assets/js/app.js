class StockMonitor {
    constructor() {
        this.stocks = JSON.parse(localStorage.getItem('monitoredStocks')) || [];
        this.apiKey = 'demo'; // 使用示範 API key，實際使用時需要申請真實的 API key
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderStocks();
        this.startAutoRefresh();
    }

    bindEvents() {
        document.getElementById('addStock').addEventListener('click', () => {
            this.addStock();
        });

        const stockCodeInput = document.getElementById('stockCode');
        stockCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addStock();
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
    }

    addStock(stockCode = null) {
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
        this.saveToStorage();
        stockCodeInput.value = '';
        this.hideSearchResults();
        this.renderStocks();
    }

    // 將輸入（代號或名稱）解析為標準股票代號
    resolveToStockCode(input) {
        // 先搜尋看是否能找到匹配的股票
        const results = searchStock(input);
        if (results.length > 0) {
            // 返回第一個匹配結果的股票代號
            return results[0].code;
        }
        
        // 如果搜尋不到，檢查是否直接是有效的股票代號
        const stockInfo = getStockInfo(input);
        if (stockInfo && stockInfo.name !== input) {
            // 如果有找到股票資訊且名稱不等於輸入，表示輸入的是有效代號
            return input;
        }
        
        return null;
    }

    removeStock(stockCode) {
        this.stocks = this.stocks.filter(code => code !== stockCode);
        this.saveToStorage();
        this.renderStocks();
    }

    saveToStorage() {
        localStorage.setItem('monitoredStocks', JSON.stringify(this.stocks));
    }

    async fetchStockData(stockCode) {
        try {
            // 使用台股 API（這裡使用模擬資料，實際應用需要接入真實 API）
            // 實際可使用的 API: Yahoo Finance, Alpha Vantage, 或台灣證交所 API
            const response = await this.simulateApiCall(stockCode);
            return response;
        } catch (error) {
            console.error(`獲取股票 ${stockCode} 資料失敗:`, error);
            return null;
        }
    }

    // 模擬 API 呼叫（實際應用中應替換為真實 API）
    async simulateApiCall(stockCode) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // 獲取股票資訊
                const stockInfo = getStockInfo(stockCode);
                
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
                    timestamp: new Date().toLocaleTimeString()
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
                    <span class="stock-data-label">開盤</span>
                    <span class="stock-data-value">$${stockData.open}</span>
                </div>
                
                <div class="stock-data-item">
                    <span class="stock-data-label">最高</span>
                    <span class="stock-data-value">$${stockData.high}</span>
                </div>
                
                <div class="stock-data-item">
                    <span class="stock-data-label">最低</span>
                    <span class="stock-data-value">$${stockData.low}</span>
                </div>
                
                <div class="stock-data-item">
                    <span class="stock-data-label">成交量</span>
                    <span class="stock-data-value">${stockData.volume}</span>
                </div>
                
                <div class="stock-timestamp">${stockData.timestamp}</div>
                
                <div class="stock-actions">
                    <button class="chart-btn" onclick="event.stopPropagation(); stockMonitor.openChart('${stockData.code}')" title="查看 K 線圖">📈</button>
                    <button class="remove-btn" onclick="event.stopPropagation(); stockMonitor.removeStock('${stockData.code}')" title="移除股票">&times;</button>
                </div>
            </div>
        `;
    }

    async renderStocks() {
        const stockListContainer = document.getElementById('stockList');
        
        if (this.stocks.length === 0) {
            stockListContainer.innerHTML = '<p class="loading">尚未添加任何股票到監控清單</p>';
            return;
        }

        // 顯示載入狀態
        stockListContainer.innerHTML = this.stocks.map(code => {
            const stockInfo = getStockInfo(code);
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

        const results = searchStock(query);
        
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

    startAutoRefresh() {
        // 每 30 秒自動更新一次
        setInterval(() => {
            if (this.stocks.length > 0) {
                this.renderStocks();
            }
        }, 30000);
    }
}

// 初始化應用
const stockMonitor = new StockMonitor();