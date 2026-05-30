# Estudio de Tatuajes - Plataforma de Gestión Integral

Esta plataforma es una aplicación web completa para la gestión de un estudio de tatuajes. Permite a los clientes reservar citas (con carga de imágenes de referencia), ver el portafolio de los artistas, calificar su experiencia, acumular puntos a través de un programa de fidelización y visualizar las sucursales del estudio en un mapa interactivo usando **OpenStreetMap**.

El proyecto está dividido en dos partes principales:
1. **Backend**: Desarrollado en Node.js y Express.js bajo el patrón de arquitectura **MVC (Model-View-Controller)** con una base de datos **MySQL** completamente funcional.
2. **Frontend**: Desarrollado en **React** con **Vite**, configurado como una base de interfaz premium y responsiva que interactúa con la API del backend.

---

## Características Principales

- **Gestión de Sucursales**: Mapeo geográfico de las ubicaciones físicas utilizando OpenStreetMap (Leaflet).
- **Control de Usuarios**: Registro, autenticación mediante JWT, roles diferenciados (`admin`, `artista`, `cliente`).
- **Portafolio de Diseños**: Exposición de obras de artistas con filtros por estilo, likes y visibilidad configurable.
- **Sistema de Reservas y Sesiones**: Agendamiento completo de citas con estados (`pendiente`, `confirmada`, `cancelada`, `finalizada`), sesiones detalladas y subida de imágenes a **Cloudinary**.
- **Pasarela de Pagos Simulada**: Registro de transacciones con subida de comprobantes digitales.
- **Comunidad y Red Social**: Publicación de tatuajes terminados, votaciones (likes/dislikes) y reseñas con puntuación de 1 a 5.
- **Programa de Fidelización**: Acumulación automática de puntos por compras/reseñas y asignación automática de niveles de cliente (`Bronce`, `Plata`, `Oro`, `Diamante`).

---

## Estructura del Proyecto

```
/ (Raíz del proyecto)
├── .gitignore             # Reglas de exclusión para Git (ignora node_modules, .env, etc.)
├── README.md              # Documentación general del proyecto (este archivo)
├── backend/               # Servidor de API, lógica MVC y base de datos
│   ├── .env.example       # Plantilla de variables de entorno (incluye Cloudinary)
│   ├── package.json       # Dependencias y scripts del Backend
│   ├── server.js          # Punto de entrada principal de la API
│   ├── config/            # Configuraciones de base de datos y Cloudinary
│   ├── controllers/       # Controladores (Lógica de negocio)
│   ├── middlewares/       # Validadores, autenticación JWT y Multer
│   ├── models/            # Modelos de base de datos (Consultas SQL parametrizadas)
│   ├── routes/            # Rutas de la API de Express
│   └── seed.js            # Script para crear la estructura de base de datos e insertar datos semilla
└── frontend/              # Interfaz de usuario con React
    ├── package.json       # Dependencias y scripts del Frontend
    ├── vite.config.js     # Configuración del empaquetador Vite
    ├── index.html         # Archivo raíz HTML
    └── src/               # Código fuente de React (Componentes, Páginas, CSS, etc.)
```

---

## Requisitos Previos

- **Node.js** (versión 16 o superior)
- **MySQL** (servidor local corriendo)
- **Cuenta de Cloudinary** (para almacenar fotos del portafolio, referencias y comprobantes de pago)

---

## Instrucciones de Configuración y Ejecución

### 1. Configuración del Backend

1. Navega al directorio del backend:
   ```bash
   cd backend
   ```

2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` a partir de `.env.example`:
   ```bash
   copy .env.example .env
   ```

4. Edita el archivo `.env` con las credenciales de tu base de datos MySQL local y tus credenciales de Cloudinary:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=tu_usuario_mysql
   DB_PASSWORD=tu_contrasena_mysql
   DB_NAME=estudio_tatuajes
   DB_PORT=3306
   JWT_SECRET=tu_clave_secreta_super_segura

   CLOUDINARY_CLOUD_NAME=dthwmgxst
   CLOUDINARY_API_KEY=546741614977477
   CLOUDINARY_API_SECRET=34CDpoyAMwaobJsgLLkh1p3X3k8
   ```

5. **Crear e Inicializar la Base de Datos**:
   Asegúrate de que tu servidor MySQL esté encendido. Puedes ejecutar el script semilla para crear automáticamente la base de datos `estudio_tatuajes`, crear todas las tablas definidas e insertar datos iniciales de prueba (sucursales, especialidades, usuarios administradores/artistas/clientes, y diseños):
   ```bash
   node seed.js
   ```

6. Inicia el servidor del backend en modo desarrollo:
   ```bash
   npm run dev
   ```
   El servidor estará corriendo en `http://localhost:5000`.

---

### 2. Configuración del Frontend

1. Navega al directorio del frontend:
   ```bash
   cd ../frontend
   ```

2. Instala las dependencias del frontend:
   ```bash
   npm install
   ```

3. Inicia la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```
   La aplicación React estará disponible en tu navegador en `http://localhost:5173`.

---

## Modelos y Lógica del Sistema (Backend MVC)

El backend implementa de manera completa y funcional:
- **Modelos SQL**: Consultas con marcadores de posición (`?`) para evitar inyecciones SQL en tablas clave como `usuarios`, `reservas`, `pagos`, etc.
- **Relaciones Complejas**: Inserción en tablas pivote como `usuario_especialidad`, manejo de cascadas en eliminaciones y registros de transacciones.
- **Middlewares**: Autenticación JWT (`verifyToken`) y control de accesos basados en roles (`isAdmin`, `isArtist`). Integración con `multer` y el SDK de Cloudinary en `uploadImage` para procesamiento en la nube.
- **Lógica de Fidelización**: Cada pago completado en `pagos` se procesa y automáticamente acumula puntos en `niveles_clientes` (ej: 1 punto por cada $10 gastados), actualizando el nivel del cliente (`Bronce` -> `Plata` -> `Oro` -> `Diamante`) de acuerdo a sus puntos acumulados.

---

## Frontend Base con React

El frontend proporciona una interfaz interactiva de alta gama adaptada para computadoras y móviles:
- **Leaflet & OpenStreetMap**: Implementación interactiva en `src/components/Map.jsx` que carga las sucursales registradas directamente de la API del backend, dibujando pines geográficos sobre mapas públicos y sin requerir APIs propietarias de pago.
- **Dashboards Personalizados**:
  - **Cliente**: Visualización de su nivel de cliente y puntos acumulados, historial de puntos, listado de reservas con sus sesiones asociadas y formulario interactivo de reservas y carga de pagos.
  - **Artista**: Gestión de su portafolio (creación de nuevos diseños subiendo fotos reales) y actualización del estado de las reservas asignadas.
  - **Administrador**: Gestión general de sucursales, visualización de estadísticas globales y promoción de usuarios a roles de artista/admin.
- **Diseño Estético Oscuro**: Aplicación de degradados modernos, sombras neon y componentes translúcidos tipo "glassmorphism" en `src/index.css`.
