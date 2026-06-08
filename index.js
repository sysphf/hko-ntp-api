const express = require('express');
const cors = require('cors');
const ntpClient = require('ntp-client');

const app = express();

// 啟用 CORS，允許所有網站 (包含您的 Google Sites) 來讀取這個 API
app.use(cors());

// 建立 API 路由：當網頁呼叫 /api/time 時，執行以下邏輯
app.get('/api/time', (req, res) => {
    
    // 記錄開始向天文台發送請求的時間
    const requestStart = Date.now();

    // 向香港天文台 (stdtime.gov.hk) 的 123 port 發送 NTP 請求
    ntpClient.getNetworkTime("stdtime.gov.hk", 123, (err, date) => {
        if (err) {
            console.error("無法連線至天文台 NTP 伺服器:", err);
            return res.status(500).json({ error: "NTP 同步失敗" });
        }

        const requestEnd = Date.now();
        
        // 伺服器向天文台請求所花費的內部延遲時間
        const internalLatency = requestEnd - requestStart;

        // 回傳精準時間資料給您的前端網頁
        res.json({
            success: true,
            source: "stdtime.gov.hk",
            timezone: "Asia/Hong_Kong",
            dateTime: date.toISOString(),  // ISO 格式時間
            timestamp: date.getTime(),     // 毫秒級時間戳
            ntpLatency: internalLatency    // 天文台回應耗時 (供前端參考)
        });
    });
});

// 根目錄測試畫面 (確認伺服器有活著)
app.get('/', (req, res) => {
    res.send('香港天文台中繼伺服器運作中！請訪問 /api/time 獲取時間。');
});

// 設定伺服器監聽的 Port (雲端平台會自動分配 process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});