const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const client = require("./redis");
const pinecone = require("./pinecone");
const getOpenAICompletion = require("./openai");
const axios = require("axios");

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
        const { text, id, metaValue, name } = req.body;

        const response = await axios.post('https://tfhub.dev/google/universal-sentence-encoder/4?tfjs-format=tfjs', {
            sentences: [text]
        });

        const vectors = response.data;

        const index = pinecone.Index("arielapp");
        const upsertRequest = {
            vectors: [{
                id: id,
                values: vectors,
                metadata: {
                    genre: metaValue
                }
            }],
            namespace: name,
        };
        await index.upsert(upsertRequest);

        return res.status(201).json({ "message": "Save" });
    } catch (error) {
        return res.status(500).json({ "error": "Internal Server Error" });
    }
});

app.post("/pinecone/list/vectors", async (req, res) => {
    const { values, metaValue, name } = req.body;

    const index = pinecone.Index("arielapp");
    const queryRequest = {
        vector: values,
        topK: 10,
        includeValues: true,
        includeMetadata: true,
        filter: {
            genre: { $in: [metaValue] },
        },
        namespace: name,
    };
    const queryResponse = await index.query({ queryRequest });

    return res.status(200).json({queryResponse});
});

app.post("/pinecone/include", async (req, res) => {
    const { vetores, namespace, metadata } = req.body;

    const index = pinecone.Index("arielapp");

    await index.upsert({ 
        upsertRequest: { 
            vectors: [
                { id: '1', values: vetores }
            ],
            metadata: [
                { "exemplo": metadata }
            ], 
            namespace: namespace
        }
    });

    return res.status(200).json({"message": "Save data"});
});

app.post("/pinecone/list", async (req, res) => {
    const { ids, namespace } = req.body;

    const index = pinecone.Index("arielapp");

    const fetchResult = await index.fetch({
        ids,
        namespace
    });

    return res.status(200).json({fetchResult});
});

app.delete("/pinecone/delete/:namespace", async (req, res) => {
    const { namespace } = req.params;

    const index = pinecone.Index("arielapp");

    await index.delete1({
        deleteAll: true,
        namespace: namespace
    });

    return res.status(200).json({"message": "Delete success"});
});

app.post("/openai/chat", async (req, res) => {
    const { prompt } = req.body;
    try {
        const completion = await getOpenAICompletion(prompt);
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
