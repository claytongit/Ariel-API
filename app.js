const express              = require("express");
const dotenv               = require("dotenv");
const bodyParser           = require("body-parser");
//const client               = require("./resources/redis");
const getChatCompletion    = require("./resources/openai");
const insertTechnicalInfo  = require("./resources/auxiliar");

dotenv.config();

const app = express();

app.use(express.json());
app.use(bodyParser.json());
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
    const { prompt } = req.body;
    try {
        const completion = await getChatCompletion(prompt);

        // checkHistorySize();

        return res.status(200).json({ completion });
    } catch (error) {
        return res.status(500).json({ error: "Erro ao chamar a API do OpenAI" });
    }
});

app.get("/upload-tecnico", async (req, res) => {
    try {
        await insertTechnicalInfo();

        return res.status(200).json({ "message": "Success" });
    } catch (error) {
        return res.status(500).json({ error: "Erro ao chamar a API do OpenAI" });
    }
});

app.get("/reset-tecnico", async (req, res) => {
    try {
        await resetTechnicalInfo();

        return res.status(200).json({ "message": "Success" });
    } catch (error) {
        return res.status(500).json({ error: "Erro ao chamar a API do OpenAI" });
    }
});

//client.connect();

app.listen(5000, async () => {
    console.log('SERVIDOR RODANDO PORTA 5000');
});
