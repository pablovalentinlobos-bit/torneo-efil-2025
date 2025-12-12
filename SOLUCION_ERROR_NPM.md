# Instalación de Node.js y Ejecución del Script

## ⚠️ Problema Detectado
El error "npm no se reconoce como nombre de un cmdlet" significa que Node.js no está instalado.

## ✅ Solución: Instalar Node.js

### Paso 1: Descargar Node.js
1. Ve a: https://nodejs.org/
2. Descarga la versión **LTS** (recomendada)
3. Ejecuta el instalador
4. Sigue el asistente (deja todas las opciones por defecto)
5. **Importante:** Marca la casilla "Automatically install necessary tools"

### Paso 2: Verificar Instalación
Cierra y vuelve a abrir PowerShell, luego ejecuta:
```powershell
node --version
npm --version
```

Deberías ver algo como:
```
v20.x.x
10.x.x
```

### Paso 3: Continuar con la Importación
Una vez instalado Node.js, ejecuta:
```powershell
cd C:\Users\USUARIO\.gemini\antigravity\playground\pyro-spirit
npm install
node import-data.js
```

---

## 🔄 Alternativa: Importación Manual (SIN Node.js)

Si no quieres instalar Node.js, puedes copiar los datos manualmente a Firebase:

### Opción Manual:
1. Abre Firebase Console
2. Ve a Firestore Database
3. Haz clic en la colección `efil_data`
4. Haz clic en el documento `efil_data`
5. Haz clic en "Editar documento"
6. Copia y pega el contenido de `backup/tournament-data-backup.json`

**Archivo a copiar:** `C:\Users\USUARIO\.gemini\antigravity\playground\pyro-spirit\backup\tournament-data-backup.json`

---

## ❓ ¿Qué prefieres?

**Opción A:** Instalar Node.js (recomendado, más rápido)
**Opción B:** Copiar manualmente a Firebase (sin instalar nada)
