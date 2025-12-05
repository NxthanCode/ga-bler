const Main = {
    init: function() {
        this.loadComponents();
        this.setupEventListeners();
        this.startClock();
        
        setTimeout(() => {
            this.loadDashboardData();
            this.navigate('dashboard');
        }, 100);
    },

    loadComponents: function() {
        this.loadSidebar();
        this.loadHeader();
    },

    loadSidebar: function() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.innerHTML = `
                <nav class="sidebar">
                    <div class="sidebar-header">
                        <div class="logo">
                        <i class ="fas fa-dice"></i>
                            <div class="logo-text">
                                <h1>Gamble Simulator Dashboard</h1>
                                <span class="status online" id="api-status-badge">API Online</span>
                            </div>
                        </div>
                    </div>

                    <div class="sidebar-menu">
                        <button class="menu-item active" onclick="Main.navigate('dashboard')">
                            <i class="fas fa-home"></i>
                            <span>Dashboard</span>
                        </button>
                        <button class="menu-item" onclick="Main.navigate('players')">
                            <i class="fas fa-users"></i>
                            <span>Players</span>
                            <span class="badge" id="player-count">0</span>
                        </button>
                        <button class="menu-item" onclick="Main.navigate('actions')">
                            <i class="fas fa-tools"></i>
                            <span>Actions</span>
                        </button>
                        <button class="menu-item" onclick="Main.navigate('api')">
                            <i class="fas fa-code"></i>
                            <span>API Docs</span>
                        </button>
                        <button class="menu-item" onclick="Main.navigate('data')">
                            <i class="fas fa-database"></i>
                            <span>Data File</span>
                        </button>
                    </div>

                    <div class="sidebar-footer">
                        <div class="server-info">
                            <i class="fas fa-server"></i>
                            <span>Server Online</span>
                        </div>
                        <div class="timestamp">
                            <i class="fas fa-clock"></i>
                            <span id="current-time">-</span>
                        </div>
                        <div class ="developer-credit">
                            <i class = "fas fa-code"></i>
                            <a href="https://nvthan.dev" target="_blank" style="color: #60a5fa; text-decoration: none;">
                            nvthan.dev
                            </a>
                        </div>
                    </div>
                </nav>
            `;
        }
    },

    loadHeader: function() {
        const header = document.getElementById('header');
        if (header) {
            header.innerHTML = `
                <div class="top-bar">
                    <h1 id="page-title">Dashboard</h1>
                    <div class="top-bar-actions">
                        <button class="btn btn-secondary" onclick="Main.refreshCurrentTab()">
                            <i class="fas fa-sync-alt"></i>
                            Refresh
                        </button>
                    </div>
                </div>
            `;
        }
    },

    setupEventListeners: function() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                Main.refreshCurrentTab();
            }

            if (e.key === 'Escape') {
                UIManager.closeModal();
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                UIManager.closeModal();
            }
        });
    },

    tabTemplates: {
        dashboard: `
            <div class="stats-grid" id="stats-container"></div>

            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">Recent Players</h2>
                    <div class="section-actions">
                        <input type="text" class="search-input" placeholder="Search player..." id="dashboard-search">
                    </div>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Player ID</th>
                                <th>Reward</th>
                                <th>Actions</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody id="dashboard-players-table">
                            <tr>
                                <td colspan="4" class="loading-cell">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    Loading players...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `,
        
        players: `
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">All Players</h2>
                    <div class="section-actions">
                        <input type="text" class="search-input" placeholder="Search player..." id="players-search">
                    </div>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Player ID</th>
                                <th>Reward</th>
                                <th>Actions</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody id="players-table">
                            <tr>
                                <td colspan="4" class="loading-cell">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    Loading players...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `,
        
        actions: `
            <div class="section">
                <h2 class="section-title">Player Actions</h2>
                <div class="quick-actions-grid">
                    <button class="action-card" onclick="UIManager.showGiveRewardForm()">
                        <i class="fas fa-gift"></i>
                        <span>Give Reward</span>
                    </button>
                    <button class="action-card" onclick="UIManager.showEditPlayerForm()">
                        <i class="fas fa-edit"></i>
                        <span>Edit Player</span>
                    </button>
                    <button class="action-card" onclick="UIManager.showDeletePlayerForm()">
                        <i class="fas fa-trash"></i>
                        <span>Delete Player</span>
                    </button>
                    <button class="action-card" onclick="UIManager.showCheckRewardForm()">
                        <i class="fas fa-search"></i>
                        <span>Check Reward</span>
                    </button>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Quick Give Reward</h2>
                <div id="quick-reward-form" style="background: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #334155;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: end;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; color: #cbd5e1; font-size: 14px;">Player ID</label>
                            <input type="text" id="quick-player-id" placeholder="Enter player ID" class="form-input" style="width: 100%;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; color: #cbd5e1; font-size: 14px;">Reward Amount</label>
                            <input type="number" id="quick-reward-amount" placeholder="Enter amount" class="form-input" value="100" style="width: 100%;">
                        </div>
                        <button class="btn btn-primary" onclick="UIManager.submitQuickReward()" style="height: 42px;">
                            <i class="fas fa-paper-plane"></i>
                            Give Reward
                        </button>
                    </div>
                    <div id="quick-reward-result" style="margin-top: 16px;"></div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">System Actions</h2>
                <div class="quick-actions-grid">
                    <button class="action-card" onclick="APIManager.testConnection()">
                        <i class="fas fa-vial"></i>
                        <span>Test API</span>
                    </button>
                    <button class="action-card" onclick="UIManager.showDataModal()">
                        <i class="fas fa-eye"></i>
                        <span>View Data File</span>
                    </button>
                    <button class="action-card" onclick="UIManager.downloadData()">
                        <i class="fas fa-download"></i>
                        <span>Download Data</span>
                    </button>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title"></h2>
                <div style="background: #0f172a; padding: 20px; border-radius: 8px; border: 2px solid #efefefff;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                        <div>
                            <h3 style="color: #fafafaff; margin: 0;">clear data.json</h3>
                            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px;">
                                delete all players and other config
                            </p>
                        </div>
                    </div>
                    <button class="btn" onclick="UIManager.clearData()" style="width: 100%; background: #521414ff; color: white;">
                        <i class="fas fa-broom"></i>
                        submit
                    </button>
                    <div id="clear-data-result" style="margin-top: 16px;"></div>
                </div>
            </div>
        `,
        
        api: `
            <div class="section">
                <h2 class="section-title">API Documentation</h2>
                
                <div class="endpoints-grid">
                    <div class="endpoint-card">
                        <div class="endpoint-header">
                            <span class="method get">GET</span>
                            <code>/api/setReward?userID=player123&amp;reward=500</code>
                        </div>
                        <p>Set reward for a player</p>
                        <div class="endpoint-example">
                            <strong>Example:</strong>
                            <code>/api/setReward?userID=player123&amp;reward=500</code>
                        </div>
                    </div>

                    <div class="endpoint-card">
                        <div class="endpoint-header">
                            <span class="method get">GET</span>
                            <code>/api/getReward?userID=player123</code>
                        </div>
                        <p>Get current reward for a player</p>
                        <div class="endpoint-example">
                            <strong>Example:</strong>
                            <code>/api/getReward?userID=player123</code>
                        </div>
                    </div>

                    <div class="endpoint-card">
                        <div class="endpoint-header">
                            <span class="method get">GET</span>
                            <code>/api/checkreward?userID=admin123</code>
                        </div>
                        <p>Check reward for a specific user ID</p>
                        <div class="endpoint-example">
                            <strong>Example:</strong>
                            <code>/api/checkreward?userID=admin123</code>
                        </div>
                    </div>

                    <div class="endpoint-card">
                        <div class="endpoint-header">
                            <span class="method get">GET</span>
                            <code>/api/status</code>
                        </div>
                        <p>Get API status and statistics</p>
                    </div>

                    <div class="endpoint-card">
                        <div class="endpoint-header">
                            <span class="method get">GET</span>
                            <code>/api/players</code>
                        </div>
                        <p>Get list of all players with rewards</p>
                    </div>

                    <div class="endpoint-card">
                        <div class="endpoint-header">
                            <span class="method get">GET</span>
                            <code>/api/data</code>
                        </div>
                        <p>Get complete data file content</p>
                    </div>

                    <div class="endpoint-card">
                        <div class="endpoint-header">
                            <span class="method get">GET</span>
                            <code>/api/deletePlayer?userID=player123</code>
                        </div>
                        <p>Delete a player from the system</p>
                        <div class="endpoint-example">
                            <strong>Example:</strong>
                            <code>/api/deletePlayer?userID=player123</code>
                        </div>
                    </div>

                    <div class="endpoint-card">
                        <div class="endpoint-header">
                            <span class="method get">GET</span>
                            <code>/api/clearall</code>
                        </div>
                        <p>Clear all data from the system</p>
                        <div class="endpoint-example">
                            <strong>Example:</strong>
                            <code>/api/clearall</code>
                        </div>
                    </div>
                </div>
            </div>
        `,
        
        data: `
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">Data File Viewer</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="UIManager.downloadData()">
                            <i class="fas fa-download"></i>
                            Download JSON
                        </button>
                        <button class="btn btn-secondary" onclick="Main.refreshDataTab()">
                            <i class="fas fa-sync-alt"></i>
                            Refresh
                        </button>
                    </div>
                </div>
                <div class="code-block">
                    <pre id="data-file-content">Loading data file content...</pre>
                </div>
            </div>
        `
    },

    navigate: function(section) {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.classList.remove('active');
        });
        
        let menuSelector = '';
        let pageTitle = '';
        
        switch(section) {
            case 'dashboard':
                menuSelector = '.menu-item:nth-child(1)';
                pageTitle = 'Dashboard';
                break;
            case 'players':
                menuSelector = '.menu-item:nth-child(2)';
                pageTitle = 'Player Management';
                break;
            case 'actions':
                menuSelector = '.menu-item:nth-child(3)';
                pageTitle = 'Actions';
                break;
            case 'api':
                menuSelector = '.menu-item:nth-child(4)';
                pageTitle = 'API Documentation';
                break;
            case 'data':
                menuSelector = '.menu-item:nth-child(5)';
                pageTitle = 'Data File Viewer';
                break;
            default:
                menuSelector = '.menu-item:nth-child(1)';
                pageTitle = 'Dashboard';
        }
        
        const buttonElement = document.querySelector(menuSelector);
        if (buttonElement) {
            buttonElement.classList.add('active');
        }
        
        const titleElement = document.getElementById('page-title');
        if (titleElement) {
            titleElement.textContent = pageTitle;
        }
        
        this.loadTabContent(section);
    },

    loadTabContent: function(tabName) {
        const container = document.getElementById('content-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="loading-container" style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #60a5fa;"></i>
                <p style="margin-top: 16px; color: #94a3b8;">Loading ${tabName}...</p>
            </div>
        `;
        
        setTimeout(() => {
            if (this.tabTemplates[tabName]) {
                container.innerHTML = this.tabTemplates[tabName];
                this.initializeTab(tabName);
            }
        }, 50);
    },

    initializeTab: function(tabName) {
        switch(tabName) {
            case 'dashboard':
                this.initializeDashboard();
                break;
            case 'players':
                this.initializePlayers();
                break;
            case 'data':
                this.initializeData();
                break;
            case 'actions':
                this.initializeActions();
                break;
        }
    },

    initializeDashboard: function() {
        this.loadStats();
        
        const table = document.getElementById('dashboard-players-table');
        if (table) {
            APIManager.getPlayers().then(playersData => {
                if (playersData && playersData.players) {
                    UIManager.updateDashboardTable(playersData.players);
                }
            });
        }
        
        const searchInput = document.getElementById('dashboard-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.searchDashboardPlayers();
            }, 300));
        }
    },

    initializePlayers: function() {
        const table = document.getElementById('players-table');
        if (table) {
            APIManager.getPlayers().then(playersData => {
                if (playersData && playersData.players) {
                    UIManager.updatePlayersTable(playersData.players);
                }
            });
        }
        
        const searchInput = document.getElementById('players-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.searchPlayersTab();
            }, 300));
        }
    },

    initializeData: function() {
        const dataContent = document.getElementById('data-file-content');
        if (dataContent) {
            APIManager.getData().then(data => {
                dataContent.textContent = JSON.stringify(data, null, 2);
            });
        }
    },

    initializeActions: function() {
        console.log('Actions tab initialized');
    },

    searchDashboardPlayers: function() {
        const searchTerm = document.getElementById('dashboard-search').value.toLowerCase();
        const rows = document.querySelectorAll('#dashboard-players-table tr');
        
        rows.forEach(row => {
            if (row.cells && row.cells.length > 0) {
                const playerId = row.cells[0].textContent.toLowerCase();
                row.style.display = playerId.includes(searchTerm) ? '' : 'none';
            }
        });
    },

    searchPlayersTab: function() {
        const searchTerm = document.getElementById('players-search').value.toLowerCase();
        const rows = document.querySelectorAll('#players-table tr');
        
        rows.forEach(row => {
            if (row.cells && row.cells.length > 0) {
                const playerId = row.cells[0].textContent.toLowerCase();
                row.style.display = playerId.includes(searchTerm) ? '' : 'none';
            }
        });
    },

    refreshDataTab: function() {
        const dataContent = document.getElementById('data-file-content');
        if (dataContent) {
            dataContent.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing data...';
            
            APIManager.getData().then(data => {
                dataContent.textContent = JSON.stringify(data, null, 2);
            });
        }
    },

    refreshCurrentTab: function() {
        const activeTab = this.getActiveTab();
        switch(activeTab) {
            case 'dashboard':
                this.initializeDashboard();
                break;
            case 'players':
                this.initializePlayers();
                break;
            case 'data':
                this.initializeData();
                break;
            case 'actions':
                this.initializeActions();
                break;
        }
    },

    getActiveTab: function() {
        const activeButton = document.querySelector('.menu-item.active');
        if (!activeButton) return 'dashboard';
        
        const text = activeButton.querySelector('span').textContent;
        if (text === 'Dashboard') return 'dashboard';
        if (text === 'Players') return 'players';
        if (text === 'Actions') return 'actions';
        if (text === 'API Docs') return 'api';
        if (text === 'Data File') return 'data';
        return 'dashboard';
    },

    loadDashboardData: async function() {
        try {
            const status = await APIManager.checkStatus();
            
            if (status) {
                const statusBadge = document.getElementById('api-status-badge');
                if (statusBadge) {
                    statusBadge.className = 'status online';
                    statusBadge.textContent = 'API Online';
                }
            }
        } catch (error) {
            const statusBadge = document.getElementById('api-status-badge');
            if (statusBadge) {
                statusBadge.className = 'status offline';
                statusBadge.textContent = 'API Offline';
            }
        }
    },

    loadStats: function() {
        const stats = document.getElementById('stats-container');
        if (!stats) return;
        
        stats.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-content">
                    <h3>Players</h3>
                    <p class="stat-value" id="stat-players">0</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-coins"></i>
                </div>
                <div class="stat-content">
                    <h3>Rewards</h3>
                    <p class="stat-value" id="stat-rewards">0</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-code"></i>
                </div>
                <div class="stat-content">
                    <h3>API Docs</h3>
                    <p class="stat-value">7</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-content">
                    <h3>System</h3>
                    <p class="stat-value" id="stat-status">Loading...</p>
                </div>
            </div>
        `;
        
        APIManager.checkStatus().then(status => {
            if (status) {
                document.getElementById('stat-players').textContent = status.players || 0;
                document.getElementById('player-count').textContent = status.players || 0;
                document.getElementById('stat-rewards').textContent = Utils.formatNumber(status.rewards || 0);
                document.getElementById('stat-status').textContent = 'online';
                document.getElementById('stat-status').style.color = '#10b981';
            }
        });
    },

    startClock: function() {
        const updateClock = () => {
            const timeElement = document.getElementById('current-time');
            if(timeElement) {
                timeElement.textContent = Utils.formatTime();
            }
        };
        updateClock();
        setInterval(updateClock, 1000);
    }
};

window.addEventListener('load', function() {
    Main.init();
});