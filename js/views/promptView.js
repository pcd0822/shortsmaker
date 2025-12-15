import { state } from '../state.js';
import { googleAI } from '../services/googleAI.js';

export const html = () => `
    <div class="view-container slide-up">
        <div class="header-action">
            <h3><i class="fa-solid fa-pen-fancy"></i> Batch Prompt Engineering</h3>
            <button id="btn-gen-prompts" class="btn-primary">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Scenelist
            </button>
        </div>

        <div id="prompt-loading" style="display: none; padding: 2rem; text-align: center;">
            <i class="fa-solid fa-circle-notch fa-spin fa-2x"></i>
            <p>Constructing narrative and technical prompts...</p>
        </div>

        <div id="scene-list" class="scene-grid"></div>

        <div class="footer-action" id="footer-action" style="display: none;">
            <button id="btn-confirm-prompts" class="btn-primary full-width">
                Confirm & Proceed to Image Generation <i class="fa-solid fa-image"></i>
            </button>
        </div>
    </div>
`;

export const init = async () => {
    const btnGen = document.getElementById('btn-gen-prompts');
    const loader = document.getElementById('prompt-loading');
    const listEl = document.getElementById('scene-list');
    const footer = document.getElementById('footer-action');
    const btnConfirm = document.getElementById('btn-confirm-prompts');

    // CHECK STATE
    if (state.scenes && state.scenes.length > 0) {
        btnGen.style.display = 'none';
        renderScenes(state.scenes, listEl);
        footer.style.display = 'block';
    }

    btnGen.addEventListener('click', async () => {
        btnGen.style.display = 'none';
        loader.style.display = 'block';
        listEl.innerHTML = '';

        const systemPrompt = `
        You are an expert Shorts Director.
        Based on the user's theme, generate exactly 5 distinct Scenes for a YouTube Short (${state.projectParam.length}).

        MANDATORY CHARACTER (Do not change this):
        "A cute baby otter in 3D Pixar animation style, high quality, expressive eyes, soft fur, standing on two feet, simple clean background, studio lighting".
        
        STYLE:
        "High Quality 3D Animation".
        
        CRITICAL INSTRUCTION FOR VEO & LIP-SYNC:
        If a scene involves a character speaking, the 'video_prompt' MUST include keywords like: "close up, character speaking, natural lip movement, talking face".
        
        LANGUAGE REQUIREMENT:
        - "description" and "dialogue" MUST be in KOREAN.
        - "image_prompt" and "video_prompt" MUST be in ENGLISH (for better compatibility with generation models).

        Return a JSON Object with a "scenes" array. Each item:
        {
            "id": 1,
            "description": "Short plot summary of the scene (Korean)",
            "image_prompt": "Highly detailed visual description for Imagen 3 (English)",
            "video_prompt": "Motion description for Veo (English)",
            "dialogue": "Character dialogue (Korean)",
            "is_speaking": true/false
        }
        `;

        const userPrompt = `
        Theme: ${state.projectParam.theme}
        Style: ${state.projectParam.style}
        Message: ${state.projectParam.message}
        `;

        try {
            const result = await googleAI.generateText(userPrompt, systemPrompt);
            const json = JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim());

            state.setScenes(json.scenes);
            renderScenes(json.scenes, listEl);

            loader.style.display = 'none';
            footer.style.display = 'block';

        } catch (e) {
            console.error(e);
            loader.innerHTML = `<p class="error">Generation Failed. Check Console.</p>`;
            btnGen.style.display = 'block';
        }
    });

    btnConfirm.addEventListener('click', () => {
        // SCRAPE EDITED VALUES
        const updatedScenes = [];
        const cards = document.querySelectorAll('.scene-card');

        cards.forEach(card => {
            const id = parseInt(card.dataset.id);
            const description = card.querySelector('.edit-description').value;
            const imagePrompt = card.querySelector('.edit-image-prompt').value;
            const videoPrompt = card.querySelector('.edit-video-prompt').value;
            const dialogue = card.querySelector('.edit-dialogue')?.value || ""; // Optional
            const isSpeaking = !!card.querySelector('.edit-dialogue'); // Check existence

            updatedScenes.push({
                id,
                description,
                image_prompt: imagePrompt,
                video_prompt: videoPrompt,
                dialogue,
                is_speaking: isSpeaking
            });
        });

        // UPDATE STATE
        state.setScenes(updatedScenes);

        const event = new Event('next-step');
        document.dispatchEvent(event);
    });
};

function renderScenes(scenes, container) {
    container.innerHTML = scenes.map(scene => `
        <div class="scene-card" data-id="${scene.id}">
            <div class="scene-header">
                <span class="scene-id">#${scene.id}</span>
                <span class="scene-type">${scene.is_speaking ? '<i class="fa-solid fa-comment"></i> Dialogue' : '<i class="fa-solid fa-film"></i> Action'}</span>
            </div>
            <div class="scene-body">
                <div class="input-group">
                    <label>Plot (Korean)</label>
                    <textarea class="edit-description" rows="2">${scene.description}</textarea>
                </div>
                
                ${scene.is_speaking ? `
                <div class="input-group">
                    <label>Dialogue (Korean)</label>
                    <textarea class="edit-dialogue" rows="2" style="border-color: var(--accent);">${scene.dialogue}</textarea>
                </div>` : ''}

                <div class="input-group">
                    <label>Image Prompt (English)</label>
                    <textarea class="edit-image-prompt" rows="3">${scene.image_prompt}</textarea>
                </div>

                <div class="input-group">
                    <label>Veo Prompt (English)</label>
                    <textarea class="edit-video-prompt" rows="3" style="color:var(--text-secondary);">${scene.video_prompt}</textarea>
                </div>
            </div>
        </div>
    `).join('');
}
