import { state } from '../state.js';
import { googleAI } from '../services/googleAI.js';

export const html = () => `
    <div class="view-container slide-up">
        <div class="header-action">
            <h3><i class="fa-solid fa-images"></i> Batch Image Generation</h3>
            <p>Generating assets for ${state.scenes.length} scenes using Imagen 3...</p>
        </div>

        <div class="progress-bar-container">
            <div id="gen-progress" class="progress-bar" style="width: 0%"></div>
        </div>

        <div id="image-grid" class="image-grid">
            <!-- Images will populate here -->
        </div>

        <div class="footer-action" id="img-footer" style="display: none;">
            <button id="btn-next-veo" class="btn-primary full-width">
                Proceed to Veo Dashboard <i class="fa-solid fa-video"></i>
            </button>
        </div>
    </div>
`;

export const init = async () => {
    const grid = document.getElementById('image-grid');
    const progress = document.getElementById('gen-progress');
    const footer = document.getElementById('img-footer');
    const btnNext = document.getElementById('btn-next-veo');

    if (!state.scenes || state.scenes.length === 0) {
        grid.innerHTML = '<p>No scenes found. Go back to step 2.</p>';
        return;
    }

    // Initialize Grid with Placeholders
    grid.innerHTML = state.scenes.map(scene => `
        <div class="img-card" id="img-card-${scene.id}">
            <div class="img-placeholder">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Generating Scene ${scene.id}...</span>
            </div>
            <div class="img-info">
                <span>Scene ${scene.id}</span>
            </div>
        </div>
    `).join('');

    // Batch Generation (Sequential to avoid rate limits if any, or Promise.all if bold)
    // We'll do sequential for better UX feedback on progress.
    let completed = 0;

    for (const scene of state.scenes) {
        const card = document.getElementById(`img-card-${scene.id}`);
        try {
            // Call API
            const imageUrl = await googleAI.generateImage(scene.image_prompt);

            // Update State
            state.updateScene(scene.id - 1, { imageUrl });

            // Update UI
            card.innerHTML = `
                <img src="${imageUrl}" alt="Scene ${scene.id}">
                <div class="img-overlay">
                    <span class="badge">Scene ${scene.id}</span>
                </div>
            `;
        } catch (e) {
            console.error(e);
            card.innerHTML = `<div class="error-placeholder">Failed</div>`;
        }

        completed++;
        progress.style.width = `${(completed / state.scenes.length) * 100}%`;
    }

    footer.style.display = 'block';

    btnNext.addEventListener('click', () => {
        const event = new Event('next-step');
        document.dispatchEvent(event);
    });
};
