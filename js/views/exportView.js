import { state } from '../state.js';

export const html = () => `
    <div class="view-container slide-up">
        <div class="card export-card">
            <h3><i class="fa-solid fa-check-circle" style="color:var(--primary)"></i> Workflow Complete!</h3>
            <p>You have generated all assets. Here is your assembly guide.</p>
            
            <div class="export-list" id="edl-list">
                <!-- List -->
            </div>

            <div class="action-row" style="margin-top: 2rem;">
                <button class="btn-primary full-width" onclick="location.reload()">
                    <i class="fa-solid fa-redo"></i> Start New Project
                </button>
            </div>
        </div>
    </div>
`;

export const init = () => {
    const list = document.getElementById('edl-list');

    list.innerHTML = state.scenes.map(s => `
        <div class="export-item">
            <div class="time-col">Scene ${s.id}</div>
            <div class="track-col">
                <div class="track-video"><i class="fa-solid fa-video"></i> Veo_Scene_${s.id}.mp4</div>
                ${s.dialogue ? `<div class="track-audio"><i class="fa-solid fa-volume-high"></i> Audio_Scene_${s.id}.mp3</div>` : ''}
            </div>
        </div>
    `).join('');
};
