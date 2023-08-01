const express = require("express");
const cors    = require("cors");
const bodyParser = require("body-parser");
const { askGPT } = require("./resources/auxiliar");
const { historyRedis } = require('./resources/redis');

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post("/openai/prompt", async (req, res) => {
    const { prompt, userId } = req.body;

    try {
        const answer = await askGPT(prompt, userId);

        return res.status(200).json(answer);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao chamar a API do OpenAI", content: error }); 
    }
});

app.get("/chat/history/:key", async (req, res) => {
    const { key } = req.params;

    const historyChatRedis   = await historyRedis(key);
    const contentHistoryJson = JSON.parse(historyChatRedis);

    return res.status(201).json(contentHistoryJson);
});

app.listen(5000, async () => {
    console.log('SERVIDOR RODANDO PORTA 5000');
});
