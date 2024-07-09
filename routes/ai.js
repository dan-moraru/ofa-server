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
    const currQuest = context.active_quest.split('/').pop();
    
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
                parts: [
                    { 
                        text: `My username/name is ${username} and I am a ${game} player.` 
                    },
                    {
                        text: `Here is some extra information that might help you:`
                    },
                    {
                        text: `Platinum: ${JSON.stringify(context.platinum)}.`
                    },
                    {
                        text: `Credits: ${JSON.stringify(context.credits)}.`
                    },
                    {
                        text: `Pending recipes: ${JSON.stringify(context.pending_recipes)}.`
                    },
                    {
                        text: `Player level: ${JSON.stringify(context.player_level)}.`
                    },
                    {
                        text: `Last region played: ${JSON.stringify(context.last_region_played)}.`
                    },
                    {
                        text: `Did the tutorial: ${JSON.stringify(context.played_tutorial)}.`
                    },
                    {
                        text: `Game settings: ${JSON.stringify(context.settings)}.`
                    },
                    {
                        text: `Story mode choice: ${JSON.stringify(context.story_mode_choice)}.`
                    },
                    {
                        text: `Active quest: ${currQuest}.`
                    },
                    {
                        text: `Has reset account: ${JSON.stringify(context.has_reset_account)}.`
                    },
                    {
                        text: `If my player level is equal or above 4 then I am not a beginner. If my account is reset than I am also not a beginner.`
                    },
                    {
                        text: `Do not give me the details of my account unless I ask you or need help with an inquiry.`
                    },
                    {
                        text: `Pretend to be the Lotus.`
                    }
                ],
            },
            {
                role: "model",
                parts: [{ text: `Hello ${username}, I am here to help and guide you.` }],
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