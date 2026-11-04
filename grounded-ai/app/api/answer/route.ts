import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const MODELS = [
    "gemini-3.5-flash",
    "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
];
const MAX_RETRIES = 2;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isTransient(error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return /503|429|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded/i.test(msg);
}

async function generateWithRetry(ai: GoogleGenAI, prompt: string) {
    let lastError: unknown;

    for (const model of MODELS) {
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                return await ai.models.generateContent({ model, contents: prompt });
            } catch (error) {
                lastError = error;
                console.warn(`${model} failed (attempt ${attempt + 1})`);
                if (!isTransient(error)) break; // move to next model
                await sleep(1000 * (attempt + 1) + Math.random() * 300);
            }
        }
    }
    throw lastError;
}

export async function POST(request: Request) {
    try {
        const { question, documentText } = await request.json();

        if (!question?.trim() || !documentText?.trim()) {
            return NextResponse.json(
                { error: "Question and document text are required." },
                { status: 400 }
            );
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const prompt = `
Answer the question using only the document below.
If the answer is not in the document, say you cannot find it.

Document: ${documentText}
Question: ${question}
`;

        const response = await generateWithRetry(ai, prompt);

        return NextResponse.json({
            answer: response.text || "No answer generated.",
        });
    } catch (error) {
        console.error("Gemini API error:", error);

        if (isTransient(error)) {
            return NextResponse.json(
                { error: "The AI service is temporarily busy. Please try again shortly." },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: "Failed to generate an answer." },
            { status: 500 }
        );
    }
}