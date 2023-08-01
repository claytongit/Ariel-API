const redis = require("redis");

async function getHistoryChat(key) {
    const client = redis.createClient({
        url: process.env.REDIS_URL,
    });

    client.connect();

    const history = await client.get(`history:${ key }`);

    return history;
}

function setHistoryChat(userId, historyChat) {
    const client = redis.createClient({
        url: process.env.REDIS_URL,
    });

    client.connect();

    client.set(`history:${ userId }`, JSON.stringify(historyChat)); 
}

module.exports = {
    getHistoryChat,
    setHistoryChat,
};