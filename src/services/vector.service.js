// Import the Pinecone library
require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE });

// Create a dense index with integrated embedding
const chatGptCloneIndex = pc.index('chatgpt');


//create memory : upserts the vector in the database 
async function createMemory({messageId, vector, metadata}){
    await chatGptCloneIndex.upsert([
        {
            id:messageId,
            values:vector,
            metadata    
        }
    ])
}


// give the result of the query
async function queryMemory({queryVector, limit,metadata }){
    const data = await chatGptCloneIndex.query({
        vector:queryVector,
        topK:limit, 
        includeMetadata:true
    })
    
    return data.matches;

}

module.exports = {createMemory, queryMemory};
