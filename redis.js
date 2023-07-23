const redis = require("redis");

const client = redis.createClient({
    url: process.env.REDIS_URL,
});

client.on("connect", () => {
    console.log("Conexão com o Redis estabelecida com sucesso!");
});

module.exports = client;
