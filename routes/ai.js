const express = require('express');
const router = express.Router();
//const apicache = require('apicache');

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const GOOGLE_AI_KEY = process.env.GOOGLE_AI_KEY;

// Cache
//let cache = apicache.middleware;

router.post('/:game/:username', async (req, res, next) => {
  try {
    const { prompt } = req.query;
    const game = req.params.game;
    let username = req.params.username;
    const context = req.body;
    
    if (prompt == null) {
        res.status(400).json({message: 'Please use query param for prompt', status: 400});
        return;
    }

    if (username === 'undefined') {
        username = "Player";
    }

    const generationConfig = {
        temperature: 1,
        topK: 0,
        topP: 0.95,
        maxOutputTokens: 8192,
    };
  
    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    const genAI = new GoogleGenerativeAI(GOOGLE_AI_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
            {
                role: "user",
                parts: [{ 
                    text: `My username/name is ${username} and I am a ${game} player. Here is some extra information that might help you: ${JSON.stringify(context)}` 
                }],
            },
            {
                role: "model",
                parts: [{ text: `Hello ${username}, I am here to help and guide you` }],
            },
        ],
    });

    /*const history = await chat.getHistory();
    const msgContent = { role: "user", parts: [{ text: msg }] };
    const contents = [...history, msgContent];
    const { totalTokens } = await model.countTokens({ contents });*/  

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json(text);
  } catch (error) {
    next(error);
  }
});

module.exports = router;