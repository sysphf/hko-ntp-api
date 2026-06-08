const ntpClient = require('ntp-client');

module.exports = async (req, res) => {
    // 開啟 CORS，讓您的 Google Sites 可以跨站讀取
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const requestStart = Date.now();

    try {
        // 確保 Vercel 伺服器會等待香港天文台的回應
        const date = await new Promise((resolve, reject) => {
            ntpClient.getNetworkTime("stdtime.gov.hk", 123, (err, date) => {
                if (err) reject(err);
                else resolve(date);
            });
        });

        const internalLatency = Date.now() - requestStart;

        // 成功！回傳時間資料
        res.status(200).json({
            success: true,
            source: "stdtime.gov.hk",
            timezone: "Asia/Hong_Kong",
            dateTime: date.toISOString(),
            timestamp: date.getTime(),
            ntpLatency: internalLatency
        });
    } catch (error) {
        console.error("無法連線至天文台 NTP:", error);
        res.status(500).json({ error: "NTP 同步失敗" });
    }
};
