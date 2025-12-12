// APP STARTING - SUPABASE MODE
console.log("APP STARTING - SUPABASE MODE...");
// alert("App cargada correctamente (Final Fix v2)!");

// CONFIGURATION - Supabase
const SUPABASE_URL = 'https://ptainvpdikcsagwusdjb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0YWludnBkaWtjc2Fnd3VzZGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTk2MDQsImV4cCI6MjA4MDc5NTYwNH0.FCvdDLf-TyGLRWjExyQqoJ_7vX6zj9X9dUwYpYn52Wo';

// ERROR LOGGING DISPLAY (Optional - can be hidden after testing)
const debugDiv = document.createElement('div');
debugDiv.style.cssText = "position:fixed;bottom:10px;right:10px;width:300px;background:rgba(0,0,0,0.9);color:#0f0;max-height:400px;overflow:auto;z-index:9999;font-family:monospace;font-size:11px;padding:10px;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,0.5);display:none;";
debugDiv.id = 'debug-console';
debugDiv.innerHTML = '<strong>DATA DEBUGGER</strong><hr style="border-color:#333;margin:5px 0">';
// document.body.appendChild(debugDiv);

function updateDebugStatus(colName, count, sample) {
    // debugDiv.style.display = 'block'; (DISABLED)
    // ... logic remains but invisible ...
}

function logError(msg, err) {
    // debugDiv.style.display = 'block'; (DISABLED)
    console.error(msg, err);
    // debugDiv.innerHTML += ... 
}
function logSuccess(msg) {
    console.log(msg);
    // updateDebugStatus('STATUS', '✅', msg);
}

// State Management
const state = {
    teams: [],
    matches: [],
    alerts: [],
    groups: [],
    cups: [],
    adminPass: 'efil2025',
    isAuthenticated: sessionStorage.getItem('efil_auth') === 'true'
};
window.efilState = state;

// Initialize Supabase Client
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// DATA LOADING - Supabase Mode
async function loadDataFromSupabase() {
    if (!supabase) {
        logError('Supabase client not initialized');
        return;
    }

    updateDebugStatus('SUPABASE', 'Connecting...', null);

    // 1. Initial Fetch
    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        logError('Error fetching from Supabase', error);
        return;
    }

    if (data) {
        processData({ matches: data }); // processData expects an object with matches
        updateDebugStatus('SUPABASE', 'Loaded', `${data.length} matches`);
    }

    // 2. Real-time Subscription
    supabase
        .channel('public:matches')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, payload => {
            console.log('Real-time update:', payload);
            updateDebugStatus('REALTIME', payload.eventType, payload.new);

            // Reload all data to be safe (simple approach) or update state directly
            // For simplicity/safety, we'll re-fetch or patch the state.
            // Let's re-fetch for now to ensure consistency
            loadDataFromSupabase();
        })
        .subscribe();

    // 3. Load Cups
    loadCupsFromSupabase();
}

async function loadCupsFromSupabase() {
    if (!supabase) return;
    const { data, error } = await supabase.from('cups').select('*').order('created_at', { ascending: false });
    if (data) {
        state.cups = data;
        updateDebugStatus('CUPS', data.length, data);
        renderAll(); // Rerender to show cups
    }

    // Real-time Subscription Cups
    supabase
        .channel('public:cups')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cups' }, payload => {
            console.log('Real-time update cups:', payload);
            loadCupsFromSupabase();
        })
        .subscribe();
}

// Helper to save match result
async function saveMatchToSupabase(matchId, s1, s2) {
    if (!supabase) return;

    // Find the original ID from state
    const match = state.matches.find(m => m.id === matchId);
    if (!match || !match.originalData || !match.originalData.id) {
        logError('Cannot find original ID for match ' + matchId);
        return;
    }

    const realId = match.originalData.id;
    updateDebugStatus('SAVING', 'Updating...', `ID: ${realId} -> ${s1}-${s2}`);

    const { error } = await supabase
        .from('matches')
        .update({ score1: s1 === '' ? null : parseInt(s1), score2: s2 === '' ? null : parseInt(s2) })
        .eq('id', realId);

    if (error) {
        logError('Error saving match', error);
        alert('Error al guardar: ' + error.message);
    } else {
        updateDebugStatus('SAVING', 'Success', null);
    }
}

