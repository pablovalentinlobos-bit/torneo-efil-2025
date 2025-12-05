// State Management
const state = {
    teams: JSON.parse(localStorage.getItem('efil_teams')) || [],
    matches: JSON.parse(localStorage.getItem('efil_matches')) || [],
    alerts: JSON.parse(localStorage.getItem('efil_alerts')) || [],
    groups: JSON.parse(localStorage.getItem('efil_groups')) || [],
    isAuthenticated: sessionStorage.getItem('efil_auth') === 'true'
};

// Utils
const saveState = () => {
    localStorage.setItem('efil_teams', JSON.stringify(state.teams));
    localStorage.setItem('efil_matches', JSON.stringify(state.matches));
    localStorage.setItem('efil_alerts', JSON.stringify(state.alerts));
    localStorage.setItem('efil_groups', JSON.stringify(state.groups));
    renderAll();
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Navigation
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');

        if (targetId === 'admin') {
            if (state.isAuthenticated) {
                navigateTo('admin-dashboard');
            } else {
                navigateTo('admin-login');
            }
        } else {
            navigateTo(targetId);
        }
    });
});

function navigateTo(targetId) {
    // Update UI
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    const targetElement = document.getElementById(targetId);
    if (targetElement) targetElement.classList.add('active');

    // Update Nav
    document.querySelectorAll('.nav-links a').forEach(link => {
        const linkTarget = link.getAttribute('data-target');
        if (linkTarget === 'admin') {
            link.classList.toggle('active', targetId === 'admin-login' || targetId === 'admin-dashboard');
        } else {
            link.classList.toggle('active', linkTarget === targetId);
        }
    });

    // Refresh data if needed
    if (targetId === 'standings') renderStandings();
    if (targetId === 'matches') renderMatches();
    if (targetId === 'admin-dashboard') renderAdminPanel();
    if (targetId === 'home') renderAlerts();
}

// Authentication
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;

    if (user === 'admin' && pass === 'efil2025') {
        state.isAuthenticated = true;
        sessionStorage.setItem('efil_auth', 'true');
        navigateTo('admin-dashboard');
        e.target.reset();
    } else {
        alert('Usuario o contraseña incorrectos');
    }
});

function logout() {
    state.isAuthenticated = false;
    sessionStorage.removeItem('efil_auth');
    navigateTo('home');
}

// Alerts
document.getElementById('add-alert-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const message = document.getElementById('alert-message').value;
    state.alerts.push({
        id: generateId(),
        message,
        date: new Date().toISOString()
    });
    saveState();
    e.target.reset();
});

function deleteAlert(id) {
    if (confirm('¿Eliminar esta alerta?')) {
        state.alerts = state.alerts.filter(a => a.id !== id);
        saveState();
    }
}

function editAlert(id) {
    const alert = state.alerts.find(a => a.id === id);
    if (!alert) return;
    const newMessage = prompt('Editar alerta:', alert.message);
    if (newMessage !== null && newMessage.trim() !== '') {
        alert.message = newMessage;
        saveState();
    }
}

// Groups
document.getElementById('add-group-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('group-name').value;
    state.groups.push({ id: generateId(), name });
    saveState();
    e.target.reset();
});

function deleteGroup(id) {
    if (confirm('¿Eliminar este grupo? Los equipos quedarán sin grupo.')) {
        state.groups = state.groups.filter(g => g.id !== id);
        state.teams = state.teams.map(t => t.groupId === id ? { ...t, groupId: null } : t);
        saveState();
    }
}

function editGroup(id) {
    const group = state.groups.find(g => g.id === id);
    if (!group) return;
    const newName = prompt('Nuevo nombre del grupo:', group.name);
    if (newName !== null && newName.trim() !== '') {
        group.name = newName;
        saveState();
    }
}

// Teams
document.getElementById('add-team-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('team-name').value;
    const logo = document.getElementById('team-logo').value || 'https://via.placeholder.com/50?text=EFIL';
    const groupId = document.getElementById('team-group').value || null;

    state.teams.push({ id: generateId(), name, logo, groupId });
    saveState();
    e.target.reset();
    alert('Equipo agregado!');
    renderAdminPanel();
});

function deleteTeam(id) {
    if (confirm('¿Eliminar este equipo? Se eliminarán también sus partidos.')) {
        state.teams = state.teams.filter(t => t.id !== id);
        state.matches = state.matches.filter(m => m.homeId !== id && m.awayId !== id);
        saveState();
    }
}

function editTeam(id) {
    const team = state.teams.find(t => t.id === id);
    if (!team) return;

    const newName = prompt('Nuevo nombre del equipo:', team.name);
    if (newName !== null && newName.trim() !== '') {
        team.name = newName;

        // Simple prompt for group change is tricky, let's just stick to name for now via prompt, 
        // or we could build a modal. For simplicity/speed requested:
        const newLogo = prompt('Nueva URL del escudo (dejar igual para mantener):', team.logo);
        if (newLogo !== null && newLogo.trim() !== '') {
            team.logo = newLogo;
        }
        saveState();
    }
}

