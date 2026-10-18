TWM-Shopping 🛒

Universidad de Los Lagos - Campus Osorno

Asignatura: Tecnologías Web y Móviles

Docente: Felipe Antonio Olivares Acuña

Plataforma Full-Stack de comercio electrónico que conecta a emprendedores con compradores, permitiendo la publicación de productos, gestión de inventario, carrito de compras y reportes analíticos.

🛠️ Tecnologías y Arquitectura (3 Capas)

Frontend (Cliente): React.js + Vite, Material UI (MUI).

Backend (API Rest): .NET 10 (C#) con Entity Framework.

Base de Datos: PostgreSQL.

Despliegue Físico: Raspberry Pi (Arquitectura Linux ARM).

📋 Requisitos Previos

Para ejecutar este proyecto de manera local, cada miembro del equipo debe tener instalado:

Node.js (Versión 18 o superior).

.NET SDK 10.0 (o la versión utilizada en el proyecto).

PostgreSQL y pgAdmin 4.

🗄️ Configuración de la Base de Datos (PostgreSQL)

Para que el proyecto funcione localmente sin errores de conexión, es obligatorio levantar la base de datos en tu propia máquina antes de correr el Backend.

Abre pgAdmin 4.

Crea una nueva base de datos vacía. (Nota: Asegúrate de que el nombre de la base de datos, tu usuario de postgres y tu contraseña coincidan exactamente con las credenciales que están en el archivo backend/TWM.API/appsettings.json).

Abre la Query Tool (Herramienta de Consultas) sobre la base de datos recién creada.

Ve a la carpeta database/ en la raíz de este repositorio y ejecuta los scripts estrictamente en el siguiente orden:

▶️ 01_create_tables.sql (Construye la estructura de la BD).

▶️ 02_inserts.sql (Puebla las tablas con datos de prueba).

▶️ 03_funciones.sql (Carga las funciones almacenadas para reportes).

▶️ 04_triggers.sql (Carga los disparadores automáticos).

🚀 Instalación y Ejecución Local

1. Backend (.NET)

Abre una terminal, navega a la carpeta de la API y ejecuta el servidor:

cd backend/TWM.API
dotnet restore
dotnet run


La API se ejecutará por defecto en http://localhost:5156 (verifica el puerto en la terminal).

2. Frontend (React)

Abre otra terminal, navega a la carpeta del frontend, instala las dependencias e inicia el entorno de desarrollo:

cd frontend
npm install
npm run dev


El frontend estará disponible en http://localhost:5173.

🔄 Flujo de Trabajo Git (Git Flow)

Para evitar sobreescribir el trabajo de los demás y mantener la rama main estable:

Siempre actualiza tu repositorio antes de empezar a programar: git pull origin main

No trabajes directamente en main. Crea una rama nueva para tu tarea: git checkout -b nombre-de-tu-tarea

Al terminar, sube tu rama: git push origin nombre-de-tu-tarea

Crea un Pull Request en GitHub para que el equipo revise el código antes de fusionarlo (Merge).