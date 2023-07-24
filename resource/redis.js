const redis = require("redis");

try {
    const client = redis.createClient({
        url: process.env.REDIS_URL,
    });

    client.on("connect", () => {
        console.log("Conexão com o Redis estabelecida com sucesso!");
    });
} catch (error) {
    console.log("Erro ao estabelecer conexão com o Redis");
    throw error;
}

module.exports = client;
