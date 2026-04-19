# PRD de kraken

**TEMA:** PRD de KRAKEN

**MATERIA:**
Práctica Interna

**PRESENTADO POR:**

- Aguilera Salinas Joaquin Ignacio

- Carrillo Leonardo

- Sonco Melany

**FECHA Y LUGAR:**

- Abril, 2026

- La Paz, Bolivia

## 1. Descripción del Producto

Kraken es una plataforma web orientada a la gestión académica de las materias
Práctica Interna e Inducción Profesional de la Universidad Privada Boliviana (UPB). Su
propósito es centralizar en un solo sistema los procesos de autenticación,
administración de períodos y ofertas académicas, postulación de estudiantes,
aprobación de inscripciones, asignación de roles de trabajo, conformación de equipos y
ejecución de programas de rotación.

El proyecto responde a una necesidad concreta: reducir la dispersión operativa que
actualmente puede producirse cuando parte del seguimiento de estudiantes, cursos,
postulaciones y distribución de roles se realiza de forma manual o mediante
herramientas separadas. Kraken busca consolidar este flujo en una arquitectura web
única, con trazabilidad por usuario, control por roles y soporte para la organización de
equipos académicos de trabajo.

### 1.1 Objetivo del Sistema

- Centralizar la gestión de usuarios, perfiles, cursos, períodos académicos y
  ofertas disponibles dentro de una misma plataforma.
- Permitir que los estudiantes postulen a ofertas académicas y que los docentes
  gestionen la aprobación o rechazo de dichas postulaciones.
- Administrar la selección de roles técnicos de Práctica Interna y la conformación
  de equipos vinculados a programas de rotación.
- Proveer una base estructurada para futuras ampliaciones, como evaluación
  cruzada, exportación de resultados y gestión de tareas.

### 1.2 Contexto Académico

Las dos materias involucradas mantienen una relación operativa complementaria
dentro de la dinámica académica del proyecto:

Materia Año Rol principal Función en el
proyecto

Inducción
Profesional

3er año Student Participación en
ofertas, inscripción
y trabajo en
equipos.

Práctica Interna 4to año Student con
selección de rol

Participación en
ofertas, definición
de rol técnico y
trabajo en
programas de
rotación.

En la implementación actual del proyecto, la lógica operativa se estructura
principalmente a partir de ofertas de cursos, inscripciones, programas de rotación,
bloques temporales y equipos. Por ello, el PRD se alinea con esa base funcional y evita
describir como implementadas funcionalidades que todavía corresponden a fases
posteriores.

## 2. Objetivo

### 2.1 Objetivo General

Desarrollar una plataforma web que permita a la UPB gestionar de manera
estructurada el registro de usuarios, la administración de cursos y períodos, las
postulaciones a ofertas académicas, la asignación de roles de práctica y la
conformación de equipos dentro de un programa de rotación.

### 2.2 Objetivos Específicos

- Registrar y autenticar usuarios con control de acceso por rol global:
  administrador, docente y estudiante.
- Administrar cursos, períodos académicos y ofertas de curso disponibles para
  postulación.
- Permitir el flujo de postulación, aprobación y rechazo de inscripciones de
  estudiantes por parte del docente.
- Gestionar la selección de roles técnicos de Práctica Interna (QA, Frontend,
  Backend y DevOps) a partir de preferencias del estudiante.
- Crear programas de rotación, asociar ofertas académicas a dichos programas y
  generar equipos a partir de bloques temporales.
- Implementar un sistema de recompensas mediante wallet para apoyar dinámicas
  de seguimiento e incentivos académicos.
- Establecer una base sólida para futuras extensiones como evaluación cruzada,
  exportación de reportes y gestión de tareas.

## 3. Usuarios

### 3.1 Roles del Sistema

Kraken contempla tres roles globales de acceso y, adicionalmente, roles funcionales
que se usan dentro de equipos y programas:

Rol Descripción Permisos principales

Administrador Gestiona la plataforma a
nivel general.

Administración de
perfiles, activación o
desactivación de
usuarios, cursos,
términos y componentes
globales del sistema.

Docente Administra ofertas
académicas y revisa
postulaciones de
estudiantes.

Crear ofertas, revisar
aplicaciones, aprobar o
rechazar inscripciones y
operar programas de
rotación.

Estudiante Participa en ofertas,
equipos y programas de
rotación.

Postular a ofertas,
consultar sus cursos,
definir preferencias de rol
de práctica y participar
en equipos.

Además de los roles globales, el sistema maneja roles operativos: TeamRole (Lead o
Member) para la estructura del equipo y JobRole (QA, Frontend, Backend, DevOps)
para la especialidad técnica del estudiante.

### 3.2 Preguntas Clave sobre Usuarios

**¿Quiénes son los usuarios?**

- Administradores responsables de la configuración y mantenimiento de la
  plataforma.
- Docentes encargados de gestionar ofertas académicas, revisar postulaciones y
  operar programas de rotación.
