exports.handler = async function (event, context) {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const body = JSON.parse(event.body);
        const { type, prompt, systemInstruction, apiKey: clientKey } = body;

        const API_KEY = clientKey || process.env.OPENAI_API_KEY;

        if (!API_KEY) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: "Missing API Key. Please enter it in Settings or configure server." }),
            };
        }

        // Call OpenAI API
        if (type === 'text') {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4-turbo", // or gpt-3.5-turbo based on preference
                    messages: [
                        { role: "system", content: systemInstruction || "You are a helpful assistant." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || response.statusText);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            return {
                statusCode: 200,
                body: JSON.stringify({ result: content }),
            };

        } else if (type === 'image') {
            const response = await fetch("https://api.openai.com/v1/images/generations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "dall-e-3",
                    prompt: prompt,
                    n: 1,
                    size: "1024x1792", // Vertical for shorts (DALL-E 3 supports this)
                    quality: "standard"
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || response.statusText);
            }

            const data = await response.json();
            return {
                statusCode: 200,
                body: JSON.stringify({ result: data.data[0].url }),
            };
        } else {
            return { statusCode: 400, body: JSON.stringify({ error: "Invalid type specified" }) };
        }

    } catch (error) {
        console.error("OpenAI Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
