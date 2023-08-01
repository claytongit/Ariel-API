const express    = require("express");
const bodyParser = require("body-parser");
const { askGPT, checkHistory } = require("./resources/auxiliar");

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
/*
app.post("/redis/users", (req, res) => {
    const { key } = req.body;

    client.set(`arielKey`, key);

    return res.status(201).json({ "message": "Save" });
});

app.get("/redis/users", async (req, res) => {
    const value = await client.get('arielKey');

    return res.status(200).json(value);
});
*/
app.post("/openai/prompt", async (req, res) => {
    const prompt = req.body.prompt;
    try {
        const answer = await askGPT(prompt);

        return res.status(200).json(answer);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao chamar a API do OpenAI", content: error });
    }
});

app.get("/chat/history", async (req, res) => {
    return res.status(200).json({ content: checkHistory() });
});

app.listen(5000, async () => {
    console.log('SERVIDOR RODANDO PORTA 5000');
});
