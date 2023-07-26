const { PineconeClient } = require("@pinecone-database/pinecone");
const dotenv             = require("../node_modules/dotenv");

dotenv.config();

const pinecone = new PineconeClient();

pinecone.init({      
	environment: "asia-southeast1-gcp-free",      
	apiKey: process.env.PINECONE_API_KEY
});

async function include(id, vector, namespace, metadata) {
    const index = await pinecone.Index("arielapp");

    await index.upsert({
        upsertRequest: {
            vectors: [
                {
                    id: id,
                    values: vector,
                    metadata: { content: metadata },
                }
            ],
            namespace: namespace
        }
    });
}

async function deleteNamespace(namespace) {
    const index = await pinecone.Index("arielapp");

    return await index.delete1({
        deleteAll: true,
        namespace: namespace
    });
}

async function searchBySimilarity(questionVector) {
    const index = await pinecone.Index("arielapp");
    var content = "";

    const queryResponse = await index.query({
        queryRequest: {
            topK: 2,
            vector: questionVector,
            namespace: 'tecnico',
            includeMetadata: true
        }
    });

    for (const match of queryResponse.matches) {
        content += match.metadata.content;
    }

    return "'''" + content + "'''";
}

module.exports = { include, deleteNamespace, searchBySimilarity };