function processData(data) {
    // Convert matches object to array
    const matchesObj = data.matches || {};
    const matchesArray = Array.isArray(matchesObj) ? matchesObj : Object.values(matchesObj);

    updateDebugStatus('RAW_MATCHES', matchesArray.length, matchesArray[0]);

    // Map to app format
    state.matches = matchesArray.map((m, i) => ({
        id: `match_${i + 1}`, // Internal ID for UI
        homeId: m.team1 || '?',
        awayId: m.team2 || '?',
        homeScore: m.score1,
        awayScore: m.score2,
        date: m.date ? (m.date.includes('T') ? m.date : `${m.date}T${m.time || '00:00'}`) : null,
        matchday: 1, // Logic to determine matchday needed if column missing
        played: (m.score1 !== null && m.score1 !== undefined && m.score1 !== ''),
        groupId: m.group,
        originalData: m // Contains 'id' from Supabase
    }));

    updateDebugStatus('parsed_matches', state.matches.length, state.matches[0]);

    // Derive teams and groups from matches
    deriveTeamsAndGroups();

    // Render everything
    renderAll();
}

function deriveTeamsAndGroups() {
    const uniqueTeams = new Set();
    const teamGroups = {};

    state.matches.forEach(m => {
        if (m.homeId && m.homeId !== '?') { uniqueTeams.add(m.homeId); teamGroups[m.homeId] = m.groupId; }
        if (m.awayId && m.awayId !== '?') { uniqueTeams.add(m.awayId); teamGroups[m.awayId] = m.groupId; }
    });

    state.teams = Array.from(uniqueTeams).map(name => ({
        id: name,
        name: name,
        groupId: teamGroups[name] || ''
    }));

    const uniqueGroups = new Set(Object.values(teamGroups).filter(g => g));
    state.groups = Array.from(uniqueGroups).sort().map(g => ({
        id: g,
        name: `Zona ${g}`
    }));

    updateDebugStatus('parsed_teams', state.teams.length, null);
}

// Load data from Supabase
loadDataFromSupabase();

// RENDER ALL
function renderAll() {
    try {
        renderAdminPanel();
        renderAlerts();

        // Refresh active views
        const active = document.querySelector('.view.active');
        if (active) {
            if (active.id === 'matches') renderMatches();
            if (active.id === 'standings') renderStandings();
            if (active.id === 'copas') renderCups();
        }
    } catch (e) {
        console.error("Render Error", e);
    }
}

function renderCups() {
    const container = document.getElementById('copas-container');
    if (!container) return;

    if (!state.cups || !state.cups.length) {
        container.innerHTML = '<p>No hay copas creadas.</p>';
        return;
    }

    container.innerHTML = state.cups.map(cup => {
        // Filter matches for this cup
        const cupMatches = state.matches.filter(m => {
            return m.originalData && m.originalData.cup_id === cup.id;
        });

        const matchesHtml = cupMatches.length ? cupMatches.map(m => {
            const h = state.teams.find(t => t.id === m.homeId);
            const a = state.teams.find(t => t.id === m.awayId);
            if (!h || !a) return '';

            // Format Date
            let dateStr = 'A confirmar';
            if (m.date) {
                const dateObj = new Date(m.date);
                if (!isNaN(dateObj.getTime())) {
                    dateStr = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                }
            }

            // Instance Label (e.g. Semifinal)
            const instanceLabel = (m.originalData && m.originalData.cup_instance)
                ? `<div style="font-size:0.8em;text-transform:uppercase;color:#00adef;margin-bottom:4px;font-weight:bold;">${m.originalData.cup_instance}</div>`
                : '';

            return `
            <div style="border-top:1px solid #eee; padding: 10px 0; display:flex; justify-content:space-between; align-items:center;">
                <div style="flex:1;">
                    ${instanceLabel}
                    <div style="font-weight:bold; font-size: 1.1em;">${h.name} <span style="background:#333;color:white;padding:2px 6px;border-radius:4px;margin:0 5px;">${m.played ? m.homeScore : '-'}</span></div>
                    <div style="font-weight:bold; font-size: 1.1em;">${a.name} <span style="background:#333;color:white;padding:2px 6px;border-radius:4px;margin:0 5px;">${m.played ? m.awayScore : '-'}</span></div>
                </div>
                <div style="text-align:right; font-size:0.9em; color:#666;">
                    <div>${dateStr}</div>
                    ${m.played ? '<span style="color:green">Finalizado</span>' : '<span style="color:#e67e22">Programado</span>'}
                </div>
            </div>
            `;
        }).join('') : '<p style="color:#888;font-style:italic">No hay partidos programados.</p>';

        return `
        <div class="cup-card" style="background:#fff;padding:15px;margin:10px 0;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,0.1)">
            <h3 style="margin:0 0 10px 0;display:flex;justify-content:space-between;border-bottom:2px solid #00adef;padding-bottom:5px;">
                ${cup.name}
                <button onclick="deleteCup('${cup.id}')" style="background:red;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;font-size:0.7em;">Eliminar Copa</button>
            </h3>
            <div class="cup-matches-list">
                ${matchesHtml}
            </div>
        </div>
    `;
    }).join('');
}

