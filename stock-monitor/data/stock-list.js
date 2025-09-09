// 台股常見股票代號與公司名稱對照表
const STOCK_DATA = {
    // 權值股
    '2330': { name: '台積電', fullName: '台灣積體電路製造股份有限公司', category: '半導體' },
    '2317': { name: '鴻海', fullName: '鴻海精密工業股份有限公司', category: '電子零組件' },
    '2454': { name: '聯發科', fullName: '聯發科技股份有限公司', category: '半導體' },
    '2308': { name: '台達電', fullName: '台達電子工業股份有限公司', category: '電子零組件' },
    '2382': { name: '廣達', fullName: '廣達電腦股份有限公司', category: '電腦及週邊設備' },
    '2412': { name: '中華電', fullName: '中華電信股份有限公司', category: '通信網路' },
    '2881': { name: '富邦金', fullName: '富邦金融控股股份有限公司', category: '金融保險' },
    '2882': { name: '國泰金', fullName: '國泰金融控股股份有限公司', category: '金融保險' },
    '2883': { name: '開發金', fullName: '中華開發金融控股股份有限公司', category: '金融保險' },
    '2885': { name: '元大金', fullName: '元大金融控股股份有限公司', category: '金融保險' },
    '2886': { name: '兆豐金', fullName: '兆豐金融控股股份有限公司', category: '金融保險' },
    '2887': { name: '台新金', fullName: '台新金融控股股份有限公司', category: '金融保險' },
    '2890': { name: '永豐金', fullName: '永豐金融控股股份有限公司', category: '金融保險' },
    '2891': { name: '中信金', fullName: '中國信託金融控股股份有限公司', category: '金融保險' },
    '2892': { name: '第一金', fullName: '第一金融控股股份有限公司', category: '金融保險' },
    
    // ETF
    '0050': { name: '元大台灣50', fullName: '元大台灣卓越50證券投資信託基金', category: 'ETF' },
    '0056': { name: '元大高股息', fullName: '元大台灣高股息證券投資信託基金', category: 'ETF' },
    '006208': { name: '富邦台50', fullName: '富邦台灣采吉50基金', category: 'ETF' },
    '00881': { name: '國泰台灣5G+', fullName: '國泰台灣5G+ ETF基金', category: 'ETF' },
    '00900': { name: '富邦特選高股息30', fullName: '富邦特選高股息30 ETF基金', category: 'ETF' },
    
    // 科技股
    '2303': { name: '聯電', fullName: '聯華電子股份有限公司', category: '半導體' },
    '2379': { name: '瑞昱', fullName: '瑞昱半導體股份有限公司', category: '半導體' },
    '3034': { name: '聯詠', fullName: '聯詠科技股份有限公司', category: '半導體' },
    '3711': { name: '日月光投控', fullName: '日月光投資控股股份有限公司', category: '半導體' },
    '2357': { name: '華碩', fullName: '華碩電腦股份有限公司', category: '電腦及週邊設備' },
    '2409': { name: '友達', fullName: '友達光電股份有限公司', category: '光電' },
    '2474': { name: '可成', fullName: '可成科技股份有限公司', category: '電子零組件' },
    
    // 傳統產業
    '1301': { name: '台塑', fullName: '台灣塑膠工業股份有限公司', category: '塑膠' },
    '1303': { name: '南亞', fullName: '南亞塑膠工業股份有限公司', category: '塑膠' },
    '2002': { name: '中鋼', fullName: '中國鋼鐵股份有限公司', category: '鋼鐵' },
    '2207': { name: '和泰車', fullName: '和泰汽車股份有限公司', category: '汽車' },
    '2301': { name: '光寶科', fullName: '光寶科技股份有限公司', category: '電子零組件' },
    '2395': { name: '研華', fullName: '研華股份有限公司', category: '電腦及週邊設備' },
    
    // 生技醫療
    '4904': { name: '遠傳', fullName: '遠傳電信股份有限公司', category: '通信網路' },
    '6505': { name: '台塑化', fullName: '台塑石化股份有限公司', category: '油電燃氣' },
    '1216': { name: '統一', fullName: '統一企業股份有限公司', category: '食品' },
    '1101': { name: '台泥', fullName: '台灣水泥股份有限公司', category: '水泥' },
    '2912': { name: '統一超', fullName: '統一超商股份有限公司', category: '貿易百貨' },

    // 大盤指數
    'TAIEX': { name: '加權指數', fullName: '台灣證券交易所發行量加權股價指數', category: '指數', symbol: 'TWSE:TAIEX' },
    'OTC': { name: '櫃買指數', fullName: '櫃檯買賣中心指數', category: '指數', symbol: 'TWSE:OTC' },
    'TPEx': { name: '興櫃指數', fullName: '興櫃股票指數', category: '指數', symbol: 'TWSE:TPEx' },
    'MSE': { name: '電子指數', fullName: '電子類股指數', category: '指數', symbol: 'TWSE:MSE' },
    'TPEX': { name: '櫃檯指數', fullName: '櫃檯買賣指數', category: '指數', symbol: 'TWSE:TPEX' },

    // 期貨商品
    'TX': { name: '台指期', fullName: '臺灣證券交易所股價指數期貨', category: '期貨', symbol: 'TAIFEX:TX1!' },
    'MTX': { name: '小台指期', fullName: '小型臺灣證券交易所股價指數期貨', category: '期貨', symbol: 'TAIFEX:MTX1!' },
    'TXO': { name: '台指選擇權', fullName: '臺灣證券交易所股價指數選擇權', category: '選擇權', symbol: 'TAIFEX:TXO' },
    'TE': { name: '電子期', fullName: '電子類股指數期貨', category: '期貨', symbol: 'TAIFEX:TE1!' },
    'TF': { name: '金融期', fullName: '金融保險類股指數期貨', category: '期貨', symbol: 'TAIFEX:TF1!' },
    
    // 其他重要個股
    '2603': { name: '長榮', fullName: '長榮海運股份有限公司', category: '航運' },
    '2609': { name: '陽明', fullName: '陽明海運股份有限公司', category: '航運' },
    '2610': { name: '華航', fullName: '中華航空股份有限公司', category: '航空' },
    '2618': { name: '長榮航', fullName: '長榮航空股份有限公司', category: '航空' },
    '1605': { name: '華新', fullName: '華新麗華股份有限公司', category: '電線電纜' },
    
    // 補充更多常見股票
    '1504': { name: '東元', fullName: '東元電機股份有限公司', category: '電機機械' },
    '2327': { name: '國巨', fullName: '國巨股份有限公司', category: '電子零組件' },
    '2356': { name: '英業達', fullName: '英業達股份有限公司', category: '電腦及週邊設備' },
    '2377': { name: '微星', fullName: '微星科技股份有限公司', category: '電腦及週邊設備' },
    '2408': { name: '南亞科', fullName: '南亞科技股份有限公司', category: '半導體' },
    '2498': { name: '宏達電', fullName: '宏達國際電子股份有限公司', category: '通信網路' },
    '3008': { name: '大立光', fullName: '大立光電股份有限公司', category: '光電' },
    '3019': { name: '亞光', fullName: '亞光科技股份有限公司', category: '光電' },
    '3045': { name: '台灣大', fullName: '台灣大哥大股份有限公司', category: '通信網路' },
    '6505': { name: '台塑化', fullName: '台塑石化股份有限公司', category: '油電燃氣' },
    '9904': { name: '寶成', fullName: '寶成工業股份有限公司', category: '紡織纖維' }
};

