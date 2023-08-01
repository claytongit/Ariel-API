const redis = require("redis");

async function historyRedis(key) {
    const client = redis.createClient({
        url: process.env.REDIS_URL,
    });

    client.connect();

    const history = await client.get(`history:${ key }`);

    if (history == null) {
        return false;
    }

    return history;
}

function setHistoryRedis(userId, historyChatRedis) {
    const client = redis.createClient({
        url: process.env.REDIS_URL,
    });

    client.connect();

    client.set(`history:${ userId }`, JSON.stringify(historyChatRedis)); 
}

module.exports = {
    historyRedis,
    setHistoryRedis,
};