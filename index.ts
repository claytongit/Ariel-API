import express from "express";
import axios   from "axios";
import dotenv  from "dotenv";
import { PineconeClient } from "@pinecone-database/pinecone";

dotenv.config();

const redis    = require("redis"); 
const app      = express();
const pinecone = new PineconeClient();
  
pinecone.init({      
	environment: "asia-southeast1-gcp-free",      
	apiKey:      process.env.PINECONE_API_KEY,
});

const client = redis.createClient({
    url: process.env.REDIS_URL,
});

client.on("connect", () => {
    console.log("Conexão com o Redis estabelecida com sucesso!");
});

app.use(express.json());

// Método POST para salvar a chave (REDIS)
app.post("/redis/users", (req, res) => {
    const { key } = req.body;

    client.set(`arielKey`, key);

    return res.status(201).json({ "message": "Save" });
});

// Método GET para pegar a chave (REDIS)
app.get("/redis/users", async (req, res) => {
    const value = await client.get('arielKey');

    return res.status(200).json(value);
});

// Método POST (Pinecone)
app.post("/pinecone/includ/vectors", async (req, res) => {
    const { id, values, metaValue, name } = req.body;

    const index = pinecone.Index("arielapp");
    const upsertRequest = {
        vectors: [{
            id: id,
            values: values,
            metadata: { 
                genre: metaValue 
            }
        }],
        namespace: name,
    };
    await index.upsert({ upsertRequest });

    return res.status(201).json({ "message": "Save" });
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

// Método POST (OpenAI)
app.post("/openai/prompt", async (req, res) => {
    const { prompt } = req.body;
    const apiKey = "SUA_CHAVE_DE_API_DO_OPENAI";

    try {
        const response = await axios.post(
        "https://api.openai.com/v1/engines/davinci-codex/completions",
        {
            prompt,
            max_tokens: 150,
        },
        {
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ apiKey }`,
            },
        }
        );
        const completion = response.data.choices[0].text;

        return res.status(200).json({ completion });
    } catch (error) {
        console.error("Erro ao chamar a API do OpenAI");
        return res.status(500).json({ error: "Erro ao chamar a API do OpenAI" });
    }

});

client.connect();

app.listen(5000, () => console.log('SERVIDOR RODANDO PORTA 5000'));