import { state } from './state.js';

// DOM Elements
const app = document.getElementById('app');
const stepperItems = document.querySelectorAll('.step-item');
const contentArea = document.getElementById('content-area');
const pageTitle = document.getElementById('page-title');
const modal = document.getElementById('api-modal');
const apiKeyInput = document.getElementById('api-key-input');
const btnSaveKey = document.getElementById('btn-save-key');
const apiStatus = document.querySelector('.api-status');

// View Mapping
const views = {
    0: 'setup',
    1: 'analysis',
    2: 'prompt',
    3: 'image',
    4: 'veo',
    5: 'audio',
    6: 'export'
};

// Initialize
async function init() {
    console.log('App Initializing...');

    // Check API Key
    if (!state.apiKey) {
        modal.classList.add('active');
    } else {
        updateApiStatus(true);
    }

    // Load Initial View
    loadView(0);

    // Event Listeners
    setupEventListeners();
}

function setupEventListeners() {
    // API Modal
    btnSaveKey.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            state.setApiKey(key);
            modal.classList.remove('active');
            updateApiStatus(true);
        }
    });

    // Stepper Navigation (Only allow going back or to next available step - implementation simplified for now)
    stepperItems.forEach(item => {
        item.addEventListener('click', () => {
            const step = parseInt(item.dataset.step);
            // In a real app, we'd check if previous steps are done. 
            // For dev speed, we allow clicking.
            loadView(step);
        });
    });

    // Listen for custom 'next-step' events from views
    document.addEventListener('next-step', (e) => {
        const nextStep = state.currentStep + 1;
        if (nextStep <= 6) loadView(nextStep);
    });
}

function updateApiStatus(connected) {
    if (connected) {
        apiStatus.innerHTML = '<i class="fa-solid fa-link"></i> System Online';
        apiStatus.className = 'api-status connected';
    } else {
        apiStatus.innerHTML = '<i class="fa-solid fa-link-slash"></i> Offline';
        apiStatus.className = 'api-status disconnected';
    }
}

async function loadView(stepIndex) {
    // Update Stepper UI
    stepperItems.forEach(el => el.classList.remove('active'));
    const activeItem = document.querySelector(`.step-item[data-step="${stepIndex}"]`);
    if (activeItem) activeItem.classList.add('active');

    state.currentStep = stepIndex;
    const viewName = views[stepIndex];

    // Update Title
    pageTitle.textContent = activeItem ? activeItem.querySelector('.step-label').textContent : 'Dashboard';

    // Dynamic Import
    try {
        contentArea.innerHTML = '<div class="loading">Loading Interface...</div>';

        // Import the view module. MUST exist in js/views/
        const module = await import(`./views/${viewName}View.js`);

        // Ensure cleanup of previous view if needed (not implemented here)

        // Render
        contentArea.innerHTML = module.html();

        // Init Logic
        if (module.init) {
            module.init();
        }
    } catch (error) {
        console.error(`Failed to load view: ${viewName}`, error);
        contentArea.innerHTML = `<div class="error">Error loading view: ${viewName}<br>${error.message}</div>`;
    }
}

// Start
init();
