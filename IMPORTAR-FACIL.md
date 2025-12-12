# Solución Simple: Importar Datos a Supabase

## El Problema
El navegador bloquea las peticiones a Supabase cuando abres archivos HTML directamente (`file://`).

## Solución Más Simple

### Opción 1: Usar la Consola del Navegador (5 minutos)

1. **Abre Supabase en tu navegador:**
   - Ve a: https://supabase.com/dashboard/project/otainvpd4kcaapwusdjb

2. **Abre la consola del navegador:**
   - Presiona **F12**
   - Ve a la pestaña **"Console"**

3. **Copia y pega este código completo:**

```javascript
const matches = [
  {"team1":"E.F.I.L.","team2":"URIBE (VERDE)","group":"A","date":"2024-12-05","time":"16:00","score1":null,"score2":null},
  {"team1":"URIBE (AMARILLO)","team2":"MOSTRANDO CAMINOS","group":"E","date":"2024-12-05","time":"17:00","score1":null,"score2":null},
  {"team1":"MADRESELVA","team2":"PLAZA ESPAÑA (25 DE MAYO)","group":"D","date":"2024-12-05","time":"18:05","score1":null,"score2":null},
  {"team1":"RIVADAVIA","team2":"ROQUE PÉREZ","group":"F","date":"2024-12-05","time":"19:10","score1":null,"score2":null},
  {"team1":"E.F.I.N. (NAVARRO)","team2":"LA BLANQUITA (MERLO)","group":"B","date":"2024-12-05","time":"20:20","score1":null,"score2":null},
  {"team1":"SAN MARTÍN NEGRO (MONTE GRANDE)","team2":"EL PORVENIR (MERLO)","group":"A","date":"2024-12-05","time":"21:30","score1":null,"score2":null},
  {"team1":"SALGADO","team2":"PROVINCIAL","group":"B","date":"2024-12-05","time":"22:40","score1":null,"score2":null},
  {"team1":"C.F.C. (BLANCO)","team2":"LA BLANQUITA (MERLO)","group":"C","date":"2024-12-06","time":"16:50","score1":null,"score2":null},
  {"team1":"E.F.I.L.","team2":"EL PORVENIR (MERLO)","group":"A","date":"2024-12-06","time":"18:00","score1":null,"score2":null},
  {"team1":"MADRESELVA","team2":"DORREGO","group":"D","date":"2024-12-06","time":"19:10","score1":null,"score2":null},
  {"team1":"CAÑUELA F.C. (ROJO)","team2":"FERRO (LAS FLORES)","group":"E","date":"2024-12-06","time":"20:20","score1":null,"score2":null},
  {"team1":"TRISTÁN SUÁREZ","team2":"REAL STFC RC","group":"F","date":"2024-12-06","time":"21:30","score1":null,"score2":null},
  {"team1":"URIBE (AMARILLO)","team2":"CAÑUELAS F.C. (ROJO)","group":"E","date":"2024-12-07","time":"12:40","score1":null,"score2":null},
  {"team1":"SAN MARTIN (MONTE GRANDE)","team2":"URIBE (VERDE)","group":"A","date":"2024-12-07","time":"13:50","score1":null,"score2":null},
  {"team1":"MOSTRANDO CAMINOS","team2":"FERRO (LAS FLORES)","group":"E","date":"2024-12-07","time":"15:00","score1":null,"score2":null},
  {"team1":"RIVADAVIA","team2":"TRISTÁN SUÁREZ","group":"F","date":"2024-12-07","time":"16:10","score1":null,"score2":null},
  {"team1":"ROQUE PÉREZ","team2":"REAL STFC RC","group":"F","date":"2024-12-07","time":"17:20","score1":null,"score2":null},
  {"team1":"ATHLETIC","team2":"CAÑUELAS F.C. (BLANCO)","group":"C","date":"2024-12-07","time":"18:30","score1":null,"score2":null},
  {"team1":"DORREGO","team2":"BANFIELD","group":"D","date":"2024-12-07","time":"19:40","score1":null,"score2":null},
  {"team1":"PROVINCIAL","team2":"DEFENSA Y JUSTICIA","group":"B","date":"2024-12-07","time":"22:30","score1":null,"score2":null},
  {"team1":"URIBE (VERDE)","team2":"EL PORVENIR (MERLO)","group":"A","date":"2024-12-08","time":"14:30","score1":null,"score2":null},
  {"team1":"ATHLETIC","team2":"LA BLANQUITA (MERLO)","group":"C","date":"2024-12-08","time":"15:40","score1":null,"score2":null},
  {"team1":"ROQUE PÉREZ","team2":"TRISTÁN SUÁREZ","group":"F","date":"2024-12-08","time":"16:50","score1":null,"score2":null},
  {"team1":"SALGADO","team2":"DEFENSA Y JUSTICIA","group":"B","date":"2024-12-08","time":"18:00","score1":null,"score2":null},
  {"team1":"E.F.I.N. (NAVARRO)","team2":"CAÑUELAS F.C. (BLANCO)","group":"C","date":"2024-12-08","time":"19:10","score1":null,"score2":null},
  {"team1":"RIVADAVIA","team2":"REAL STFC","group":"F","date":"2024-12-08","time":"20:20","score1":null,"score2":null},
  {"team1":"MADRESELVA","team2":"BANFIELD","group":"D","date":"2024-12-08","time":"21:30","score1":null,"score2":null},
  {"team1":"URIBE (AMARILLO)","team2":"FERRO (LAS FLORES)","group":"E","date":"2024-12-09","time":"14:00","score1":null,"score2":null},
  {"team1":"MOSTRANDO CAMINOS","team2":"CAÑUELAS F.C. (ROJO)","group":"E","date":"2024-12-09","time":"15:10","score1":null,"score2":null},
  {"team1":"BANFIELD","team2":"PLAZA ESPAÑA (25 DE MAYO)","group":"D","date":"2024-12-09","time":"17:20","score1":null,"score2":null},
  {"team1":"HURACÁN (SALADILLO)","team2":"DEFENSA Y JUSTICIA","group":"B","date":"2024-12-09","time":"18:25","score1":null,"score2":null},
  {"team1":"DORREGO","team2":"PLAZA ESPAÑA (25 DE MAYO)","group":"D","date":"2024-12-09","time":"19:30","score1":null,"score2":null},
  {"team1":"SALGADO","team2":"HURACÁN (SALADILLO)","group":"B","date":"2024-12-09","time":"20:40","score1":null,"score2":null},
  {"team1":"E.F.I.L.","team2":"SAN MARTÍN (MONTE GRANDE) NEGRO","group":"A","date":"2024-12-09","time":"21:50","score1":null,"score2":null},
  {"team1":"ATHLETIC","team2":"E.F.I.N. (NAVARRO)","group":"C","date":"2024-12-09","time":"23:00","score1":null,"score2":null},
  {"team1":"PROVINCIAL","team2":"HURACÁN (SALADILLO)","group":"B","date":"2024-12-10","time":"13:10","score1":null,"score2":null}
];

fetch('https://otainvpd4kcaapwusdjb.supabase.co/rest/v1/matches', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0YWludnBkaWtjc2Fnd3VzZGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTk2MDQsImV4cCI6MjA4MDc5NTYwNH0.FCvdDLf-TyGLRWjExyQqoJ_7vX6zj9X9dUwYpYn52Wo',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0YWludnBkaWtjc2Fnd3VzZGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTk2MDQsImV4cCI6MjA4MDc5NTYwNH0.FCvdDLf-TyGLRWjExyQqoJ_7vX6zj9X9dUwYpYn52Wo',
    'Prefer': 'return=minimal'
  },
  body: JSON.stringify(matches)
})
.then(r => r.ok ? console.log('✅ Importado!') : r.text().then(e => console.error('❌', e)))
.catch(e => console.error('❌', e));
```

4. **Presiona Enter**

5. **Deberías ver:** `✅ Importado!`

6. **Verifica en Supabase:**
   - Ve a Table Editor → matches
   - Deberías ver los 36 partidos

## Después de Importar

Una vez que los datos estén en Supabase, abre `index.html` y los partidos deberían aparecer automáticamente.

¿Funcionó?
