import { state } from '../state.js';
import { googleAI } from '../services/googleAI.js';

export const html = () => `
    <div class="view-container slide-up">
        <div class="card status-card">
            <div class="loading-spinner" id="analysis-loader">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <span>Analyzing Concept with Gemini...</span>
            </div>
            
            <div id="analysis-result" style="display: none;">
                <h3><i class="fa-solid fa-brain"></i> Analysis Complete</h3>
                <div class="result-box">
                    <h4>Concept Summary</h4>
                    <p id="concept-summary"></p>
                    
                    <h4>Visual Direction</h4>
                    <p id="visual-direction"></p>
                </div>

                <div class="action-row">
                    <button class="btn-secondary" id="btn-retry">Retry Analysis</button>
                    <button class="btn-primary" id="btn-next">
                        Proceed to Prompt Engineering <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
`;

export const init = async () => {
    const loader = document.getElementById('analysis-loader');
    const resultDiv = document.getElementById('analysis-result');
    const summaryEl = document.getElementById('concept-summary');
    const visualEl = document.getElementById('visual-direction');

    // Auto-start analysis if not done
    /* 
       Optimized Prompt: We ask Gemini to analyze the user params and output a JSON.
    */
    const systemPrompt = `You are a professional Creative Director for YouTube Shorts. 
    Analyze the user's request and provide a JSON response with:
    {
        "summary": "Specific refinement of the users theme",
        "visual_direction": "Detailed art direction description"
    }`;

    const userPrompt = `
    Theme: ${state.projectParam.theme}
    Message: ${state.projectParam.message}
    Style: ${state.projectParam.style}
    Length: ${state.projectParam.length}
    `;

    try {
        // Call API
        const textResponse = await googleAI.generateText(userPrompt, systemPrompt);

        // Parse JSON (naive cleanup)
        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);

        // Display
        summaryEl.textContent = data.summary;
        visualEl.textContent = data.visual_direction;

        loader.style.display = 'none';
        resultDiv.style.display = 'block';

        // Add Listeners
        document.getElementById('btn-retry').addEventListener('click', () => {
            // In real app, reset and reload. For now, just reload view.
            location.reload();
        });

        document.getElementById('btn-next').addEventListener('click', () => {
            const event = new Event('next-step');
            document.dispatchEvent(event);
        });

    } catch (e) {
        loader.innerHTML = `<span style="color:var(--secondary)">Error: ${e.message}</span><br><br><button onclick="location.reload()" class="btn-secondary">Try Again</button>`;
    }
};