- Estudiantes que participan en Inducción Profesional o Práctica Interna.

**¿Qué problemas resuelve para cada uno?**

- Para los administradores, centraliza la administración de perfiles, cursos y
  períodos.

- Para los docentes, ordena el flujo de creación de ofertas, revisión de
  postulaciones y organización de equipos.
- Para los estudiantes, reúne en un solo portal las ofertas disponibles, sus cursos,
  sus preferencias de rol y su participación en equipos.

## 4. Funcionalidades Principales

### 4.1 Módulo de Autenticación

- Registro de usuarios y login con autenticación JWT.
- Gestión de access token y refresh token.
- Identificación del usuario autenticado y control de acceso según rol global.
- Base preparada para una futura integración con un sistema externo de
  autenticación, sin formar parte del alcance actual.

### 4.2 Módulo Académico y de Postulaciones

- Gestión de cursos y períodos académicos.
- Creación de ofertas académicas por parte del docente.
- Consulta de ofertas disponibles por parte del estudiante.
- Postulación de estudiantes a una oferta académica.
- Revisión docente de aplicaciones, con aprobación o rechazo de inscripciones.
- Consulta de cursos y ofertas asociados al usuario actual.

### 4.3 Módulo de Equipos y Rotación

- Creación de programas de rotación vinculados al año académico.
- Asociación de ofertas académicas a un programa de rotación.
- Definición de bloques temporales dentro del programa.
- Selección de preferencias de rol técnico para estudiantes de Práctica Interna.
- Generación de equipos y previsualización o aplicación de rotaciones de juniors.
- Gestión de membresías de equipo con distinción entre líder y miembro.

### 4.4 Módulo de Recompensas

- Wallet individual por usuario.
- Registro de transacciones de monedas y diamantes.
- Asignación de recompensas a estudiantes mediante operaciones controladas.

### 4.5 Módulo de Evaluación y Gestión de Proyectos (Alcance Futuro)

- Evaluación cruzada entre integrantes del equipo.
- Consolidado de resultados por bloque o período.
- Exportación de resultados en formatos compatibles con seguimiento docente.
- Tablero de tareas tipo Kanban para gestión interna del trabajo del equipo.

## 5. Flujo del Sistema

### 5.1 Flujo Principal — Registro, Postulación y Aprobación

| #   | Paso                | Descripción                                                                |
| --- | ------------------- | -------------------------------------------------------------------------- |
| 1   | Autenticación       | El usuario se registra o inicia sesión en la plataforma.                   |
| 2   | Consulta de ofertas | El estudiante visualiza las ofertas académicas disponibles.                |
| 3   | Postulación         | El estudiante aplica a la oferta correspondiente.                          |
| 4   | Revisión docente    | El docente revisa las aplicaciones recibidas.                              |
| 5   | Decisión            | La inscripción es aprobada o rechazada según la revisión.                  |
| 6   | Seguimiento         | El estudiante consulta el estado de su inscripción y sus cursos asociados. |

#### 5.2 Flujo de Selección de Roles de Práctica

| #   | Paso                      | Descripción                                                                         |
| --- | ------------------------- | ----------------------------------------------------------------------------------- |
| 1   | Inscripción aprobada      | El estudiante cuenta con una inscripción aprobada en una oferta de práctica.        |
| 2   | Consulta de opciones      | El sistema habilita la consulta de opciones de rol técnico.                         |
| 3   | Selección de preferencias | El estudiante registra sus preferencias de rol.                                     |
| 4   | Persistencia              | El sistema almacena las preferencias y el rol primario asignado cuando corresponda. |

### 5.3 Flujo de Rotación y Generación de Equipos

| #   | Paso                          | Descripción                                                                      |
| --- | ----------------------------- | -------------------------------------------------------------------------------- |
| 1   | Creación del programa         | Se crea el programa de rotación para una gestión académica.                      |
| 2   | Asignación de ofertas         | Se vinculan las ofertas académicas al programa.                                  |
| 3   | Bloques                       | Se definen los bloques temporales del programa.                                  |
| 4   | Generación de equipos         | El sistema genera equipos a partir de la configuración del programa.             |
| 5   | Previsualización o aplicación | Se puede visualizar la rotación de juniors y luego aplicarla.                    |
| 6   | Ejecución                     | Los estudiantes participan en equipos según bloque, rol técnico y rol de equipo. |

## 6. Datos que Maneja el Sistema

### 6.1 Entidades Principales