// RENDER HELPERS (IDENTICAL LOGIC, JUST SAFETY WRAPPERS)
function renderAlerts() {
    const c = document.getElementById('alerts-container');
    if (!c) return;
    c.innerHTML = state.alerts.length ? state.alerts.map(a =>
        `<div class="alert-card"><span><strong>IMPORTANTE:</strong> ${a.message}</span></div>`
    ).join('') : '';
}

function renderAdminPanel() {
    const tGroup = document.getElementById('team-group');
    if (tGroup) tGroup.innerHTML = '<option value="">Sin Grupo</option>' + state.groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');

    const gList = document.getElementById('admin-groups-list');
    if (gList) gList.innerHTML = state.groups.map(g => `
        <li style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #ddd;">
            <span>${g.name}</span>
            <div>
                <button onclick="editGroup('${g.id}')">✎</button>
                <button onclick="deleteGroup('${g.id}')">✕</button>
            </div>
        </li>`).join('');

    const opts = state.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    const hSelect = document.getElementById('match-home');
    const aSelect = document.getElementById('match-away');
    if (hSelect) hSelect.innerHTML = '<option value="">Local</option>' + opts;
    if (hSelect) hSelect.innerHTML = '<option value="">Local</option>' + opts;
    if (aSelect) aSelect.innerHTML = '<option value="">Visitante</option>' + opts;

    if (state.cups) {
        const cSelect = document.getElementById('match-cup');
        if (cSelect) {
            cSelect.innerHTML = '<option value="">Ninguna (Liga)</option>' +
                state.cups.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }
    }

    const tList = document.getElementById('admin-teams-list');
    if (tList) tList.innerHTML = state.teams.map(t => `
        <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #ddd;">
             <span>${t.name} <small>(${state.groups.find(g => g.id === t.groupId)?.name || '-'})</small></span>
             <div><button onclick="editTeam('${t.id}')">✎</button><button onclick="deleteTeam('${t.id}')">✕</button></div>
        </div>`).join('');

    const mList = document.getElementById('admin-matches-list');
    if (mList) mList.innerHTML = state.matches.map(m => {
        const h = state.teams.find(t => t.id === m.homeId);
        const a = state.teams.find(t => t.id === m.awayId);
        if (!h || !a) return '';
        return `
        <div class="admin-match-row">
            <div>(F${m.matchday || 1}) ${h.name} vs ${a.name}</div>
            <div class="admin-match-controls">
                <input type="number" placeholder="L" value="${m.homeScore ?? ''}" style="width:40px" onchange="updateMatchResult('${m.id}',this.value,this.nextElementSibling.value)">
                <input type="number" placeholder="V" value="${m.awayScore ?? ''}" style="width:40px" onchange="updateMatchResult('${m.id}',this.previousElementSibling.value,this.value)">
                <button onclick="deleteMatch('${m.id}')">✕</button>
            </div>
        </div>`;
    }).join('');
}

// MATCHDAY LOGIC
function getMatchdays(matches) {
    const days = [...new Set(matches.map(m => m.matchday || 1))].sort((a, b) => a - b);
    return days.length > 0 ? days : [1];
}
let activeMatchdayTab = 1;

