import { state } from '../state.js';

export const html = () => `
    <div class="view-container slide-up">
        <div class="header-action">
            <h3><i class="fa-solid fa-microphone-lines"></i> Audio Script Generation</h3>
            <p>Finalize the script for your voice actors or AI TTS.</p>
        </div>

        <div class="script-container">
            <div id="script-content">
                <!-- Script items -->
            </div>
        </div>

        <div class="footer-action">
             <button id="btn-copy-script" class="btn-secondary">
                <i class="fa-regular fa-copy"></i> Copy Full Script
            </button>
            <button id="btn-finish" class="btn-primary">
                View Final Sequence <i class="fa-solid fa-flag-checkered"></i>
            </button>
        </div>
    </div>
`;

export const init = () => {
    const container = document.getElementById('script-content');
    const btnCopy = document.getElementById('btn-copy-script');
    const btnFinish = document.getElementById('btn-finish');

    // Filter scenes with dialogue or just list all for timing
    const talkingScenes = state.scenes.filter(s => s.dialogue && s.dialogue !== "None");

    if (talkingScenes.length === 0) {
        container.innerHTML = `<div class="empty-state">No dialogue detected in this project.</div>`;
    } else {
        container.innerHTML = talkingScenes.map(s => `
            <div class="script-item">
                <div class="script-meta">
                    <span class="badge">Scene ${s.id}</span>
                </div>
                <div class="script-text">
                    "${s.dialogue}"
                </div>
                <div class="script-emotion">
                    <small>Suggested Emotion: ${s.is_speaking ? 'Expressive' : 'Neutral'}</small>
                </div>
            </div>
        `).join('');
    }

    btnCopy.addEventListener('click', () => {
        let text = `PROJECT: ${state.projectParam.theme}\n\n`;
        state.scenes.forEach(s => {
            if (s.dialogue) {
                text += `[Scene ${s.id}] \n${s.dialogue}\n\n`;
            }
        });
        navigator.clipboard.writeText(text);
        btnCopy.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
        setTimeout(() => btnCopy.innerHTML = '<i class="fa-regular fa-copy"></i> Copy Full Script', 2000);
    });

    btnFinish.addEventListener('click', () => {
        const event = new Event('next-step');
        document.dispatchEvent(event);
    });
};