| Entidad                    | Atributos principales                                           | Observación funcional                                |
| -------------------------- | --------------------------------------------------------------- | ---------------------------------------------------- |
| User                       | id, email, passwordHash, status, createdAt, updatedAt           | Cuenta base del sistema.                             |
| Profile                    | userId, fullName, handle, avatarUrl, role                       | Perfil público y rol global.                         |
| Wallet / WalletTransaction | balances, tipo, monto, razón, referencia                        | Sistema de recompensas e historial de transacciones. |
| Term                       | name, year, period, startsAt, endsAt                            | Períodos académicos.                                 |
| Course                     | code, name                                                      | Catálogo de cursos.                                  |
| CourseOffering             | courseId, termId, teacherId                                     | Oferta de curso en un período y con un docente.      |
| Enrollment                 | offeringId, studentId, track, status, primaryRole, prefRole1/2/ | Inscripción del estudiante y selección de rol.       |
| RotationProgram            | academicYear, name, status, targets por rol                     | Programa anual de rotación.                          |
| ProgramOffering            | programId, offeringId, type                                     | Vincula ofertas académicas con el programa.          |
| ProgramBlock               | type, order, startsAt, endsAt, role                             | Bloques temporales del programa.                     |
| ProgramLeader              | programId, userId, leaderRole, active                           | Líderes disponibles para el programa.                |
| Team                       | name, offeringId, programId, leaderBlockId, createdBy           | Equipo generado dentro del flujo académico.          |
| TeamMembership             | teamId, userId, enrollmentId, blockId, teamRole, jobRole        | Membresía del usuario en un equipo y bloque.         |

## 7. Diseño de Interfaz (UI Básica)

### 7.1 Pantallas Principales

#### Login

- Formulario de registro e inicio de sesión.
- Acceso controlado por JWT y redirección según el rol del usuario.

#### Dashboard — Docente

- Vista para revisión de postulaciones y acceso a sus ofertas.
- Acceso al flujo de aprobación o rechazo de inscripciones.
- Base para la operación del programa de rotación.

#### Dashboard — Estudiante

- Consulta de ofertas disponibles.
- Consulta de cursos del usuario y estado de sus postulaciones.
- Acceso a selección de roles de práctica cuando la inscripción ya fue aprobada.

#### Paneles en habilitación progresiva

- Perfil del usuario.
- Equipos / Rotaciones.
- Opciones administrativas específicas aún no expuestas completamente en la
  interfaz.

## 8. Conexión Frontend con Backend

### 8.1 Arquitectura General

Kraken utiliza una arquitectura cliente-servidor desacoplada:

**Arquitectura:** Frontend (SPA) → REST API (HTTPS/JSON) → Backend → PostgreSQL\*\*

El frontend consume la API del backend y la persistencia se realiza sobre una base de
datos PostgreSQL. La aplicación maneja autenticación propia con JWT y se ejecuta
localmente mediante contenedores Docker.

### 8.2 Comunicación

- El frontend consume endpoints REST mediante peticiones HTTP con payload
  JSON.
- Las rutas protegidas utilizan el header Authorization: Bearer &lt;token&gt;.
- Los permisos dependen del rol global del usuario y del contexto funcional de la
  operación.
- La separación entre frontend, backend y base de datos permite evolución
  modular del sistema.

### 8.3 Endpoints Principales (Referencia)

| Método | Endpoint                                                     | Descripción                           |
| ------ | ------------------------------------------------------------ | ------------------------------------- |
| POST   | /auth/register                                               | Registrar nuevo usuario               |
| POST   | /auth/login                                                  | Iniciar sesión                        |
| GET    | /users/me                                                    | Obtener usuario autenticado           |
| GET    | /profiles/me                                                 | Obtener perfil propio                 |
| PUT    | /profiles/me                                                 | Actualizar perfil                     |
| PUT    | /profiles/:id/activate                                       | Activar usuario                       |
| PUT    | /profiles/:id/disable                                        | Desactivar usuario                    |
| GET    | /courses                                                     | Listar cursos                         |
| POST   | /courses                                                     | Crear curso                           |
| PUT    | /courses/:id                                                 | Actualizar curso                      |
| GET    | /courses/my-courses                                          | Listar cursos del usuario             |
| GET    | /offerings/available                                         | Listar ofertas disponibles            |
| POST   | /offerings                                                   | Crear oferta                          |
| POST   | /offerings/:offeringId/apply                                 | Postular a una oferta                 |
| GET    | /offerings/:offeringId/applications                          | Ver postulaciones de una oferta       |
| GET    | /offerings/:offeringId/enrolled                              | Ver estudiantes inscritos             |
| POST   | /enrollments/:enrollmentId/approve                           | Aprobar inscripción                   |
| POST   | /enrollments/:enrollmentId/deny                              | Rechazar inscripción                  |
| GET    | /terms                                                       | Listar períodos                       |
| POST   | /terms                                                       | Crear período                         |
| PUT    | /terms/:id                                                   | Actualizar período                    |
| GET    | /me/offerings                                                | Obtener ofertas del usuario actual    |
| GET    | /enrollments/:id/practica/role-options                       | Consultar opciones de rol de práctica |
| POST   | /enrollments/:id/practica/roles                              | Guardar roles de práctica             |
| POST   | /rotation-program                                            | Crear programa de rotación            |
| GET    | /rotation-program/:id/blocks                                 | Obtener bloques del programa          |
| POST   | /rotation-programs/:id/start                                 | Iniciar programa                      |
| POST   | /rotation-programs/:programId/blocks/:blockId/generate-teams | Generar equipos                       |
| GET    | /rotation-programs/:programId/juniors/rotation-preview       | Previsualizar rotación                |
| POST   | /rotation-programs/:programId/juniors/rotation-apply         | Aplicar rotación                      |
| POST   | /program-offerings/:programId/assign                         | Asignar oferta a programa             |
| POST   | /wallet/students/:id/award                                   | Recompensar estudiante                |