// Matches
document.getElementById('add-match-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const homeId = document.getElementById('match-home').value;
    const awayId = document.getElementById('match-away').value;
    const date = document.getElementById('match-date').value;

    if (homeId === awayId) {
        alert('Un equipo no puede jugar contra sí mismo.');
        return;
    }

    state.matches.push({
        id: generateId(),
        homeId,
        awayId,
        date,
        homeScore: null,
        awayScore: null,
        played: false
    });
    saveState();
    e.target.reset();
    alert('Partido creado!');
    renderAdminPanel();
});

function updateMatchResult(matchId, homeScore, awayScore) {
    const match = state.matches.find(m => m.id === matchId);
    if (match) {
        match.homeScore = homeScore === '' ? null : parseInt(homeScore);
        match.awayScore = awayScore === '' ? null : parseInt(awayScore);
        match.played = (match.homeScore !== null && match.awayScore !== null);
        saveState();
    }
}

function updateMatchDate(matchId, newDate) {
    const match = state.matches.find(m => m.id === matchId);
    if (match) {
        match.date = newDate;
        saveState();
    }
}

function deleteMatch(id) {
    if (confirm('¿Eliminar este partido?')) {
        state.matches = state.matches.filter(m => m.id !== id);
        saveState();
    }
}

// Rendering
function renderAlerts() {
    const container = document.getElementById('alerts-container');
    if (!container) return;

    if (state.alerts.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = state.alerts.map(alert => `
        <div class="alert-card">
            <span><strong>IMPORTANTE:</strong> ${alert.message}</span>
        </div>
    `).join('');
}

function renderAdminPanel() {
    // Populate Group Select
    const groupSelect = document.getElementById('team-group');
    if (groupSelect) {
        const groupOptions = state.groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
        groupSelect.innerHTML = '<option value="">Sin Grupo</option>' + groupOptions;
    }

    // Render Groups List
    const groupsList = document.getElementById('admin-groups-list');
    if (groupsList) {
        groupsList.innerHTML = state.groups.map(g => `
            <li style="display:flex; justify-content:space-between; padding: 5px 0; border-bottom: 1px solid var(--border);">
                <span>${g.name}</span>
                <div>
                    <button onclick="editGroup('${g.id}')" style="color:blue; border:none; background:none; cursor:pointer; margin-right:5px;">✎</button>
                    <button onclick="deleteGroup('${g.id}')" style="color:red; border:none; background:none; cursor:pointer;">&times;</button>
                </div>
            </li>
        `).join('');
    }

    // Populate Team Selects
    const homeSelect = document.getElementById('match-home');
    const awaySelect = document.getElementById('match-away');

    const options = state.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    homeSelect.innerHTML = '<option value="">Seleccionar Local</option>' + options;
    awaySelect.innerHTML = '<option value="">Seleccionar Visitante</option>' + options;

    // Render Teams List
    const teamsList = document.getElementById('admin-teams-list');
    if (teamsList) {
        teamsList.innerHTML = state.teams.map(t => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 8px 0; border-bottom: 1px solid var(--border);">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${t.logo}" style="width:20px; height:20px; object-fit:contain;">
                    <span>${t.name}</span>
                    <span style="font-size:0.8em; color:gray;">(${state.groups.find(g => g.id === t.groupId)?.name || 'Sin Grupo'})</span>
                </div>
                <div>
                    <button onclick="editTeam('${t.id}')" style="color:blue; border:none; background:none; cursor:pointer; margin-right:5px;">✎</button>
                    <button onclick="deleteTeam('${t.id}')" style="color:red; border:none; background:none; cursor:pointer;">&times;</button>
                </div>
            </div>
        `).join('');
    }

    // Render Alerts List
    const alertsList = document.getElementById('admin-alerts-list');
    if (alertsList) {
        alertsList.innerHTML = state.alerts.map(alert => `
            <div class="alert-card info">
                <span>${alert.message}</span>
                <div>
                    <button onclick="editAlert('${alert.id}')" style="color:blue; border:none; background:none; cursor:pointer; margin-right:5px;">✎</button>
                    <button class="alert-delete-btn" onclick="deleteAlert('${alert.id}')">&times;</button>
                </div>
            </div>
        `).join('');
    }

    // Render Admin Matches List
    const list = document.getElementById('admin-matches-list');
    list.innerHTML = state.matches.map(match => {
        const home = state.teams.find(t => t.id === match.homeId);
        const away = state.teams.find(t => t.id === match.awayId);
        if (!home || !away) return '';

        return `
            <div class="admin-match-row">
                <div class="admin-match-info">
                    <span>${home.name} vs ${away.name}</span>
                    <button onclick="deleteMatch('${match.id}')" style="color:red; border:none; background:none; cursor:pointer; font-size:1.2rem;">&times;</button>
                </div>
                <div class="admin-match-controls">
                    <label>Fecha:</label>
                    <input type="datetime-local" value="${match.date}" onchange="updateMatchDate('${match.id}', this.value)">
                    
                    <label>Res:</label>
                    <input type="number" style="width: 50px" placeholder="L" value="${match.homeScore !== null ? match.homeScore : ''}" 
                        onchange="updateMatchResult('${match.id}', this.value, this.nextElementSibling.value)">
                    <input type="number" style="width: 50px" placeholder="V" value="${match.awayScore !== null ? match.awayScore : ''}"
                        onchange="updateMatchResult('${match.id}', this.previousElementSibling.value, this.value)">
                </div>
            </div>
        `;
    }).join('');
}

function renderMatches() {
    const list = document.getElementById('matches-list');
    if (state.matches.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:var(--text-light)">No hay partidos programados.</p>';
        return;
    }

    list.innerHTML = state.matches.map(match => {
        const home = state.teams.find(t => t.id === match.homeId);
        const away = state.teams.find(t => t.id === match.awayId);
        if (!home || !away) return '';

        return `
            <div class="match-card">
                <div class="match-teams">
                    <div class="match-team">
                        <span class="team-cell">
                            <img src="${home.logo}" class="team-logo-sm" alt="">
                            ${home.name}
                        </span>
                        <span class="match-score">${match.played ? match.homeScore : '-'}</span>
                    </div>
                    <div class="match-team">
                        <span class="team-cell">
                            <img src="${away.logo}" class="team-logo-sm" alt="">
                            ${away.name}
                        </span>
                        <span class="match-score">${match.played ? match.awayScore : '-'}</span>
                    </div>
                </div>
                <div class="match-meta">
                    ${match.played ? 'Finalizado' : new Date(match.date).toLocaleString()}
                </div>
            </div>
        `;
    }).join('');
}

function renderStandings() {
    const container = document.getElementById('standings-container');
    container.innerHTML = '';

    // Calculate Stats for ALL teams
    const stats = {};
    state.teams.forEach(t => {
        stats[t.id] = {
            ...t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0
        };
    });

    state.matches.forEach(m => {
        if (m.played) {
            const h = stats[m.homeId];
            const a = stats[m.awayId];
            if (!h || !a) return;

            h.played++; a.played++;
            h.gf += m.homeScore; h.ga += m.awayScore;
            a.gf += m.awayScore; a.ga += m.homeScore;

            if (m.homeScore > m.awayScore) {
                h.won++; h.pts += 3; a.lost++;
            } else if (m.homeScore < m.awayScore) {
                a.won++; a.pts += 3; h.lost++;
            } else {
                h.drawn++; h.pts += 1; a.drawn++; a.pts += 1;
            }
        }
    });

    // Helper to generate table HTML
    const createTable = (groupName, teams) => {
        const sortedTeams = teams.sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            const dgA = a.gf - a.ga;
            const dgB = b.gf - b.ga;
            return dgB - dgA;
        });

        return `
            <div style="margin-bottom: 30px;">
                <h3 style="margin-bottom: 10px; color: var(--primary-dark);">${groupName}</h3>
                <div class="table-responsive">
                    <table class="standings-table">
                        <thead>
                            <tr>
                                <th>Pos</th>
                                <th>Equipo</th>
                                <th>PJ</th>
                                <th>G</th>
                                <th>E</th>
                                <th>P</th>
                                <th>GF</th>
                                <th>GC</th>
                                <th>DG</th>
                                <th>Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sortedTeams.map((t, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>
                                        <div class="team-cell">
                                            <img src="${t.logo}" class="team-logo-sm" alt="">
                                            ${t.name}
                                        </div>
                                    </td>
                                    <td>${t.played}</td>
                                    <td>${t.won}</td>
                                    <td>${t.drawn}</td>
                                    <td>${t.lost}</td>
                                    <td>${t.gf}</td>
                                    <td>${t.ga}</td>
                                    <td>${t.gf - t.ga}</td>
                                    <td><strong>${t.pts}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    };

    // Render Groups
    if (state.groups.length > 0) {
        state.groups.forEach(group => {
            const groupTeams = Object.values(stats).filter(t => t.groupId === group.id);
            if (groupTeams.length > 0) {
                container.innerHTML += createTable(group.name, groupTeams);
            }
        });
    }

    // Render Teams without Group
    const noGroupTeams = Object.values(stats).filter(t => !t.groupId);
    if (noGroupTeams.length > 0) {
        container.innerHTML += createTable(state.groups.length > 0 ? 'Sin Grupo' : 'Tabla General', noGroupTeams);
    }

    if (Object.keys(stats).length === 0) {
        container.innerHTML = '<p>No hay equipos registrados.</p>';
    }
}

function renderAll() {
    renderAdminPanel(); // To update inputs if needed
    renderAlerts();
    // Other views update on navigation
}

// Init
renderAll();
