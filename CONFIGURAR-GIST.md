# Configurar GitHub Gist para EFIL 2025

## ¿Qué es GitHub Gist?
Un servicio gratuito de GitHub para compartir archivos JSON. Funciona como base de datos simple.

## Pasos de Configuración

### 1. Crear el Gist (2 minutos)

1. Ve a: https://gist.github.com
2. Si no tienes cuenta GitHub, crea una (gratis)
3. Crea un nuevo Gist:
   - Nombre del archivo: `efil-2025-data.json`
   - Contenido: Copia todo el contenido de `backup/tournament-data-backup.json`
   - Selecciona: **Public** (para que la app pueda leerlo)
4. Haz clic en **"Create public gist"**
5. Copia la URL del Gist (algo como: `https://gist.github.com/tu-usuario/abc123...`)

### 2. Obtener la URL Raw

1. En tu Gist, haz clic en el botón **"Raw"** (arriba a la derecha del archivo)
2. Copia la URL completa (algo como: `https://gist.githubusercontent.com/...`)
3. Pégame esa URL aquí

### 3. Yo modificaré la app

Una vez que me des la URL, modificaré `app.js` para:
- Leer datos del Gist
- Guardar cambios localmente (LocalStorage)
- Mostrar los 36 partidos

## Ventajas
- ✅ Gratis
- ✅ Sin configuración compleja
- ✅ Funciona en todos los dispositivos
- ✅ Puedes editar el Gist manualmente si necesitas
- ✅ Historial de cambios automático

## Nota
Para actualizar datos entre dispositivos, necesitarás actualizar el Gist manualmente o usar la función de "Exportar" que agregaré a la app.