## 9. Tecnologías

### 9.1 Stack Tecnológico

| Capa                 | Tecnología                      | Uso principal                                                                  |
| -------------------- | ------------------------------- | ------------------------------------------------------------------------------ |
| Frontend             | React + TypeScript + Ant Design | Interfaz de usuario, dashboards, vistas y formularios.                         |
| Backend              | NestJS + TypeScript             | API REST, autenticación, lógica de negocio y acceso a datos.                   |
| Base de datos        | PostgreSQL                      | Persistencia de usuarios, ofertas, inscripciones, programas, equipos y wallet. |
| ORM                  | Prisma                          | Modelado de entidades, relaciones y migraciones.                               |
| Contenerización      | Docker + Docker Compose         | Entorno local reproducible.                                                    |
| Control de versiones | Git                             | Trabajo colaborativo por ramas y pull requests.                                |

El uso predominante de TypeScript favorece la consistencia entre frontend y backend,
el tipado fuerte y una base de código homogénea para el equipo de desarrollo.

### 9.2 Infraestructura y Entorno de Desarrollo

- El proyecto se levanta en entorno local con Docker Compose.
- Los servicios principales son frontend, backend y base de datos PostgreSQL.
- Las variables sensibles se gestionan en un archivo .env local no versionado.
- El entorno está diseñado para facilitar pruebas y desarrollo colaborativo.

### 9.3 Flujo de Trabajo con Docker Compose

- Cada desarrollador clona o forkea el repositorio oficial del proyecto.
- El archivo docker-compose.yml define los servicios necesarios para levantar el
  sistema.
- Con el comando docker compose up --build se inicia el entorno completo.
- Los cambios se desarrollan en ramas feature/fix y se integran mediante Pull
  Request.

## 10. Alcance

### 10.1 ¿Qué incluye la versión inicial (v1.0)?

| Funcionalidad incluida                                      | Estado                                         |
| ----------------------------------------------------------- | ---------------------------------------------- |
| Sistema de autenticación JWT con registro y login           | Implementado                                   |
| Gestión de perfiles con roles globales                      | Implementado                                   |
| Cursos, períodos académicos y ofertas                       | Implementado                                   |
| Flujo de postulación, aprobación y rechazo de inscripciones | Implementado                                   |
| Selección de roles de práctica                              | Implementado                                   |
| Programa de rotación con bloques                            | Implementado                                   |
| Generación de equipos y rotación de juniors                 | Implementado / parcial según flujo de interfaz |
| Sistema de wallet con monedas y diamantes                   | Implementado                                   |
| Dashboard diferenciado por rol                              | Implementado                                   |

### 10.2 ¿Qué NO incluye la versión inicial?

| Fuera de alcance v1.0                                             | Justificación                                                                 |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Evaluación cruzada entre integrantes del equipo                   | No existe aún un módulo funcional ni endpoints expuestos para esta operación. |
| Exportación de resultados académicos                              | No se encuentra implementada en la versión actual.                            |
| Importación de listas de estudiantes por CSV                      | No forma parte del flujo implementado actualmente.                            |
| Ajuste manual de grupos por docente desde interfaz                | No existe aún una UI operativa para esta capacidad.                           |
| Detección formal de grupos repetidos entre sprints                | No se presenta como módulo terminado en la versión actual.                    |
| Integración con un sistema externo de autenticación institucional | La autenticación vigente es local mediante JWT.                               |
| Gestión de tareas tipo Jira/Trello                                | Corresponde a una fase futura del proyecto.                                   |
| Aplicación móvil nativa y notificaciones push                     | No pertenece al alcance actual.                                               |

### 10.3 Entorno y Restricciones Técnicas

- El entorno de ejecución previsto para la versión actual es local, mediante Docker
  Compose.
- No se contempla despliegue productivo dentro del alcance de esta versión.
- Se requiere contar con Docker Desktop o Docker Engine instalado en la
  máquina de desarrollo.
- El avance funcional visible en frontend no expone todavía todas las capacidades
  presentes a nivel backend.

### 10.4 Consideraciones de Diseño del Programa de Rotación

- El modelo actual del proyecto se basa en programas de rotación y bloques
  temporales, no en un módulo cerrado de sprints académicos cortos.
- Las decisiones de asignación de estudiantes se apoyan en inscripciones
  aprobadas, roles técnicos y bloques de programa.
- El sistema contempla generación de equipos y rotación de juniors dentro del
  programa.
- Las reglas avanzadas de auditoría, excepciones y prevención de repeticiones
  requieren mayor consolidación funcional.