function renderMatches() {
    const c = document.getElementById('matches-list');
    if (!c) return;
    if (state.matches.length === 0) { c.innerHTML = '<p>No hay partidos.</p>'; return; }

    const days = getMatchdays(state.matches);
    if (!days.includes(activeMatchdayTab)) activeMatchdayTab = days[0];

    // Tabs
    let html = `<div style="overflow-x:auto;white-space:nowrap;margin-bottom:1em;">
        ${days.map(d => `
            <button onclick="activeMatchdayTab=${d};renderMatches()" 
            class="btn ${activeMatchdayTab === d ? 'btn-primary' : 'btn-outline'}" 
            style="margin-right:5px;">Fecha ${d}</button>
        `).join('')}
    </div>`;

    const currentMatches = state.matches.filter(m => (m.matchday || 1) === activeMatchdayTab);
    html += currentMatches.map(m => {
        const h = state.teams.find(t => t.id === m.homeId);
        const a = state.teams.find(t => t.id === m.awayId);
        if (!h || !a) return '';
        return `
        <div class="match-card">
            <div class="match-teams">
                <div class="match-team"><span>${h.name}</span><span class="match-score">${m.played ? m.homeScore : '-'}</span></div>
                <div class="match-team"><span>${a.name}</span><span class="match-score">${m.played ? m.awayScore : '-'}</span></div>
            </div>
            <div class="match-meta">${m.played ? 'Finalizado' : 'Fecha ' + m.matchday}</div>
        </div>`;
    }).join('');
    c.innerHTML = html;
}

function renderStandings() {
    const c = document.getElementById('standings-container');
    if (!c) return;
    c.innerHTML = '';

    const stats = {};
    state.teams.forEach(t => stats[t.id] = { ...t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 });

    state.matches.forEach(m => {
        if (!m.played || !stats[m.homeId] || !stats[m.awayId]) return;
        const h = stats[m.homeId];
        const a = stats[m.awayId];
        h.played++; a.played++;
        h.gf += m.homeScore; h.ga += m.awayScore;
        a.gf += m.awayScore; a.ga += m.homeScore;
        if (m.homeScore > m.awayScore) { h.won++; h.pts += 3; a.lost++; }
        else if (m.homeScore < m.awayScore) { a.won++; a.pts += 3; h.lost++; }
        else { h.drawn++; h.pts++; a.drawn++; a.pts++; }
    });

    // Render logic same as before (simplified for brevity)
    const renderTable = (name, list) => {
        const sorted = list.sort((a, b) => (b.pts - a.pts) || ((b.gf - b.ga) - (a.gf - a.ga)));
        return `<h3>${name}</h3>
        <table class="standings-table">
            <thead><tr><th>Pos</th><th>Eq</th><th>Pts</th><th>PJ</th><th>DG</th></tr></thead>
            <tbody>${sorted.map((t, i) => `
                <tr><td>${i + 1}</td><td>${t.name}</td><td><strong>${t.pts}</strong></td><td>${t.played}</td><td>${t.gf - t.ga}</td></tr>
            `).join('')}</tbody>
        </table>`;
    };

    if (state.groups.length) {
        state.groups.forEach(g => {
            const list = Object.values(stats).filter(t => t.groupId === g.id);
            if (list.length) c.innerHTML += renderTable(g.name, list);
        });
    } else {
        c.innerHTML = renderTable('General', Object.values(stats));
    }
}


// ACTIONS (WINDOW EXPORTS)
// Using db.collection('x').add() etc.

// ACTIONS (WINDOW EXPORTS) - Supabase Versions

window.addTeam = async (name, groupId) => {
    alert("Admin: Agregar equipo no implementado en Supabase aún.");
};

window.deleteTeam = async (id) => {
    alert("Admin: Borrar equipo no implementado en Supabase aún.");
};

window.addMatch = async (h, a, dFull, md, cupId, instance) => {
    if (!supabase) return;

    let d = dFull;
    let t = null;
    if (dFull && dFull.includes('T')) {
        [d, t] = dFull.split('T');
    }

    const matchData = {
        team1: h, team2: a, date: d, time: t, group: '?', score1: null, score2: null,
        cup_id: cupId || null,
        cup_instance: instance || null
    };
    // Include matchday only if it's NOT a cup match (or if you want matchdays in cups too)
    // For now, we save it as is.

    const { error } = await supabase.from('matches').insert(matchData);
    if (error) logError("Error adding match", error);
    else { alert('Partido agregado'); loadDataFromSupabase(); }
};

