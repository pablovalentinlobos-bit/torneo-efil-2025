// State Management
const state = {
    teams: JSON.parse(localStorage.getItem('efil_teams')) || [],
    matches: JSON.parse(localStorage.getItem('efil_matches')) || [],
    alerts: JSON.parse(localStorage.getItem('efil_alerts')) || [],
    groups: JSON.parse(localStorage.getItem('efil_groups')) || [],
    cups: JSON.parse(localStorage.getItem('efil_cups')) || [],
    adminPass: localStorage.getItem('efil_admin_pass') || 'efil2025',
    isAuthenticated: sessionStorage.getItem('efil_auth') === 'true'
};
window.efilState = state;

// Utils
const saveState = () => {
    localStorage.setItem('efil_teams', JSON.stringify(state.teams));
    localStorage.setItem('efil_matches', JSON.stringify(state.matches));
    localStorage.setItem('efil_alerts', JSON.stringify(state.alerts));
    localStorage.setItem('efil_groups', JSON.stringify(state.groups));
    localStorage.setItem('efil_groups', JSON.stringify(state.groups));
    localStorage.setItem('efil_cups', JSON.stringify(state.cups));
    localStorage.setItem('efil_admin_pass', state.adminPass);
    renderAll();
};

// Data Migration (Legacy Support)
state.cups.forEach(cup => {
    cup.matches.forEach(m => {
        if (!m.phase) m.phase = 'Octavos';
    });
});
saveState();

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
    if (targetId === 'copas') renderCups();
}

// Authentication
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;

    if (user === 'admin' && pass === state.adminPass) {
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



// Configuration
document.getElementById('change-password-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const newPass = document.getElementById('new-admin-pass').value;
    if (newPass && newPass.trim().length > 3) {
        state.adminPass = newPass.trim();
        saveState();
        alert('Contraseña actualizada correctamente.');
        e.target.reset();
    } else {
        alert('La contraseña debe tener al menos 4 caracteres.');
    }
});

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
    const groupId = document.getElementById('team-group').value || null;

    state.teams.push({ id: generateId(), name, groupId });
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

// Copas Logic
document.getElementById('add-cup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cup-name').value;
    state.cups.push({
        id: generateId(),
        name,
        teams: [], // Array of strings (names) or objects
        matches: [] // Array of match objects specific to this cup
    });
    saveState();
    e.target.reset();
});

function deleteCup(id) {
    if (confirm('¿Eliminar esta copa?')) {
        state.cups = state.cups.filter(c => c.id !== id);
        saveState();
    }
}

function addTeamToCup(cupId) {
    const cup = state.cups.find(c => c.id === cupId);
    if (!cup) return;
    const name = prompt('Nombre del equipo para la copa:');
    if (name && name.trim()) {
        cup.teams.push({ id: generateId(), name: name.trim() });
        saveState();
    }
}

function deleteTeamFromCup(cupId, teamId) {
    const cup = state.cups.find(c => c.id === cupId);
    if (!cup) return;
    if (confirm('¿Eliminar equipo de la copa?')) {
        cup.teams = cup.teams.filter(t => t.id !== teamId);
        // Also remove matches involving this team? For simplicity, keeping matches but they might look weird.
        saveState();
    }
}

function addMatchToCup(cupId) {
    const cup = state.cups.find(c => c.id === cupId);
    if (!cup) return;

    // Simple prompt-based flow for now to avoid complex UI in admin panel
    if (cup.teams.length < 2) {
        alert('Necesitas al menos 2 equipos en la copa.');
        return;
    }

    // Create a temporary UI or just use prompts? 
    // Let's use a cleaner approach: We will render a mini-form inside the cup card in renderAdminPanel
    // So this function is just a placeholder or helper if needed.
    // Actually, let's implement the logic called by the form submit.
}

function createCupMatch(cupId, homeId, awayId, date, phase) {
    const cup = state.cups.find(c => c.id === cupId);
    if (!cup) return;

    cup.matches.push({
        id: generateId(),
        homeId,
        awayId,
        date,
        phase,
        homeScore: null,
        awayScore: null,
        played: false
    });
    saveState();
}

function deleteMatchFromCup(cupId, matchId) {
    const cup = state.cups.find(c => c.id === cupId);
    if (!cup) return;
    if (confirm('¿Eliminar partido?')) {
        cup.matches = cup.matches.filter(m => m.id !== matchId);
        saveState();
    }
}

