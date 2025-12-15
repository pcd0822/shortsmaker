export const state = {
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