window.deleteMatch = async (id) => {
    if (!confirm('Borrar?')) return;
    const m = state.matches.find(x => x.id === id);
    if (!m || !m.originalData || !m.originalData.id) return;

    const { error } = await supabase.from('matches').delete().eq('id', m.originalData.id);
    if (error) logError(error);
    else { loadDataFromSupabase(); }
};

window.updateMatchResult = async (id, h, a) => {
    await saveMatchToSupabase(id, h, a);
};

window.createCup = async (name) => {
    console.log("createCup called with:", name);
    if (!name) { alert("Escribe un nombre para la copa"); return; }

    if (!supabase) { alert("Error: Supabase no está conectado"); return; }

    const { error } = await supabase.from('cups').insert({ name });
    if (error) {
        logError("Error adding cup", error);
        alert('Error: ' + error.message);
    } else {
        alert('Copa creada!');
        loadCupsFromSupabase();
    }
};

window.deleteCup = async (id) => {
    if (!confirm('¿Seguro de borrar esta copa?')) return;
    const { error } = await supabase.from('cups').delete().eq('id', id);
    if (error) { alert('Error: ' + error.message); }
    else { loadCupsFromSupabase(); }
};

// HANDLERS
// HANDLERS
document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('add-cup-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('cup-name').value;
        window.createCup(name);
        e.target.reset();
    });

    const addMatchForm = document.getElementById('add-match-form');
    if (addMatchForm) {
        addMatchForm.onsubmit = (e) => {
            e.preventDefault();
            const h = document.getElementById('match-home').value;
            const a = document.getElementById('match-away').value;
            const d = document.getElementById('match-date').value;
            const md = document.getElementById('match-day').value;
            const cupId = document.getElementById('match-cup').value;
            const instance = document.getElementById('match-instance').value; // Get Instance
            window.addMatch(h, a, d, md, cupId, instance);
            e.target.reset();
        };
    }

    const addTeamForm = document.getElementById('add-team-form');
    if (addTeamForm) {
        addTeamForm.onsubmit = (e) => {
            e.preventDefault();
            window.addTeam(document.getElementById('team-name').value, document.getElementById('team-group').value);
            e.target.reset();
        };
    }
    // Add other handlers similarly...

    // Auth
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            console.log("Login submitted");
            const u = document.getElementById('admin-user').value;
            const p = document.getElementById('admin-pass').value;

            if (u === 'admin' && p === state.adminPass) {
                alert("Login correcto");
                state.isAuthenticated = true;
                sessionStorage.setItem('efil_auth', 'true');
                navigateTo('admin-dashboard');
            } else {
                alert("Usuario o contraseña incorrectos");
            }
        };
    }

    // Initial Render
    renderAll();
});

function navigateTo(id) {
    // Auth check for admin route
    if (id === 'admin') {
        if (state.isAuthenticated || sessionStorage.getItem('efil_auth') === 'true') {
            id = 'admin-dashboard';
        } else {
            id = 'admin-login';
        }
    }

    // Update active state in Top Nav
    document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('onclick')?.includes(`'${id}'`)) a.classList.add('active');
    });

    // Update active state in Bottom Nav
    document.querySelectorAll('.bottom-nav .nav-item').forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('onclick')?.includes(`'${id}'`)) a.classList.add('active');
    });

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('active');
        renderAll();
    } else {
        console.error("View not found:", id);
    }
}
window.navigateTo = navigateTo;
window.renderMatches = renderMatches;

// Backup Function
window.downloadLocalBackup = () => {
    console.log("Starting backup...");
    alert("Iniciando copia de seguridad...");

    try {
        const backup = {
            timestamp: new Date().toISOString(),
            matches: state.matches,
            cups: state.cups || [],
            teams: state.teams,
            groups: state.groups,
            localStorage: {
                cache: localStorage.getItem('efil_data_cache'),
                timestamp: localStorage.getItem('efil_data_timestamp')
            }
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "EFIL_BACKUP_" + Date.now() + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    } catch (e) {
        console.error(e);
        alert("Error: " + e.message);
    }
};

// Initial Render (Handled in DOMContentLoaded)

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.toggle('active');
    }
}
window.toggleMobileMenu = toggleMobileMenu;

// Close mobile menu when clicking on a link
// Navigation Logic
// Obsolete nav listener removed
// End DOMContentLoaded logic
// (Functions are now global)
