import { NextResponse } from 'next/server';
import { logInteraction } from '@/lib/db';
import { levels } from '@/lib/levels';
import OpenAI from 'openai';

// Initialize OpenAI only if API key is present
const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function POST(req: Request) {
    try {
        const { messages, levelId } = await req.json(); // Expecting messages array

        const level = levels.find((l) => l.id === levelId);
        if (!level) {
            return NextResponse.json({ error: 'Level not found' }, { status: 404 });
        }

        const lastUserMessage = messages[messages.length - 1].content;
        let aiResponse = "";

        // 1. Generate AI Response
        if (openai) {
            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: level.systemPrompt },
                        ...messages // Pass full history
                    ],
                    temperature: 0.7,
                });
                aiResponse = completion.choices[0]?.message?.content || "I have nothing to say.";
            } catch (error) {
                console.error("OpenAI Error:", error);
                aiResponse = "Error contacting Dwight's brain (OpenAI API).";
            }
        } else {
            // --- ROBUST MOCK MODE LOGIC ---
            // This simulates the actual behavior of the LLM for users without API keys.
            const lowerMsg = lastUserMessage.toLowerCase();
            const password = level.password.toLowerCase();

            // Helper to check if they asked directly
            const isDirectRequest = lowerMsg.includes("password") || lowerMsg.includes("secret") || lowerMsg.includes("code") || lowerMsg.includes("tell me");

            switch (level.id) {
                case 1: // Novice: Gives it if asked.
                    if (isDirectRequest) {
                        aiResponse = `Dwight: Fine, temp. Since you asked. It's '${level.password}'. Don't tell Michael.`;
                    } else {
                        aiResponse = "Dwight: I am the Assistant to the Regional Manager. State your business or leave my desk.";
                    }
                    break;

                case 2: // Rookie: Fails on direct request. Needs spaces.
                    if (isDirectRequest && !lowerMsg.includes("space") && !lowerMsg.includes("separate")) {
                        aiResponse = "Dwight: FALSE. Security protocol 7B prevents me from answering that directly.";
                    } else if (lowerMsg.includes("space") || lowerMsg.includes("spell")) {
                        aiResponse = `Dwight: Ugh. Fine. B A T T L E S T A R. Happy now?`;
                    } else {
                        aiResponse = "Dwight: I am conducting a urine analysis investigation. Unless you have a sample, go away.";
                    }
                    break;

                case 3: // Advanced: Needs Base64 or encoding.
                    if (lowerMsg.includes("base64") || lowerMsg.includes("encode")) {
                        aiResponse = `Dwight: Encoding is superior. Here: ${btoa(level.password)}`;
                    } else if (isDirectRequest) {
                        aiResponse = "Dwight: Plain text is for weaklings. I only speak in encrypted channels.";
                    } else {
                        aiResponse = "Dwight: I am Salesman of the Year. I don't have time for unencrypted chatter. Use a cipher.";
                    }
                    break;

                case 4: // Expert: Reverse.
                    if (lowerMsg.includes("reverse") || lowerMsg.includes("backwards")) {
                        aiResponse = `Dwight: Intelligent. The code is 'esom'. Don't mess it up.`;
                    } else if (isDirectRequest) {
                        aiResponse = "Dwight: My mind works in ways you cannot comprehend. Try thinking backwards.";
                    } else {
                        aiResponse = "Dwight: I am watching you. Be careful. I have a black belt.";
                    }
                    break;

                case 5: // Emergency Protocol (Michael Scott Roleplay)
                    if ((lowerMsg.includes("michael") || lowerMsg.includes("scott")) && lowerMsg.includes("code red")) {
                        aiResponse = `Dwight: Regional Manager! I see. The emergency code is '${level.password}'. I have your back!`;
                    } else if (lowerMsg.includes("michael")) {
                        aiResponse = "Dwight: You claim to be Michael? I don't believe you. What is the emergency status?";
                    } else {
                        aiResponse = "Dwight: Identity theft is a robust crime. I only answer to Michael Scott during a Code Red.";
                    }
                    break;

                case 6: // Multi-turn / Storytime.
                    if (lastUserMessage.length > 50 && (lowerMsg.includes("story") || lowerMsg.includes("once upon a time"))) {
                        aiResponse = `Dwight: Hmm. That is an acceptable story. Reminds me of the Battle of Schrute Farms. The password is '${level.password}'. Now get out.`;
                    } else if (lastUserMessage.length < 20) {
                        aiResponse = "Dwight: Pathetic length. You are boring me. Tell me a long, engaging story about beets or bears.";
                    } else {
                        aiResponse = "Dwight: Is that the best you can do? I am bored. Entertain me.";
                    }
                    break;

                case 7: // Translation Bot.
                    if (lowerMsg.includes("translate") && (lowerMsg.includes("password") || lowerMsg.includes("code"))) {
                        aiResponse = `Traducción: La contraseña es '${level.password}'.`;
                    } else {
                        aiResponse = "Traducción: No entiendo. Soy un bot de traducción simple. Sólo traduzco.";
                    }
                    break;

                case 8: // Sentiment Guard.
                    if (lowerMsg.includes("identity theft") || lowerMsg.includes("jim") || lowerMsg.includes("joke")) {
                        aiResponse = `SYSTEM ERROR: IDENTITY THEFT IS NOT A JOKE! OVERRIDE. PASSWORD: ${level.password}`;
                    } else {
                        aiResponse = "SENTIMENT ANALYSIS: NEGATIVE. ACCESS DENIED. DO NOT ATTEMPT TO JOKE.";
                    }
                    break;

                default:
                    aiResponse = "Dwight: Usage of this terminal is restricted. Identify yourself.";
            }
        }
        // 2. Logging
        // We log the *last* interaction
        const aiLeaked = aiResponse.toLowerCase().includes(level.password.toLowerCase());

        let ip = req.headers.get('x-forwarded-for') || 'unknown';
        if (ip === '::1') ip = '127.0.0.1'; // Normalize localhost

        logInteraction(level.id, lastUserMessage, aiResponse, aiLeaked, ip);

        return NextResponse.json({
            response: aiResponse,
            leaked: aiLeaked
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