## 11. Estado de implementación

### 11.1 Funcionalidades Implementadas

| Módulo      | Funcionalidad                  | Estado | Notas                                                                          |
| ----------- | ------------------------------ | ------ | ------------------------------------------------------------------------------ |
| Auth        | Login y registro con JWT       | ✓      | Access token y refresh token implementados.                                    |
| Usuarios    | Gestión de perfiles            | ✓      | Roles globales: Admin, Teacher y Student.                                      |
| Cursos      | Cursos y períodos              | ✓      | CRUD principal disponible en backend.                                          |
| Offerings   | Oferta y postulación           | ✓      | Apply, approve y deny implementados.                                           |
| Enrollments | Selección de roles de práctica | ✓      | Soporte para preferencias y rol primario.                                      |
| Programa    | Rotation Program y bloques     | ✓      | Modelo y servicios implementados.                                              |
| Equipos     | Generación de equipos          | ✓      | Soporte en backend.                                                            |
| Wallet      | Monedas y diamantes            | ✓      | Transacciones y balances implementados.                                        |
| Frontend    | Vistas diferenciadas por rol   | ✓      | Docente y estudiante visibles; otras vistas siguen en habilitación progresiva. |
| Docker      | Entorno reproducible           | ✓      | Frontend, backend y PostgreSQL contenedorizados.                               |

### 11.2 Funcionalidades Pendientes

| Módulo      | Funcionalidad                             | Prioridad | Observación                                                               |
| ----------- | ----------------------------------------- | --------- | ------------------------------------------------------------------------- |
| Importación | Carga de listas por CSV                   | Alta      | Todavía no existe flujo implementado.                                     |
| Evaluación  | Evaluación cruzada entre integrantes      | Alta      | Corresponde a fase futura del sistema.                                    |
| Evaluación  | Consolidado y exportación de resultados   | Media     | Requiere desarrollo adicional de backend y frontend.                      |
| Equipos     | Ajuste manual por docente                 | Media     | No se encuentra expuesto como funcionalidad operativa.                    |
| Equipos     | Prevención formal de repeticiones         | Media     | Necesita una definición funcional cerrada y su validación en interfaz.    |
| Admin       | Panel administrativo completo en frontend | Media     | Parte de las opciones están previstas, pero no habilitadas completamente. |
| Perfiles    | Módulo de perfil visible en interfaz      | Baja      | Existe soporte backend, pero la vista no está completa.                   |

### 11.3 Prioridades

**Prioridad 1 (crítica para consolidar el flujo actual):**

- Fortalecer el flujo completo de postulaciones, aprobaciones y consulta de
  estado.
- Consolidar la operación de programas de rotación y generación de equipos en
  interfaz.
- Completar la exposición en frontend de funcionalidades ya soportadas por
  backend.

**Prioridad 2 (mejora funcional):**

- Implementar importación de listas de estudiantes.
- Desarrollar ajustes manuales de equipos por parte del docente.
- Extender el panel administrativo y de perfiles.

**Prioridad 3 (expansión del producto):**

- Construir el módulo de evaluación cruzada.
- Agregar exportación de resultados y reportes.
- Evaluar incorporación de gestión de tareas y notificaciones.

## 12. Requisitos adicionales para Frontend

Esta sección baja el PRD a nivel operativo de frontend: **pantallas, flujos, permisos,
contratos de API y manejo de estados/errores**. El objetivo es que las tareas
generadas para el sprint sean accionables (no genéricas).

### 12.1 Matriz de permisos (UI + API)

Definir explícitamente (y reflejar en UI mediante guards/menús) quién puede ejecutar
cada acción:

- Cursos (`/courses`)
  ○ Crear/editar: ¿Admin, Docente, ambos?

○ Listar: Admin/Docente (gestión), Estudiante (solo lectura si aplica)

- Términos (`/terms`)
  ○ Crear/editar: ¿Admin, Docente, ambos?
- Ofertas (`/offerings`)
  ○ Crear: Docente (y/o Admin)
  ○ Editar/cerrar (si existe): Docente propietario (y/o Admin)
- Postulaciones (`/offerings/:id/apply`)
  ○ Aplicar: Estudiante
  ○ Ver aplicaciones de una oferta: Docente propietario (y/o Admin)
  ○ Aprobar/denegar (`/enrollments/:id/approve|deny`): Docente (y/o Admin)
  **Criterio de aceptación:** un usuario sin permiso no ve el CTA (botón) y, si intenta
  acceder por URL, recibe pantalla “Sin permisos” (no solo un error genérico).

### 12.2 Flujos faltantes en UI (Docente / Admin)

#### 12.2.1 Gestión Académica: Crear Curso → Crear Término → Crear Oferta

Actualmente, para “habilitar un curso” en la plataforma se requieren tres entidades. En
frontend debe existir un flujo claro y guiado, idealmente desde un módulo único
“Gestión académica”:

