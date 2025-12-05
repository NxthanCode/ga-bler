const UIManager = {
    showGiveRewardForm: function() {
        this.showActionForm('give-reward', 'Give Reward to Player', `
            <div class="form-group">
                <label for="action-player-id">Player ID:</label>
                <input type="text" id="action-player-id" placeholder="Enter player ID" class="form-input">
            </div>
            <div class="form-group">
                <label for="action-reward-amount">Reward Amount:</label>
                <input type="number" id="action-reward-amount" placeholder="Enter amount" class="form-input" value="100">
            </div>
        `, 'Give Reward', 'submitGiveReward');
    },

    showEditPlayerForm: function() {
        this.showActionForm('edit-player', 'Edit Player Reward', `
            <div class="form-group">
                <label for="edit-player-id">Player ID:</label>
                <input type="text" id="edit-player-id" placeholder="Enter player ID" class="form-input">
            </div>
            <div class="form-group">
                <label for="edit-reward-amount">New Reward Amount:</label>
                <input type="number" id="edit-reward-amount" placeholder="Enter new amount" class="form-input">
            </div>
        `, 'Update Reward', 'submitEditPlayer');
    },

    showDeletePlayerForm: function() {
        this.showActionForm('delete-player', 'Delete Player', `
            <div class="form-group">
                <label for="delete-player-id">Player ID:</label>
                <input type="text" id="delete-player-id" placeholder="Enter player ID to delete" class="form-input">
            </div>
        `, 'Delete Player', 'submitDeletePlayer');
    },

    showCheckRewardForm: function() {
        this.showActionForm('check-reward', 'Check Player Reward', `
            <div class="form-group">
                <label for="check-player-id">Player ID:</label>
                <input type="text" id="check-player-id" placeholder="Enter player ID" class="form-input">
            </div>
        `, 'Check Reward', 'submitCheckReward');
    },

    showActionForm: function(id, title, fields, buttonText, submitFunction) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = id + 'Modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="UIManager.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    ${fields}
                    <div id="${id}-result" style="margin-top: 16px;"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="UIManager.closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="UIManager.${submitFunction}()">${buttonText}</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    },

    showDataModal: function() {
        APIManager.getData().then(data => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'dataModal';
            modal.innerHTML = `
                <div class="modal-content wide">
                    <div class="modal-header">
                        <h3>Data File Content</h3>
                        <button class="modal-close" onclick="UIManager.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <pre>${JSON.stringify(data, null, 2)}</pre>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.style.display = "flex";
        });
    },

    closeModal: function() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.remove();
        });
    },

    submitGiveReward: async function() {
        const playerId = document.getElementById('action-player-id').value;
        const amount = document.getElementById('action-reward-amount').value;
        const resultElement = document.getElementById('give-reward-result');

        if (!Utils.validatePlayerID(playerId)) {
            resultElement.innerHTML = '<div style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> Please enter a valid player ID</div>';
            return;
        }
        if (!Utils.validateReward(amount)) {
            resultElement.innerHTML = '<div style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> Please enter a valid amount</div>';
            return;
        }

        resultElement.innerHTML = '<div><i class="fas fa-spinner fa-spin"></i> Processing...</div>';
        
        const result = await APIManager.setReward(playerId, amount);

        if (result.success) {
            resultElement.innerHTML = `<div style="color: #10b981;"><i class="fas fa-check-circle"></i> ${playerId} now has ${amount} rewards</div>`;
            setTimeout(() => {
                this.closeModal();
                Main.refreshCurrentTab();
            }, 1500);
        } else {
            resultElement.innerHTML = `<div style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> Error: ${result.error}</div>`;
        }
    },

    submitEditPlayer: async function() {
        const playerId = document.getElementById('edit-player-id').value;
        const amount = document.getElementById('edit-reward-amount').value;
        const resultElement = document.getElementById('edit-player-result');

        if (!Utils.validatePlayerID(playerId)) {
            resultElement.innerHTML = '<div style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> Please enter a valid player ID</div>';
            return;
        }
        if (!Utils.validateReward(amount)) {
            resultElement.innerHTML = '<div style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> Please enter a valid amount</div>';
            return;
        }

        resultElement.innerHTML = '<div><i class="fas fa-spinner fa-spin"></i> Updating...</div>';
        
        const result = await APIManager.setReward(playerId, amount);

        if (result.success) {
            resultElement.innerHTML = `<div style="color: #10b981;"><i class="fas fa-check-circle"></i> ${playerId} now has ${amount} rewards</div>`;
            setTimeout(() => {
                this.closeModal();
                Main.refreshCurrentTab();
            }, 1500);
        } else {
            resultElement.innerHTML = `<div style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> Error: ${result.error}</div>`;
        }
    },

    clearData: function() {
        if (!confirm('are you sure you want to delete data.json?')) return;
        
        const resultElement = document.getElementById('clear-data-result');
        resultElement.innerHTML = '<div><i class="fas fa-spinner fa-spin"></i> clearing all data...</div>';
        
        fetch('/api/clearall')
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    resultElement.innerHTML = `
                        <div style="color: #10b981; background: #10b98120; padding: 12px; border-radius: 6px;">
                            <i class="fas fa-check-circle"></i>
                            <strong></strong> ${result.message}<br>
                        </div>
                    `;
                    Main.refreshCurrentTab();
                } else {
                    resultElement.innerHTML = `<div style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> Error: ${result.error}</div>`;
                }
            })
            .catch(error => {
                resultElement.innerHTML = `<div style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> network error</div>`;
            });
    },

    submitDeletePlayer: async function() {
        const playerId = document.getElementById('delete-player-id').value;
        const resultElement = document.getElementById('delete-player-result');

        if (!Utils.validatePlayerID(playerId)) {
            resultElement.innerHTML = '<div style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> please enter a valid player ID</div>';
            return;
        }

        resultElement.innerHTML = '<div><i class="fas fa-spinner fa-spin"></i> Deleting...</div>';
        
        const result = await APIManager.deletePlayer(playerId);

        if (result.success) {
            resultElement.innerHTML = `<div style="color: #10b981;"><i class="fas fa-check-circle"></i> player ${playerId} has been deleted successfully!</div>`;
            setTimeout(() => {
                this.closeModal();
                Main.refreshCurrentTab();
            }, 1500);
        } else {
            resultElement.innerHTML = `<div style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> Error: ${result.error}</div>`;
        }
    },

    submitCheckReward: async function() {
        const playerId = document.getElementById('check-player-id').value;
        const resultElement = document.getElementById('check-reward-result');

        if (!Utils.validatePlayerID(playerId)) {
            resultElement.innerHTML = '<div style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> Please enter a valid player ID</div>';
            return;
        }

        resultElement.innerHTML = '<div><i class="fas fa-spinner fa-spin"></i> Checking...</div>';
        
        const result = await APIManager.getReward(playerId);

        if (result.success) {
            resultElement.innerHTML = `
                <div style="color: #10b981; background: #10b98120; padding: 12px; border-radius: 6px;">
                    <strong>Player:</strong> ${result.data.userID}<br>
                    <strong>Reward:</strong> ${Utils.formatNumber(result.data.reward)}
                </div>
            `;
        } else {
            resultElement.innerHTML = `<div style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> Error: ${result.error}</div>`;
        }
    },

    submitQuickReward: async function() {
        const playerId = document.getElementById('quick-player-id').value;
        const amount = document.getElementById('quick-reward-amount').value;
        const resultElement = document.getElementById('quick-reward-result');

        if (!Utils.validatePlayerID(playerId)) {
            resultElement.innerHTML = '<div style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> Please enter a valid player ID</div>';
            return;
        }
        if (!Utils.validateReward(amount)) {
            resultElement.innerHTML = '<div style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> Please enter a valid amount</div>';
            return;
        }

        resultElement.innerHTML = '<div><i class="fas fa-spinner fa-spin"></i> Processing...</div>';
        
        const result = await APIManager.setReward(playerId, amount);

        if (result.success) {
            resultElement.innerHTML = `<div style="color: #10b981;"><i class="fas fa-check-circle"></i>  ${playerId} now has ${amount} rewards</div>`;
            document.getElementById('quick-player-id').value = '';
            document.getElementById('quick-reward-amount').value = '100';
            Main.refreshCurrentTab();
        } else {
            resultElement.innerHTML = `<div style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> Error: ${result.error}</div>`;
        }
    },


    downloadData: function() {
        APIManager.getData().then(data => {
            Utils.downloadJSON(data, `rewards_backup_${Date.now()}.json`);
        });
    },

    updateDashboardTable: function(players) {
        const table = document.getElementById('dashboard-players-table');
        if (!table) return;
        
        if (!players || players.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 40px; color: #94a3b8;">
                        <i class="fas fa-users-slash"></i>
                        No players found
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        const recentPlayers = players.slice(0, 10);
        
        recentPlayers.forEach(player => {
            html += `
                <tr>
                    <td>${player.id}</td>
                    <td>${Utils.formatNumber(player.reward)}</td>
                    <td>
                        <button class="btn btn-sm" onclick="UIManager.editPlayerDirect('${player.id}')">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                    </td>
                    <td>
                        <button class="btn btn-sm" onclick="UIManager.deletePlayerDirect('${player.id}')" style="background: #ef4444; color: white; border: none;">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });
        
        if (players.length > 10) {
            html += `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 16px; color: #94a3b8;">
                        <i class="fas fa-ellipsis-h"></i>
                        Theres ${players.length - 10} more players, check em out on players tab 
                    </td>
                </tr>
            `;
        }
        
        table.innerHTML = html;
    },

    updatePlayersTable: function(players) {
        const table = document.getElementById('players-table');
        if (!table) return;
        
        if (!players || players.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 40px; color: #94a3b8;">
                        <i class="fas fa-users-slash"></i>
                        No players found
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        players.forEach(player => {
            html += `
                <tr>
                    <td>${player.id}</td>
                    <td>${Utils.formatNumber(player.reward)}</td>
                    <td>
                        <button class="btn btn-sm" onclick="UIManager.editPlayerDirect('${player.id}')">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                    </td>
                    <td>
                        <button class="btn btn-sm" onclick="UIManager.deletePlayerDirect('${player.id}')" style="background: #ef4444; color: white; border: none;">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });
        
        table.innerHTML = html;
    },

    editPlayerDirect: function(playerId) {
        this.showEditPlayerForm();
        document.getElementById('edit-player-id').value = playerId;
    },

    deletePlayerDirect: function(playerId) {
        this.showDeletePlayerForm();
        document.getElementById('delete-player-id').value = playerId;
    }
};