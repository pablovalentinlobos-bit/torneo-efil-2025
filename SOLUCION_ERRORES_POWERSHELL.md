# Solución: Errores de PowerShell

## Error 1: "La ejecución de scripts está deshabilitada"

### Solución:
Ejecuta PowerShell **como Administrador** y cambia la política:

1. Cierra PowerShell actual
2. Presiona **Windows + X**
3. Selecciona **"Windows PowerShell (Administrador)"** o **"Terminal (Administrador)"**
4. Ejecuta este comando:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
5. Cuando pregunte, escribe **Y** y presiona Enter

## Error 2: "UnauthorizedAccess"

Esto indica que npm se instaló pero hay problemas de permisos.

### Solución Rápida: Usar la Opción Manual

En lugar de luchar con permisos de PowerShell, **te recomiendo usar la importación manual**:

---

# 🎯 IMPORTACIÓN MANUAL (SIN COMANDOS)

## Paso 1: Abrir el archivo JSON
1. Ve a: `C:\Users\USUARIO\.gemini\antigravity\playground\pyro-spirit\backup`
2. Abre el archivo: `tournament-data-backup.json` con Bloc de notas
3. Selecciona TODO (Ctrl+A) y copia (Ctrl+C)

## Paso 2: Ir a Firebase Console
1. Abre: https://console.firebase.google.com
2. Selecciona tu proyecto "torneo-efil-2025"
3. En el menú izquierdo: **Firestore Database**

## Paso 3: Crear/Editar el documento
1. Busca la colección `efil_data`
2. Si NO existe, créala:
   - Clic en "Iniciar colección"
   - ID de colección: `efil_data`
   - ID de documento: `efil_data`
   
3. Si ya existe, haz clic en el documento `efil_data`

## Paso 4: Pegar los datos

**Opción A - Si el documento está vacío:**
1. Haz clic en "Agregar campo"
2. Para cada campo del JSON, agrégalo manualmente:
   - Campo: `matches`, Tipo: `map`
   - Campo: `teams`, Tipo: `map`
   - etc.

**Opción B - Usar la consola del navegador (MÁS RÁPIDO):**
1. En Firebase Console, presiona **F12** (abre herramientas de desarrollador)
2. Ve a la pestaña **Console**
3. Pega este código (reemplaza `TU_JSON_AQUI` con el contenido del archivo):

```javascript
// Copia el contenido de tournament-data-backup.json aquí
const data = {
  "matches": { /* ... todo el contenido ... */ },
  "teams": {},
  "groups": {},
  "config": { "tournamentName": "Torneo Nacional EFIL 2025", "adminPass": "efil2025" },
  "alerts": {}
};

// Subir a Firebase
firebase.firestore().collection('efil_data').doc('efil_data').set(data)
  .then(() => console.log('✅ Datos subidos correctamente'))
  .catch(err => console.error('❌ Error:', err));
```

---

## ¿Necesitas ayuda?

Si prefieres, puedo crear un archivo HTML simple que haga la importación desde el navegador (sin necesidad de Node.js ni PowerShell).

¿Quieres que cree ese archivo HTML?