- Crear Curso (manual)
  ○ CTA: “Crear curso”
  ○ Form: `code`, `name`
  ○ API: `POST /courses`
  ○ UX: validación de duplicados (si el backend responde 409/400), estados
  loading/success/error.
- Crear Término (período)
  ○ CTA: “Crear período”
  ○ - Form: name, year, period, startsAt, endsAt
  ○ - API: `POST /terms`
  ○ - UX: selector de fechas, validación de rango (start <= end).
- Crear Oferta
  ○ CTA: “Crear oferta”

○ Form: `courseId`, `termId`, `teacherId` (si el actor es Admin), o implícito si
es Docente.
○ API: `POST /offerings`
○ UX: selects con búsqueda (curso/término), previsualización de oferta
antes de confirmar.
**Criterio de aceptación:** un Docente/Admin puede crear una oferta de manera 100%
manual desde UI, sin usar DB/seed.

#### 12.2.2 Revisar postulaciones (Docente)

En “Aplicaciones” se requiere:

- Listado de ofertas del docente: `GET /me/offerings` (o el equivalente existente)
- Selección de oferta → tabla de aplicaciones: `GET
/offerings/:offeringId/applications`
- Acciones por aplicación: aprobar/denegar: `POST
/enrollments/:enrollmentId/approve` y `POST /enrollments/:enrollmentId/deny`
- Estados: pendiente/aprobado/denegado + feedback inmediato
  **Criterio de aceptación:** después de aprobar/denegar, la UI se actualiza (refetch u
  optimistic) y queda consistente.

### 12.3 Flujos faltantes en UI (Estudiante)

#### 12.3.1 Aplicar a una oferta (fix del “Unauthorized”)

Requisito explícito: toda llamada a endpoints protegidos debe incluir `Authorization:
Bearer <accessToken>`.

- API: `POST /offerings/:offeringId/apply`
- Reglas UX:
  ○ Si la sesión expiró: mostrar mensaje “Tu sesión expiró, inicia sesión
  nuevamente” y redirigir a login.
  ○ Si el backend responde 401: no mostrar “Unauthorized” crudo; mapear a
  un mensaje entendible.

**Criterio de aceptación:** con sesión válida, un estudiante puede aplicar y ver estado
“Pendiente” sin errores de autorización.

#### 12.3.2 Ver estado de mis cursos/postulaciones

- Pantalla “Mis cursos / Mis postulaciones”
  ○ Fuente: `GET /me/offerings` o endpoint equivalente de enrollments del
  usuario
  ○ Mostrar: oferta, estado (pendiente/aprobado/denegado), track, año
  académico, docente, período
  **Criterio de aceptación:** el estudiante entiende si está inscrito, en revisión o rechazado,
  y qué puede hacer después.

### 12.4 Contratos mínimos de API para Frontend

Para cada pantalla/CTA de frontend, definir en PRD:

- Endpoint (método + ruta)
- Auth requerida (sí/no)
- Request body (campos + validaciones)
- Response (campos necesarios para renderizar)
- Errores esperados (401/403/404/409/422) + copy de UI
  Ejemplos mínimos a declarar:
- POST /courses (crear curso)
- POST /terms (crear término)
- POST /offerings (crear oferta)
- POST /offerings/:id/apply (aplicar)
- GET /offerings/:id/applications (ver aplicaciones)
- POST /enrollments/:id/approve|deny (decisión)

### 12.5 Manejo de sesión y errores (requisito transversal)

Definir como requisito de frontend:

- Inyección de token: en endpoints protegidos (access token desde
  storage/estado).

- Estrategia ante 401:
  ○ Si existe refresh token, intentar refresh (si hay endpoint) o forzar logout.
  ○ Si no existe refresh, logout y redirección a `/login`.
- Mensajes de error: sin “stack traces” ni textos crudos; usar mensajes orientados
  al usuario.
- Estados de carga y vacío: skeleton/empty states consistentes en listados.

### 12.6 Checklist de pantallas mínimas (para el sprint)

- Docente/Admin
  ○ Gestión académica: listado + crear curso
  ○ Gestión académica: listado + crear término
  ○ Gestión académica: listado + crear oferta
  ○ Aplicaciones: ver aplicaciones y aprobar/denegar
- Estudiante
  ○ Cursos disponibles: aplicar con sesión válida (sin 401)
  ○ Mis cursos/postulaciones: ver estado actualizado

### 12.7 Criterios de (Definition of Done) para frontend

- Integración real con backend (sin mocks) para los endpoints del sprint.
- Rutas protegidas por rol, con fallback “sin permisos”.
- Manejo de 401/403/404 con UX consistente.
- Variables de entorno documentadas (`VITE_API_URL`) y entorno local
  reproducible.

## 13. Reglas de Negocio y Algoritmos Backend

Esta sección define las reglas de negocio críticas y los algoritmos necesarios para la
generación de equipos, rotación de estudiantes y validaciones del sistema. Su objetivo
es eliminar ambigüedad funcional y permitir una implementación directa en backend.

### 13.1 Generación de Equipos

