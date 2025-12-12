const fs = require('fs');

const SUPABASE_URL = 'https://ptainvpdikcsagwusdjb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0YWludnBkaWtjc2Fnd3VzZGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTk2MDQsImV4cCI6MjA4MDc5NTYwNH0.FCvdDLf-TyGLRWjExyQqoJ_7vX6zj9X9dUwYpYn52Wo';

async function backup() {
    console.log("⏳ Conectando a Supabase desde Node.js...");
    try {
        const headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        };

        // 1. Matches
        console.log("   Descargando partidos...");
        const resMatches = await fetch(`${SUPABASE_URL}/rest/v1/matches?select=*&order=id.asc`, { headers });

        if (!resMatches.ok) {
            const text = await resMatches.text();
            throw new Error(`Error descargando partidos: ${resMatches.status} - ${text}`);
        }

        const matches = await resMatches.json();
        console.log(`✅ Partidos encontrados: ${matches.length}`);

        // 2. Cups
        console.log("   Descargando copas...");
        let cups = [];
        try {
            const resCups = await fetch(`${SUPABASE_URL}/rest/v1/cups?select=*`, { headers });
            if (resCups.ok) {
                cups = await resCups.json();
                console.log(`✅ Copas encontradas: ${cups.length}`);
            } else {
                console.log(`⚠️ Tabla de copas parece no existir aún o estar vacía (${resCups.status}).`);
            }
        } catch (err) {
            console.warn("   (Saltando copas por error de conexión)");
        }

        // Save
        const data = { timestamp: new Date().toISOString(), matches, cups };
        const filename = `backup-efil-${Date.now()}.json`;

        fs.writeFileSync(filename, JSON.stringify(data, null, 2));

        console.log(`\n🎉 ¡RESPALDO EXITOSO!`);
        console.log(`📂 Archivo guardado: ${process.cwd()}\\${filename}`);

    } catch (e) {
        console.error("\n❌ Error grave:", e.message);
    }
}

backup();
