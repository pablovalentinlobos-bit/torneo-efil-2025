# Instrucciones de Importación - EFIL 2025

## ✅ Archivos Creados

1. **`backup/tournament-data-backup.json`** - Backup de 36 partidos
2. **`import-data.js`** - Script de importación a Firebase
3. **`package.json`** - Dependencias del proyecto

## 📋 Pasos para Importar

### 1. Descargar Clave de Servicio de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto "torneo-efil-2025"
3. Clic en ⚙️ **Configuración del proyecto**
4. Pestaña **Cuentas de servicio**
5. Clic en **Generar nueva clave privada**
6. Guarda el archivo como `serviceAccountKey.json` en:
   ```
   C:\Users\USUARIO\.gemini\antigravity\playground\pyro-spirit\
   ```

### 2. Instalar Dependencias

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
cd C:\Users\USUARIO\.gemini\antigravity\playground\pyro-spirit
npm install
```

### 3. Ejecutar Importación

```powershell
npm run import
```

O directamente:

```powershell
node import-data.js
```

### 4. Verificar en Firebase Console

1. Ve a Firestore Database
2. Busca: `efil_data` → `efil_data`
3. Deberías ver:
   - `matches` (con 36 partidos)
   - `teams`
   - `groups`
   - `config`
   - `alerts`

### 5. Probar la App

1. Abre la app en el navegador
2. Los partidos deberían aparecer automáticamente
3. El recuadro negro debería mostrar:
   - `ROOT_DOC: FOUND`
   - `RAW_MATCHES: 36`

## 📊 Datos Importados

- **36 partidos** del 5 al 10 de diciembre 2024
- **6 zonas**: A, B, C, D, E, F
- **Equipos únicos** extraídos automáticamente
- Todos los partidos sin resultados (score1 y score2 = null)

## ⚠️ Notas Importantes

- El archivo `serviceAccountKey.json` es **PRIVADO** - no lo compartas
- El backup está en `backup/tournament-data-backup.json`
- Puedes ejecutar el import múltiples veces (sobrescribe datos)

## 🔧 Solución de Problemas

**Error: "Cannot find module 'firebase-admin'"**
→ Ejecuta `npm install`

**Error: "serviceAccountKey.json not found"**
→ Descarga la clave desde Firebase Console (paso 1)

**Error: "Permission denied"**
→ Verifica que las reglas de Firebase permitan escritura