#### 13.1.1 Objetivo

Generar equipos de trabajo de forma automática a partir de los estudiantes con
inscripción aprobada en una oferta académica, respetando la estructura definida por el
programa.

#### 13.1.2 Entrada del algoritmo

- Lista de estudiantes con inscripción aprobada (Enrollment.status =
  approved)
- Clasificación de estudiantes:
  ○ Estudiantes de Práctica Interna (candidatos a Leader o Senior)
  ○ Estudiantes de Inducción (Juniors)
- Configuración del programa de rotación (cantidad de equipos esperados,
  bloques activos)

#### 13.1.3 Estructura de equipo

Cada equipo debe cumplir con la siguiente composición:

- 1 Leader (obligatorio)
- 1 o más Seniors
- 2 a 3 Juniors

#### 13.1.4 Reglas de asignación

- Un estudiante no puede pertenecer a más de un equipo dentro del mismo bloque
- Todos los estudiantes deben ser asignados a un equipo en la medida de lo
  posible
- Los equipos deben mantenerse balanceados (diferencia máxima de ±1 miembro
  entre equipos)
- La asignación de Leader tiene prioridad sobre otros roles

- Los Seniors se asignan después del Leader
- Los Juniors se distribuyen de forma equitativa entre equipos

#### 13.1.5 Validaciones

- Validar que exista al menos un Leader disponible por equipo
- Validar que la cantidad de Juniors permita formar equipos válidos
- En caso de insuficiencia de roles, el sistema debe:
  ○ Ajustar el número de equipos
  ○ O generar una advertencia controlada

#### 13.1.6 Responsabilidades backend

- Servicio: TeamGenerationService
- Funciones principales:
  ○ generateTeams(programId, blockId)
  ○ assignLeaders()
  ○ assignSeniors()
  ○ assignJuniors()
  ○ validateDistribution()

### 13.2 Rotación de Estudiantes

#### 13.2.1 Objetivo

Permitir la rotación de estudiantes entre equipos a lo largo de los bloques (sprints),
manteniendo la continuidad del equipo y evitando repeticiones innecesarias.

#### 13.2.2 Reglas de rotación

- Los Juniors rotan cada 4 sprints
- Los Seniors rotan cada 6 sprints
- El Leader se mantiene en el equipo durante su ciclo de rotación

- La rotación ocurre entre equipos dentro del mismo programa

#### 13.2.3 Tipo de rotación

Se implementa una rotación circular:

- Los miembros de un equipo pasan al siguiente equipo en el siguiente ciclo
- Ejemplo:
  ○ Team A → Team B
  ○ Team B → Team C
  ○ Team C → Team A

#### 13.2.4 Restricciones

- Un estudiante no debe repetir equipo en bloques recientes
- La rotación debe respetar la capacidad de cada equipo
- No se deben romper las reglas de composición del equipo

#### 13.2.5 Responsabilidades backend

- Servicio: RotationService
- Funciones principales:
  ○ generateRotationPreview(programId)
  ○ applyRotation(programId, blockId)
  ○ getRotationHistory(userId)

### 13.3 Prevención de Repetición de Equipos

#### 13.3.1 Objetivo

Evitar que los estudiantes trabajen repetidamente con los mismos compañeros en
periodos cercanos.

#### 13.3.2 Regla principal

- Dos estudiantes no deben coincidir en el mismo equipo si ya coincidieron en los
  últimos N bloques

(N es un valor configurable del sistema)

#### 13.3.3 Implementación

- Se debe consultar el historial de TeamMembership
- Se comparan combinaciones de usuarios por equipo
- Antes de asignar un estudiante a un equipo, se valida si la combinación es válida

#### 13.3.4 Responsabilidades backend

- Servicio: TeamHistoryService
- Funciones principales:
  ○ getPastTeammates(userId, lastNBlocks)
  ○ hasConflict(userId, teamId)
  ○ validateAssignment(candidate, team)

### 13.4 Modelo de Sprint (ProgramBlock)

#### 13.4.1 Definición

Cada ProgramBlock representa un sprint dentro del programa de rotación.

#### 13.4.2 Atributos requeridos

- sprintNumber
- startsAt
- endsAt

#### 13.4.3 Reglas

- Un bloque equivale a un sprint

- Solo puede existir un sprint activo por programa
- Las fechas deben cumplir:
  ○ startsAt <= endsAt
- El sistema debe poder identificar el sprint actual en base a la fecha

#### 13.4.4 Responsabilidades backend

- getCurrentSprint(programId)
- getSprintById(blockId)
- validateSprintDates()

### 13.5 Endpoints Requeridos (Backend)

#### Equipos

- GET /teams/:blockId → listar equipos por sprint
- GET /teams/:id/members → miembros de un equipo

#### Rotación

- GET /rotation-programs/:programId/juniors/rotation-preview
- POST /rotation-programs/:programId/juniors/rotation-apply
- GET /rotation/history/:userId

#### Validaciones

