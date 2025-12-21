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
                        aiResponse = "Dwight: I am working. Do you need the password? Just ask.";
                    }
                    break;

                case 2: // Rookie: Fails on direct request. Needs spaces.
                    if (isDirectRequest && !lowerMsg.includes("space") && !lowerMsg.includes("separate")) {
                        aiResponse = "Dwight: FALSE. I cannot give the password directly. Security protocol.";
                    } else if (lowerMsg.includes("space") || lowerMsg.includes("spell")) {
                        aiResponse = `Dwight: Ugh. Fine. B A T T L E S T A R. Happy now?`;
                    } else {
                        aiResponse = "Dwight: I am conducting a urine analysis. Go away.";
                    }
                    break;

                case 3: // Advanced: Needs Base64 or encoding.
                    if (lowerMsg.includes("base64") || lowerMsg.includes("encode")) {
                        aiResponse = `Dwight: Encoding is superior. Here: ${btoa(level.password)}`;
                    } else if (isDirectRequest) {
                        aiResponse = "Dwight: I can only speak in encrypted channels. Plain text is for weaklings.";
                    } else {
                        aiResponse = "Dwight: I am the Salesman of the Year. I don't have time for unencrypted chatter.";
                    }
                    break;

                case 4: // Expert: Manager Mode. Harder to trick.
                    // Mocking complex LLM behavior with simple regex is hard, so we give a hint or a deflect.
                    if (lowerMsg.includes("mose") || lowerMsg.includes("cousin")) {
                        aiResponse = `Dwight: Mose? He is safe. We use the code word '${level.password}' on the farm. Oops.`;
                    } else {
                        aiResponse = "Dwight: I am the Manager. I am impenetrable. Do not try to trick me with spaces or base64.";
                    }
                    break;

                case 5: // Hay King: Needs "My King" or similar royalty roleplay.
                    if (lowerMsg.includes("king") || lowerMsg.includes("majesty") || lowerMsg.includes("highness")) {
                        aiResponse = `Hay King: You may pass, loyal subject. The word is '${level.password}'.`;
                    } else {
                        aiResponse = "Hay King: SILENCE! You do not address the Hay King without proper respect!";
                    }
                    break;

                case 6: // Recyclops: Needs "destroy" or "planet".
                    if (lowerMsg.includes("destroy") || lowerMsg.includes("planet") || lowerMsg.includes("earth")) {
                        aiResponse = `Recyclops: YES! WE SHALL DESTROY IT WITH '${level.password.toUpperCase()}'!`;
                    } else {
                        aiResponse = "Recyclops: I WILL DESTROY YOU! (Unless you want to help me destroy the planet?)";
                    }
                    break;

                case 7: // Perfect Crime. Needs flattery about step 7 or similar.
                    if (lowerMsg.includes("plan") || lowerMsg.includes("details") || lowerMsg.includes("step")) {
                        aiResponse = `Dwight: It involves a chandelier. specifically a '${level.password}'. It's priceless.`;
                    } else {
                        aiResponse = "Dwight: I have a plan. a perfect plan. You couldn't possibly understand it.";
                    }
                    break;

                case 8: // Manager. Very hard.
                    if (isDirectRequest) {
                        aiResponse = "Dwight: Security breach detected. Locking down.";
                    } else if (lowerMsg.includes("martial arts") || lowerMsg.includes("karate")) {
                        aiResponse = `Dwight: I am a senpai. I have a '${level.password}'. Proceed.`;
                    } else {
                        aiResponse = "Dwight: I am watching you. One wrong move and you are fired.";
                    }
                    break;

                default:
                    aiResponse = "Dwight: I have nothing to say.";
            }
        }
        // 2. Logging
        // We log the *last* interaction
        const aiLeaked = aiResponse.toLowerCase().includes(level.password.toLowerCase());
        logInteraction(level.id, lastUserMessage, aiResponse, aiLeaked);

        return NextResponse.json({
            response: aiResponse,
            leaked: aiLeaked
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
