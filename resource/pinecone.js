const { PineconeClient } = require("@pinecone-database/pinecone");
const axios = require("axios");

const pinecone = new PineconeClient();

pinecone.init({      
	environment: "asia-southeast1-gcp-free",      
	apiKey:      process.env.PINECONE_API_KEY,
});

const index = pinecone.Index("arielapp");

async function includeVectors(reqBody) {
    const { text, id, metaValue, name } = reqBody;

    const response = await axios.post('https://tfhub.dev/google/universal-sentence-encoder/4?tfjs-format=tfjs', {
        sentences: [text]
    });

    const vectors = response.data;
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

    return await index.upsert(upsertRequest);
}

async function listVectors(reqBody) {
    const { values, metaValue, name } = reqBody;

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

    return await index.query({ queryRequest });
}

async function include(reqBody) {
    const { vetores, namespace, metadata } = reqBody;

    return await index.upsert({ 
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
}

async function list(reqBody) {
    const { ids, namespace } = reqBody;

    return await index.fetch({
        ids,
        namespace
    });
}

async function deleteNamespace(namespace) {
    return await index.delete1({
        deleteAll: true,
        namespace: namespace
    });
}

module.exports = { includeVectors, listVectors, include, list, deleteNamespace };
