require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/explain", async (req, res) => {
    const { p1, p2 } = req.body;

    try {
        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a competitive Pokémon expert specializing in doubles formats like VGC and Smogon Doubles."
                },
                {
                    role: "user",
                    content: `Explain why ${p1} is a good teammate with ${p2}. 
Give 3-5 concise bullet points focused on competitive synergy, moves, abilities, and roles.`
                }
            ],
        });

        res.json({
            text: completion.choices[0].message.content
        });

    } catch (err) {
        console.error(err);
        res.json({ text: "Failed to generate explanation" });
    }
});

app.listen(3001, () => {
    console.log("AI server running on http://localhost:3001");
});