const express = require("express");
const cors    = require("cors");
const bodyParser = require("body-parser");
const { askGPT } = require("./resources/auxiliar");
const { getHistoryChat } = require('./resources/redis');

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
        if (prompt == "") {
            return res.status(400).json({ error: "Bad Request", content: "Prompt vazio" }); 
        }

        if (userId == "") {
            return res.status(400).json({ error: "Bad Request", content: "ID vazio" }); 
        }

        const answer = await askGPT(prompt, userId);

        return res.status(200).json(answer);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", content: "Erro ao chamar a API da OpenAI" }); 
    }
});

app.get("/chat/history/:key", async (req, res) => {
    const { key } = req.params;

    const historyChatRedis   = await getHistoryChat(key);
    const contentHistoryJson = JSON.parse(historyChatRedis);

    return res.status(201).json(contentHistoryJson);
});

app.listen(5000, async () => {
    console.log('SERVIDOR RODANDO PORTA 5000');
});
