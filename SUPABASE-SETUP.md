# Configurar Supabase - Guía Paso a Paso

## ¿Por qué Supabase?
- ✅ Panel admin funcionará
- ✅ Sincronización automática entre dispositivos
- ✅ Más confiable que Firebase
- ✅ Gratis hasta 500MB

## Paso 1: Crear Cuenta (2 minutos)

1. Ve a: https://supabase.com
2. Clic en **"Start your project"**
3. Regístrate con email o GitHub
4. Verifica tu email

## Paso 2: Crear Proyecto (2 minutos)

1. Clic en **"New project"**
2. Configuración:
   - **Name**: `efil-2025`
   - **Database Password**: (crea una y guárdala)
   - **Region**: `South America (São Paulo)`
3. Clic en **"Create new project"**
4. Espera 1-2 minutos mientras se crea

## Paso 3: Crear Tabla (3 minutos)

1. En el menú izquierdo: **Table Editor**
2. Clic en **"Create a new table"**
3. Configuración:
   - **Name**: `matches`
   - **Enable Row Level Security**: ❌ Desactivar (por ahora)
4. Columnas (agregar una por una):
   ```
   id          | int8      | Primary Key, Auto-increment ✅
   team1       | text      | 
   team2       | text      |
   group       | text      |
   date        | text      |
   time        | text      |
   score1      | int4      | Nullable ✅
   score2      | int4      | Nullable ✅
   created_at  | timestamp | Default: now() ✅
   ```
5. Clic en **"Save"**

## Paso 4: Obtener Credenciales

1. Menú izquierdo: **⚙️ Project Settings**
2. Clic en **"API"**
3. Copia estos valores:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: (clave larga)

## Paso 5: Enviarme las Credenciales

Pégame aquí:
1. Project URL
2. anon public key

Yo modificaré la app para usar Supabase y subiré los 36 partidos automáticamente.

## Después de la Configuración

Una vez que me des las credenciales:
- ✅ Panel admin funcionará para editar resultados
- ✅ Cambios se verán en todos los dispositivos instantáneamente
- ✅ Podrás agregar/editar/eliminar partidos desde la app
