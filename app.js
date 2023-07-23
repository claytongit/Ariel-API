const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const client = require("./redis");
const getChatCompletion = require("./openai");
const { includeVectors, listVectors, include, list, deleteNamespace } = require("./pinecone");

dotenv.config();

const app = express();
app.use(express.json());
app.use(bodyParser.json());

app.post("/redis/users", (req, res) => {
    const { key } = req.body;

    client.set(`arielKey`, key);

    return res.status(201).json({ "message": "Save" });
});

app.get("/redis/users", async (req, res) => {
    const value = await client.get('arielKey');

    return res.status(200).json(value);
});

app.post("/pinecone/include/vectors", async (req, res) => {
    try {
        await includeVectors(req.body);

        return res.status(201).json({ "message": "Save" });
    } catch (error) {
        return res.status(500).json({ "error": "Internal Server Error" });
    }
});

app.post("/pinecone/list/vectors", async (req, res) => {
    try {
        const queryResponse = await listVectors(req.body);

        return res.status(200).json({queryResponse});
    } catch (error) {
        return res.status(500).json({ "error": "Internal Server Error" });
    }
});

app.post("/pinecone/include", async (req, res) => {
    try {
        await include(req.body);

        return res.status(200).json({"message": "Save data"});
    } catch (error) {
        return res.status(500).json({ "error": "Internal Server Error" });
    }
});

app.post("/pinecone/list", async (req, res) => {
    try {
        const fetchResult = await list(req.body);

        return res.status(200).json({fetchResult});
    } catch (error) {
        return res.status(500).json({ "error": "Internal Server Error" });
    }
});

app.delete("/pinecone/delete/:namespace", async (req, res) => {
    try {
        await deleteNamespace(req.params.namespace);

        return res.status(200).json({"message": "Delete success"});
    } catch (error) {
        return res.status(500).json({ "error": "Internal Server Error" });
    }
});

app.post("/openai/prompt", async (req, res) => {
    const { prompt } = req.body;
    try {
        const completion = await getChatCompletion(prompt);

        return res.status(200).json({ completion });
    } catch (error) {
        console.error("Erro ao chamar a API do OpenAI");
        return res.status(500).json({ error: "Erro ao chamar a API do OpenAI" });
    }
});

client.connect();

app.listen(5000, async () => {
    console.log('SERVIDOR RODANDO PORTA 5000');
});
