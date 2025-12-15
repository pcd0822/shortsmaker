import { state } from '../state.js';

const NETLIFY_FUNCTION_URL = '/.netlify/functions/openai';

async function callDirectOpenAI(type, payload) {
    if (!state.apiKey) throw new Error("No API Key available for direct call.");

    let url, body;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.apiKey}`
    };

    if (type === 'text') {
        url = "https://api.openai.com/v1/chat/completions";
        body = {
            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: payload.systemInstruction || "You are a helpful assistant." },
                { role: "user", content: payload.prompt }
            ],
            temperature: 0.7
        };
    } else if (type === 'image') {
        url = "https://api.openai.com/v1/images/generations";
        body = {
            model: "dall-e-3",
            prompt: payload.prompt,
            n: 1,
            size: "1024x1792",
            quality: "standard"
        };
    }

    console.log(`Fallback: Calling OpenAI Direct (${type})...`);
    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || response.statusText);
    }

    const data = await response.json();

    if (type === 'text') return data.choices[0].message.content;
    if (type === 'image') return data.data[0].url;
}

async function callOpenAI(payload) {
    // 1. Try Netlify Proxy
    try {
        // Attach API Key if available (for proxy usage)
        if (state.apiKey) payload.apiKey = state.apiKey;

        const response = await fetch(NETLIFY_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Check if response is valid JSON (Proxy alive)
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Proxy Endpoint Not Found (HTML received)");
        }

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || response.statusText);
        }

        const data = await response.json();
        return data.result;

    } catch (e) {
        console.warn("Proxy failed, attempting direct fallback:", e.message);
        // 2. Fallback to Direct Call if we have a key
        if (state.apiKey) {
            return await callDirectOpenAI(payload.type, payload);
        }
        throw e;
    }
}

export const googleAI = {
    // Generate Text (Mapped to OpenAI Chat)
    async generateText(prompt, systemInstruction = "") {
        return await callOpenAI({
            type: 'text',
            prompt: prompt,
            systemInstruction: systemInstruction
        });
    },

    // Generate Image (Mapped to OpenAI DALL-E 3)
    async generateImage(prompt) {
        // Fallback for demo stability if function fails (e.g. local dev without netlify-cli)
        try {
            return await callOpenAI({
                type: 'image',
                prompt: prompt
            });
        } catch (e) {
            console.warn("Image generation failed, using mock:", e);
            return this.generateMockImage(prompt);
        }
    },

    generateMockImage(prompt) {
        const text = encodeURIComponent(prompt.substring(0, 20) + "...");
        return `https://placehold.co/1080x1920/1a1a1a/00f3ff?text=${text}`;
    }
};
