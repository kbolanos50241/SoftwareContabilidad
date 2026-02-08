# Software Contabilidad

Software de contabilidad con arquitectura desacoplada: backend en C# (Web API) y frontend en JavaScript vanilla, comunicados vía API REST y CORS.

## Repositorio

- **GitHub:** [https://github.com/kbolanos50241/SoftwareContabilidad](https://github.com/kbolanos50241/SoftwareContabilidad.git)

## Estructura del proyecto

```
SoftwareContable/
├── backend/           # API REST en C# (.NET Web API)
├── frontend/          # Interfaz en JavaScript (HTML, CSS, JS)
│   ├── css/
│   ├── js/
│   └── index.html
├── docs/              # Documentación
└── README.md
```

## Requisitos

- **Backend:** [.NET 9 SDK](https://dotnet.microsoft.com/download)
- **Frontend:** Navegador web moderno (Chrome, Firefox, Edge)

## Cómo ejecutar el proyecto

### Opción 1: Dos terminales (recomendado)

**Terminal 1 – Backend (API):**
```bash
cd backend
dotnet run
```
Espera a que aparezca: *"Now listening on: http://localhost:5222"*

**Terminal 2 – Frontend:**
Sirve la carpeta `frontend` con un servidor local. Opciones:

- **Live Server (VS Code):** Click derecho en `frontend/index.html` → "Open with Live Server"
- **Python:** `cd frontend` y luego `python -m http.server 5500`
- **Node.js (npx):** `npx serve frontend -p 5500`

Luego abre en el navegador: **http://localhost:5500**

### Puertos usados

| Componente | Puerto | URL |
|------------|--------|-----|
| Backend (API) | 5222 | http://localhost:5222 |
| Frontend | 5500 | http://localhost:5500 |

**Importante:** El frontend debe servirse por HTTP (no abrir `file://`) para que CORS funcione.

### CORS

El backend está configurado para aceptar peticiones desde:
- http://localhost:5500
- http://127.0.0.1:5500
- http://localhost:3000
- http://127.0.0.1:3000

Si usas otro puerto, agrega el origen en `backend/Program.cs` dentro de la política `AllowFrontend`.

## Estado del proyecto

Proyecto en fase inicial. Se irá desarrollando por partes.

## Licencia

Pendiente de definir.
