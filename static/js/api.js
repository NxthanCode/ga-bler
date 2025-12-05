const APIManager = {
    baseURL: '/api',

    checkStatus: async function() {
        try {
            const response = await fetch(`${this.baseURL}/status`);
            if (response.ok) {
                return await response.json();
            }
            throw new Error('api not responding');
        } catch (error) {
            console.error('api check failed: ', error)
            return null; 
        }
    },

    getPlayers: async function() {
        try {
            const response = await fetch(`${this.baseURL}/players`);
            if (response.ok) {
                return await response.json();
            }
            throw new Error('failed to fetch players');
        } catch (error) {
            console.error('get players failed: ', error)
            return { players: [] };
        }
    },

    getData: async function() {
        try {
            const response = await fetch(`${this.baseURL}/data`);
            if (response.ok) {
                return await response.json();
            } 
            throw new Error('failed to fetch data');
        } catch (error) {
            console.error('get data failed: ', error)
            return {};
        }
    },

    setReward: async function(userID, reward) {
        try {
            const response = await fetch(`${this.baseURL}/setReward?userID=${userID}&reward=${reward}`);
            const data = await response.json();
            
            if (response.ok) {
                return { success: true, data };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Set reward failed:', error);
            return { success: false, error: 'Network error' };
        }
    },

    getReward: async function(userID) {
        try {
            const response = await fetch(`${this.baseURL}/getReward?userID=${userID}`);
            const data = await response.json();

            if (response.ok) {
                return { success: true, data};
            } else {
                return {success:false,error:data.error};
            }
        } catch (error) {
            console.error('get reward failed: ', error);
            return { success: false, error: 'network error'};
        }
    },

    checkReward: async function(userID) {
        try {
            const response = await fetch(`${this.baseURL}/checkreward?userID=${userID}`)
            const data = await response.json();

            if (response.ok) {
                return { success: true, data};
            } else {
                return { success: false, error: data.error};
            }
        } catch (error) {
            console.error('check reward failed: ', error);
            return { success: false, error: 'network error'};
        }
    },

    deletePlayer: async function(userID) {
        try {
            const response = await fetch(`${this.baseURL}/deletePlayer?userID=${userID}`);
            const data = await response.json();
            
            if (response.ok) {
                return { success: true, data };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('delete player failed:', error);
            return { success: false, error: 'network error' };
        }
    },

    clearAllData: async function() {
        try {
            const response = await fetch(`${this.baseURL}/clearall`);
            const data = await response.json();
            
            if (response.ok) {
                return { success: true, data };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('clear all data failed:', error);
            return { success: false, error: 'network error' };
        }
    },

    testConnection: async function() {
        const tests = [
            { name: 'status', func: () => this.checkStatus() },
            { name: 'set Reward', func: () => this.setReward('user123', 100) },
            { name: 'get Reward', func: () => this.getReward('user123') },
            { name: 'check Reward', func: () => this.checkReward('admin123') }
        ];
        const results = [];

        for (const test of tests) {
            try {
                const result = await test.func();
                results.push({
                    name: test.name,
                    success: result.success !== false,
                    message: result.success ? 'Success': `${result.error}`
                });
            } catch (error) {
                results.push({
                    name: test.name,
                    success: false,
                    message: `${error.message}`
                });
            }
        }
        
        let message = 'result:\n\n';
        results.forEach(result => {
            message += `${result.name}: ${result.success ? '' : ''} ${result.message}\n`;
        });
        alert(message);
        return results;
    }
};