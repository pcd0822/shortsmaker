import { state } from '../state.js';

export const html = () => `
    <div class="view-container slide-up">
        <div class="header-action">
            <h3><i class="fa-solid fa-film"></i> Veo Asset Dashboard</h3>
            <p>Use these assets to generate videos in Veo. One video per scene.</p>
            <button id="btn-download-all" class="btn-secondary">
                <i class="fa-solid fa-file-zipper"></i> Download All Assets (Images + Prompts)
            </button>
        </div>

        <div class="veo-table-container">
            <table class="veo-table">
                <thead>
                    <tr>
                        <th width="80">Scene</th>
                        <th width="120">Image</th>
                        <th>Veo Prompt (Motion + Lip Sync)</th>
                        <th width="80">Action</th>
                        <th width="60">Status</th>
                    </tr>
                </thead>
                <tbody id="veo-list-body">
                    <!-- Populated by JS -->
                </tbody>
            </table>
        </div>

        <div class="footer-action">
            <button id="btn-next-audio" class="btn-primary full-width">
                Confirm All Videos Created & Proceed to Audio <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>
    </div>
`;

export const init = () => {
    const tbody = document.getElementById('veo-list-body');
    const btnDownload = document.getElementById('btn-download-all');
    const btnNext = document.getElementById('btn-next-audio');

    // Render List
    tbody.innerHTML = state.scenes.map(scene => `
        <tr class="veo-row" data-id="${scene.id}">
            <td><span class="badge">#${scene.id}</span></td>
            <td>
                <div class="thumb-wrapper">
                    <img src="${scene.imageUrl || 'https://placehold.co/100x177'}" alt="Thumb">
                </div>
            </td>
            <td>
                <div class="prompt-text">${scene.video_prompt}</div>
            </td>
            <td>
                <button class="icon-btn copy-btn" data-text="${scene.video_prompt}" title="Copy Prompt">
                    <i class="fa-regular fa-copy"></i>
                </button>
            </td>
            <td>
                <input type="checkbox" class="done-check" title="Mark as Done">
            </td>
        </tr>
    `).join('');

    // Copy Functionality
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(btn.dataset.text);
            btn.innerHTML = '<i class="fa-solid fa-check"></i>';
            setTimeout(() => btn.innerHTML = '<i class="fa-regular fa-copy"></i>', 1000);
        });
    });

    // Row Highlight on Check
    document.querySelectorAll('.done-check').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const row = e.target.closest('tr');
            if (e.target.checked) row.classList.add('completed');
            else row.classList.remove('completed');
        });
    });

    // Download All (JSZip)
    btnDownload.addEventListener('click', async () => {
        const btnText = btnDownload.innerHTML;
        btnDownload.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Zipping...';

        try {
            const zip = new JSZip();
            const folder = zip.folder("AI_Shorts_Assets");

            // Add Text File with all prompts
            let allPrompts = "";
            state.scenes.forEach(s => {
                allPrompts += `SCENE ${s.id}\n`;
                allPrompts += `VIDEO PROMPT: ${s.video_prompt}\n`;
                allPrompts += `DIALOGUE: ${s.dialogue}\n`;
                allPrompts += `--------------------------------\n\n`;
            });
            folder.file("All_Prompts.txt", allPrompts);

            // Add Images
            // Fetch blob from URL (if remote) or Data URI
            const imagePromises = state.scenes.map(async (s) => {
                if (s.imageUrl) {
                    const response = await fetch(s.imageUrl);
                    const blob = await response.blob();
                    folder.file(`Scene_${s.id}_Image.jpg`, blob);
                    folder.file(`Scene_${s.id}_Prompt.txt`, s.video_prompt);
                }
            });

            await Promise.all(imagePromises);

            // Generate Zip
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, "Veo_Assets_Package.zip");

            btnDownload.innerHTML = '<i class="fa-solid fa-check"></i> Downloaded!';
        } catch (e) {
            console.error(e);
            alert("Error creating zip: " + e.message);
            btnDownload.innerHTML = btnText;
        }
    });

    // Next
    btnNext.addEventListener('click', () => {
        const event = new Event('next-step');
        document.dispatchEvent(event);
    });
};