- GET /students/:id/history
- GET /teams/validate

#### Sprint

- GET /sprints/current
- GET /sprints/:id

### 13.6 Consideraciones Técnicas

- Todas las operaciones de generación y rotación deben ser transaccionales
- Se debe permitir una previsualización antes de aplicar cambios definitivos
- El sistema debe ser determinístico (mismos inputs → mismos outputs)
- Se deben registrar logs de generación y rotación para auditoría

### 13.7 Criterios de Aceptación (Backend)

- La generación de equipos cumple la estructura definida
- La rotación respeta los ciclos (4 y 6 sprints)
- No existen repeticiones inválidas de equipos dentro del rango configurado
- El sistema identifica correctamente el sprint actual
- Los endpoints responden con datos consistentes y validados

### 13.8 Sistema de Evaluación por Sprint

#### 13.8.1 Objetivo

Permitir la evaluación bidireccional entre los integrantes del equipo en cada sprint, donde:

- Los Developers (Juniors y Seniors) evalúan al Leader.

- El Leader evalúa a cada miembro del equipo.

El resultado de estas evaluaciones será utilizado para calcular la nota final del estudiante, visible para el docente.

#### 13.8.2 Reglas de Evaluación

- La evaluación ocurre en cada sprint (ProgramBlock)
- Cada evaluación está asociada a:
  - `programId`
  - `blockId` (sprint)
  - `teamId`

##### Evaluación del Leader

- Todos los miembros del equipo (Juniors y Seniors) deben evaluar al Leader
- Un estudiante solo puede evaluar al Leader de su equipo actual
- Cada estudiante puede realizar una única evaluación por sprint

##### Evaluación de Developers

- El Leader debe evaluar a todos los miembros de su equipo
- El Leader debe completar una evaluación por cada miembro
- No se permite autoevaluación

#### 13.8.3 Estructura de Evaluación

Cada evaluación debe contener:

- `evaluatorId` (quien evalúa)
- `evaluatedId` (quien es evaluado)
- `blockId` (sprint)
- `teamId`
- `score` (valor numérico, por ejemplo 1–5 o 1–10)
- `feedback` (texto opcional)
- `createdAt`

#### 13.8.4 Restricciones

- Un usuario no puede evaluar a alguien fuera de su equipo en el sprint actual
- Un usuario no puede evaluar más de una vez al mismo evaluado en el mismo sprint
- No se permite modificar evaluaciones una vez cerradas (opcional configurable)
- Las evaluaciones solo pueden realizarse dentro del rango de fechas del sprint o en una ventana posterior definida

#### 13.8.5 Flujo del Sistema

1. Finaliza o se acerca el cierre de un sprint
2. Se habilita la ventana de evaluación
3. Los Developers evalúan al Leader
4. El Leader evalúa a todos los Developers
5. El sistema valida que todas las evaluaciones requeridas estén completas
6. Se cierra la evaluación del sprint
7. Se consolidan los resultados

#### 13.8.6 Cálculo de Notas

El sistema debe calcular:

##### Nota por sprint

- Promedio de evaluaciones recibidas por un usuario en un sprint

##### Nota final del estudiante

- Promedio de todas sus evaluaciones a lo largo del programa
- Posibilidad de ponderación por rol:
  - Leader
  - Senior
  - Junior

(Este criterio puede ser configurable por el docente en el futuro)

#### 13.8.7 Visualización para Docente

El docente debe poder consultar:

- Nota por sprint de cada estudiante
- Promedio general acumulado
- Historial de evaluaciones
- Feedback cualitativo

#### 13.8.8 Responsabilidades Backend

- Servicio: `EvaluationService`

Funciones principales:

- `submitEvaluation(evaluatorId, evaluatedId, blockId, score, feedback)`
- `getEvaluationsByUser(userId)`
- `getEvaluationsByBlock(blockId)`
- `calculateSprintScore(userId, blockId)`
- `calculateFinalScore(userId)`

---

#### 13.8.9 Endpoints Requeridos

- `POST /evaluations` → registrar evaluación
- `GET /evaluations/me` → evaluaciones realizadas por el usuario
- `GET /evaluations/received/:userId` → evaluaciones recibidas
- `GET /evaluations/block/:blockId` → evaluaciones por sprint
- `GET /evaluations/final/:userId` → nota final del estudiante

---

#### 13.8.10 Consideraciones Técnicas

- Las evaluaciones deben estar protegidas por permisos de equipo y sprint
- Se recomienda manejo transaccional para evitar inconsistencias
- Debe existir validación estricta de duplicidad de evaluaciones
- Se debe permitir auditoría (historial de evaluaciones)

#### 13.8.11 Criterios de Aceptación

- Todos los miembros pueden evaluar correctamente dentro de su equipo
- El Leader puede evaluar a todos los Developers
- No existen evaluaciones duplicadas
- El sistema calcula correctamente la nota por sprint
- El sistema calcula correctamente la nota final acumulada
- El docente puede visualizar resultados consistentes
