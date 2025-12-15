export const state = {
    apiKey: localStorage.getItem('openai_api_key') || null,
    currentStep: 0,
    projectParam: {
        theme: '',
        message: '',
        length: '',
        resolution: '1080x1920',
        style: ''
    },
    // Main Data Store
    scenes: [], // Array of objects: { id, description, imagePrompt, videoPrompt, audioScript, imageUrl, videoStatus }

    // Actions
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('openai_api_key', key);
    },

    updateProjectParams(params) {
        this.projectParam = { ...this.projectParam, ...params };
    },

    setScenes(scenes) {
        this.scenes = scenes;
    },

    updateScene(index, data) {
        if (this.scenes[index]) {
            this.scenes[index] = { ...this.scenes[index], ...data };
        }
    }
};
