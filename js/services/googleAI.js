const NETLIFY_FUNCTION_URL = '/.netlify/functions/openai';

async function callOpenAI(payload) {
    try {
        const response = await fetch(NETLIFY_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || response.statusText);
        }

        const data = await response.json();
        return data.result;
    } catch (e) {
        console.error("AI Service Error:", e);
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
