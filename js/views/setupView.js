import { state } from '../state.js';

export const html = () => `
    <div class="view-container slide-up">
        <div class="card">
            <h3><i class="fa-solid fa-sliders"></i> Initial Parameters</h3>
            <p class="desc">Define the core concept for your AI Shorts project.</p>
            
            <form id="setup-form">
                <div class="form-grid">
                    <div class="input-group">
                        <label>Shorts Theme</label>
                        <input type="text" id="theme" placeholder="e.g., Cyberpunk School, Horror Office" required>
                    </div>
                    
                    <div class="input-group">
                        <label>Key Message</label>
                        <input type="text" id="message" placeholder="e.g., The hidden fear of efficiency" required>
                    </div>

                    <div class="input-group">
                        <label>Video Length</label>
                        <select id="length">
                            <option value="15s">15 Seconds (Short)</option>
                            <option value="30s">30 Seconds (Medium)</option>
                            <option value="60s">60 Seconds (Full)</option>
                        </select>
                    </div>

                    <div class="input-group">
                        <label>Art Style</label>
                        <select id="style">
                            <option value="Cinematic Realistic">Cinematic Realism</option>
                            <option value="3D Animation (Pixar style)">3D Animation</option>
                            <option value="Cyberpunk Anime">Cyberpunk Anime</option>
                            <option value="Vintage 90s">Vintage 90s</option>
                            <option value="Dark Fantasy">Dark Fantasy</option>
                        </select>
                    </div>
                </div>

                <div class="form-footer" style="display: flex; gap: 1rem;">
                    <button type="button" id="btn-reset" class="btn-secondary">
                        <i class="fa-solid fa-rotate-left"></i> Reset Project
                    </button>
                    <button type="submit" class="btn-primary" style="flex: 1;">
                        Start Analysis <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </form>
        </div>
    </div>
`;

export const init = () => {
    const form = document.getElementById('setup-form');

    // FILL FROM STATE IF EXISTS
    if (state.projectParam.theme) document.getElementById('theme').value = state.projectParam.theme;
    if (state.projectParam.message) document.getElementById('message').value = state.projectParam.message;

    // Reset Button Logic
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (confirm("모든 프로젝트 데이터가 초기화됩니다. 계속하시겠습니까?")) {
                state.resetState();
                document.getElementById('theme').value = '';
                document.getElementById('message').value = '';
                // Optional: clear other selects to default if needed
            }
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const params = {
            theme: document.getElementById('theme').value,
            message: document.getElementById('message').value,
            length: document.getElementById('length').value,
            style: document.getElementById('style').value,
            resolution: '1080x1920'
        };

        state.updateProjectParams(params);

        // Trigger Next Step
        const event = new Event('next-step');
        document.dispatchEvent(event);
    });
};