// 建立搜尋索引
function createSearchIndex() {
    const searchIndex = {};
    
    Object.entries(STOCK_DATA).forEach(([code, info]) => {
        const stockEntry = { code, ...info };
        
        // 以代號為鍵
        searchIndex[code] = stockEntry;
        
        // 以公司簡稱為鍵 - 修正為直接存儲，避免陣列複雜性
        const nameKey = info.name.toLowerCase();
        searchIndex[nameKey] = stockEntry;
        
        // 以公司全名關鍵字為鍵
        const fullNameKey = info.fullName.toLowerCase();
        searchIndex[fullNameKey] = stockEntry;
        
        // 特殊關鍵字映射（大盤、期貨等）
        if (info.category === '指數') {
            // 大盤指數的別名映射
            const indexAliases = {
                'TAIEX': ['大盤', '加權', '加權指數', '台股指數'],
                'OTC': ['櫃買', '櫃買指數'],
                'TPEx': ['興櫃', '興櫃指數'],
                'MSE': ['電子', '電子指數'],
                'TPEX': ['櫃檯', '櫃檯指數']
            };
            
            if (indexAliases[code]) {
                indexAliases[code].forEach(alias => {
                    searchIndex[alias] = stockEntry;
                });
            }
        }
        
        if (info.category === '期貨' || info.category === '選擇權') {
            // 期貨商品的別名映射
            const futuresAliases = {
                'TX': ['台指期', '大台', '台指'],
                'MTX': ['小台', '小台指', '迷你台指'],
                'TXO': ['台指選擇權', '選擇權'],
                'TE': ['電子期', '電子期貨'],
                'TF': ['金融期', '金融期貨']
            };
            
            if (futuresAliases[code]) {
                futuresAliases[code].forEach(alias => {
                    searchIndex[alias] = stockEntry;
                });
            }
        }
    });
    
    return searchIndex;
}

// 搜尋股票
function searchStock(query) {
    const searchIndex = createSearchIndex();
    const lowerQuery = query.toLowerCase().trim();
    const results = [];
    
    // 精確匹配代號
    if (searchIndex[lowerQuery] && !Array.isArray(searchIndex[lowerQuery])) {
        results.push(searchIndex[lowerQuery]);
    }
    
    // 模糊搜尋公司名稱
    Object.entries(STOCK_DATA).forEach(([code, info]) => {
        if (info.name.includes(lowerQuery) || 
            info.fullName.toLowerCase().includes(lowerQuery) ||
            code.includes(lowerQuery)) {
            const existing = results.find(r => r.code === code);
            if (!existing) {
                results.push({ code, ...info });
            }
        }
    });
    
    return results.slice(0, 10); // 限制返回 10 個結果
}

// 取得股票資訊
function getStockInfo(code) {
    return STOCK_DATA[code] || { name: code, fullName: `股票代號 ${code}`, category: '未分類' };
}