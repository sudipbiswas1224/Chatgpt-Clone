require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

//generating response from AI
async function generateResponse(content) {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: content,
    });
    return response.text;
}

//generating vector from the content
async function generateVector(content) {
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: content,
        config: {
            outputDimensionality: 768
        }
    });
    return response.embeddings[0].values;
}
module.exports = { generateResponse, generateVector };