function updateCupMatchResult(cupId, matchId, homeScore, awayScore) {
    const cup = state.cups.find(c => c.id === cupId);
    if (!cup) return;
    const match = cup.matches.find(m => m.id === matchId);
    if (match) {
        match.homeScore = homeScore === '' ? null : parseInt(homeScore);
        match.awayScore = awayScore === '' ? null : parseInt(awayScore);
        match.played = (match.homeScore !== null && match.awayScore !== null);
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


    // Render Cups Management
    const cupsList = document.getElementById('admin-cups-list');
    if (cupsList) {
        cupsList.innerHTML = state.cups.map(cup => {
            const teamOptions = cup.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

            return `
            <div class="card" style="margin-bottom: 20px; border: 1px solid var(--border);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h4 style="margin:0;">${cup.name}</h4>
                    <button onclick="deleteCup('${cup.id}')" style="color:red; border:none; background:none; cursor:pointer;">&times; Eliminar Copa</button>
                </div>
                
                <!-- Teams Section -->
                <div style="margin-bottom: 15px; padding: 10px; background: rgba(0,0,0,0.02); border-radius: 8px;">
                    <h5 style="margin-top:0;">Equipos (${cup.teams.length})</h5>
                    <button class="btn btn-sm btn-outline" onclick="addTeamToCup('${cup.id}')" style="margin-bottom:10px;">+ Agregar Equipo Manual</button>
                    <ul style="list-style:none; padding:0;">
                        ${cup.teams.map(t => `
                            <li style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #eee;">
                                <span>${t.name}</span>
                                <button onclick="deleteTeamFromCup('${cup.id}', '${t.id}')" style="color:red; border:none; background:none; cursor:pointer;">&times;</button>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <!-- Matches Section -->
                <div style="padding: 10px; background: rgba(0,0,0,0.02); border-radius: 8px;">
                    <h5 style="margin-top:0;">Partidos</h5>
                    <form onsubmit="event.preventDefault(); createCupMatch('${cup.id}', this.home.value, this.away.value, this.date.value, this.phase.value); this.reset();" style="display:grid; gap:10px; margin-bottom:10px;">
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                            <select name="home" required><option value="">Local</option>${teamOptions}</select>
                            <select name="away" required><option value="">Visitante</option>${teamOptions}</select>
                        </div>
                        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:10px;">
                            <input type="datetime-local" name="date" required>
                            <select name="phase" required>
                                <option value="Octavos">Octavos</option>
                                <option value="Cuartos">Cuartos</option>
                                <option value="Semis">Semis</option>
                                <option value="Final">Final</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-sm btn-primary">Agregar Partido</button>
                    </form>
                    
                    <div>
                        ${cup.matches.map(m => {
                const home = cup.teams.find(t => t.id === m.homeId);
                const away = cup.teams.find(t => t.id === m.awayId);
                if (!home || !away) return '';
                return `
                                <div style="display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px solid #eee; font-size:0.9em;">
                                    <div style="flex:1;">
                                        <div>${home.name} vs ${away.name}</div>
                                        <div style="font-size:0.8em; color:gray;">${new Date(m.date).toLocaleString()}</div>
                                    </div>
                                    <div style="display:flex; gap:5px; align-items:center;">
                                        <input type="number" style="width:30px;" placeholder="L" value="${m.homeScore !== null ? m.homeScore : ''}" 
                                            onchange="updateCupMatchResult('${cup.id}', '${m.id}', this.value, this.nextElementSibling.value)">
                                        <input type="number" style="width:30px;" placeholder="V" value="${m.awayScore !== null ? m.awayScore : ''}"
                                            onchange="updateCupMatchResult('${cup.id}', '${m.id}', this.previousElementSibling.value, this.value)">
                                        <button onclick="deleteMatchFromCup('${cup.id}', '${m.id}')" style="color:red; border:none; background:none; cursor:pointer;">&times;</button>
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }
}

function renderCups() {
    const container = document.getElementById('copas-container');
    if (!container) return;

    if (state.cups.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-light)">No hay copas activas.</p>';
        return;
    }

    const phases = ['Octavos', 'Cuartos', 'Semis', 'Final'];

    container.innerHTML = state.cups.map(cup => `
        <div class="card" style="margin-bottom: 30px; background: transparent; box-shadow: none; border: none; padding: 0;">
            <h3 style="color:var(--primary); border-bottom: 2px solid var(--primary); padding-bottom: 10px; margin-bottom: 20px;">${cup.name}</h3>
            
            <div class="bracket-view">
                <div class="bracket-container">
                    ${phases.map(phase => `
                        <div class="bracket-round">
                            <div class="bracket-title">${phase}</div>
                            ${cup.matches.filter(m => m.phase === phase).map(m => {
        const home = cup.teams.find(t => t.id === m.homeId);
        const away = cup.teams.find(t => t.id === m.awayId);
        if (!home || !away) return '';

        return `
                                    <div class="bracket-match">
                                        <div class="bracket-team">
                                            <span>
                                                ${home.name}
                                            </span>
                                            <span class="bracket-score">${m.played ? m.homeScore : '-'}</span>
                                        </div>
                                        <div class="bracket-team">
                                            <span>
                                                ${away.name}
                                            </span>
                                            <span class="bracket-score">${m.played ? m.awayScore : '-'}</span>
                                        </div>
                                        <div class="bracket-meta">
                                            ${m.played ? 'Finalizado' : new Date(m.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                `;
    }).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function renderMatches() {
    const container = document.getElementById('matches-list');
    if (!container) return;

    if (state.matches.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-light)">No hay partidos programados.</p>';
        return;
    }

    // Sort matches by date
    const sortedMatches = [...state.matches].sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = sortedMatches.map(match => {
        const home = state.teams.find(t => t.id === match.homeId);
        const away = state.teams.find(t => t.id === match.awayId);
        if (!home || !away) return '';

        return `
            <div class="match-card">
                <div class="match-teams">
                    <div class="match-team">
                        <span class="team-cell">
                            ${home.name}
                        </span>
                        <span class="match-score">${match.played ? match.homeScore : '-'}</span>
                    </div>
                    <div class="match-team">
                        <span class="team-cell">
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
