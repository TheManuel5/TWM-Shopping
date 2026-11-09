-- Esquema final. Ejecutar primero en una base vacía.

CREATE TABLE Region (
    ID INT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Superficie INT NOT NULL CHECK (Superficie > 0)
);

CREATE TABLE Provincia (
    ID INT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Superficie INT NOT NULL CHECK (Superficie > 0),
    ID_Region INT NOT NULL REFERENCES Region(ID) ON UPDATE CASCADE
);

CREATE TABLE Comuna (
    ID INT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Superficie INT NOT NULL CHECK (Superficie > 0),
    ID_Provincia INT NOT NULL REFERENCES Provincia(ID) ON UPDATE CASCADE
);

CREATE TABLE Empresa (
    RUT VARCHAR(11) PRIMARY KEY,
    Nombre VARCHAR(60) NOT NULL,
    Giro VARCHAR(60),
    Web VARCHAR(255)
);

CREATE TABLE Emprendedor (
    RUN VARCHAR(10) PRIMARY KEY,
    Nombre VARCHAR(60) NOT NULL,
    Apellido VARCHAR(60) NOT NULL,
    FechaNac DATE NOT NULL CHECK (FechaNac BETWEEN DATE '1940-01-01' AND CURRENT_DATE),
    Passwd TEXT NOT NULL,
    Web VARCHAR(255),
    Empresa_id VARCHAR(11) REFERENCES Empresa(RUT) ON UPDATE CASCADE,
    FechaRegistro DATE NOT NULL DEFAULT CURRENT_DATE
        CHECK (FechaRegistro BETWEEN DATE '1995-01-01' AND CURRENT_DATE)
);

CREATE TABLE Cliente (
    RUN VARCHAR(10) PRIMARY KEY,
    Nombre VARCHAR(60) NOT NULL,
    Apellido VARCHAR(60) NOT NULL,
    FechaNac DATE NOT NULL CHECK (FechaNac BETWEEN DATE '1940-01-01' AND CURRENT_DATE),
    Passwd TEXT NOT NULL,
    FechaRegistro DATE NOT NULL DEFAULT CURRENT_DATE
        CHECK (FechaRegistro BETWEEN DATE '1995-01-01' AND CURRENT_DATE)
);

CREATE TABLE Calificacion (
    ID INT PRIMARY KEY,
    Puntaje SMALLINT NOT NULL CHECK (Puntaje BETWEEN 1 AND 5),
    Comentario TEXT
);

CREATE TABLE Direccion (
    ID INT PRIMARY KEY,
    CodPostal VARCHAR(12),
    Calle VARCHAR(80) NOT NULL,
    Numero INT NOT NULL CHECK (Numero > 0),
    Pasaje VARCHAR(60),
    Sector VARCHAR(60),
    Comuna_id INT NOT NULL REFERENCES Comuna(ID) ON UPDATE CASCADE,
    Emprendedor_id VARCHAR(10) REFERENCES Emprendedor(RUN) ON UPDATE CASCADE,
    Cliente_id VARCHAR(10) REFERENCES Cliente(RUN) ON UPDATE CASCADE
);

CREATE TABLE Telefono (
    Telefono VARCHAR(20) PRIMARY KEY CHECK (Telefono ~ '^\+?[0-9]{8,15}$' AND length(regexp_replace(Telefono,'^\+56','')) >= 8),
    Empresa_id VARCHAR(11) REFERENCES Empresa(RUT) ON UPDATE CASCADE,
    Emprendedor_id VARCHAR(10) REFERENCES Emprendedor(RUN) ON UPDATE CASCADE,
    Cliente_id VARCHAR(10) REFERENCES Cliente(RUN) ON UPDATE CASCADE,
    CHECK (num_nonnulls(Empresa_id, Emprendedor_id, Cliente_id) = 1)
);

CREATE TABLE Correo (
    Correo VARCHAR(255) PRIMARY KEY,
    Empresa_id VARCHAR(11) REFERENCES Empresa(RUT) ON UPDATE CASCADE,
    Emprendedor_id VARCHAR(10) REFERENCES Emprendedor(RUN) ON UPDATE CASCADE,
    Cliente_id VARCHAR(10) REFERENCES Cliente(RUN) ON UPDATE CASCADE,
    CHECK (num_nonnulls(Empresa_id, Emprendedor_id, Cliente_id) = 1)
);

CREATE TABLE Registrar (
    Cliente_id VARCHAR(10) NOT NULL REFERENCES Cliente(RUN) ON UPDATE CASCADE,
    Direccion_id INT NOT NULL REFERENCES Direccion(ID) ON UPDATE CASCADE,
    PRIMARY KEY (Cliente_id, Direccion_id)
);

CREATE TABLE TieneDirEmpresa (
    Empresa_ID VARCHAR(11) NOT NULL REFERENCES Empresa(RUT) ON UPDATE CASCADE,
    Direccion_id INT NOT NULL REFERENCES Direccion(ID) ON UPDATE CASCADE,
    PRIMARY KEY (Empresa_ID, Direccion_id)
);

CREATE TABLE TieneDirE (
    Emprendedor_id VARCHAR(10) NOT NULL REFERENCES Emprendedor(RUN) ON UPDATE CASCADE,
    Direccion_id INT NOT NULL REFERENCES Direccion(ID) ON UPDATE CASCADE,
    PRIMARY KEY (Emprendedor_id, Direccion_id)
);

CREATE TABLE Envio (
    Seguimiento INT PRIMARY KEY,
    Cliente_id VARCHAR(10) NOT NULL REFERENCES Cliente(RUN) ON UPDATE CASCADE,
    Direccion_id INT NOT NULL,
    FechaSalida DATE NOT NULL DEFAULT CURRENT_DATE CHECK (FechaSalida >= DATE '1995-01-01'),
    FechaLlegada DATE,
    Empresa VARCHAR(60) NOT NULL,
    Valor NUMERIC(12,0) NOT NULL DEFAULT 0 CHECK (Valor >= 0),
    Peso NUMERIC(10,2) CHECK (Peso > 0),
    Altura NUMERIC(10,2) CHECK (Altura > 0),
    Ancho NUMERIC(10,2) CHECK (Ancho > 0),
    Fondo NUMERIC(10,2) CHECK (Fondo > 0),
    Estado VARCHAR(30) NOT NULL DEFAULT 'En Preparación'
        CHECK (Estado IN ('En Preparación','Despachado','En reparto','Entregado')),
    UNIQUE (Seguimiento, Cliente_id),
    FOREIGN KEY (Cliente_id, Direccion_id) REFERENCES Registrar(Cliente_id, Direccion_id) ON UPDATE CASCADE,
    CHECK (FechaLlegada IS NULL OR FechaLlegada >= FechaSalida)
);

CREATE TABLE Venta (
    ID INT PRIMARY KEY,
    FechaHora TIMESTAMP NOT NULL DEFAULT LOCALTIMESTAMP,
    Cliente_id VARCHAR(10) NOT NULL REFERENCES Cliente(RUN) ON UPDATE CASCADE,
    Emprendedor_id VARCHAR(10) NOT NULL REFERENCES Emprendedor(RUN) ON UPDATE CASCADE,
    Fecha DATE NOT NULL DEFAULT CURRENT_DATE CHECK (Fecha BETWEEN DATE '1995-01-01' AND CURRENT_DATE),
    -- Se conserva el nombre original: ValorBruto es la BASE antes de descuento e IVA.
    ValorBruto INT NOT NULL DEFAULT 0 CHECK (ValorBruto >= 0),
    IVA NUMERIC(5,2) NOT NULL DEFAULT 19 CHECK (IVA = 19),
    PorcentajeDescuento NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (PorcentajeDescuento BETWEEN 0 AND 100),
    DescuentoManual INT NOT NULL DEFAULT 0 CHECK (DescuentoManual >= 0),
    Descuento INT NOT NULL DEFAULT 0 CHECK (Descuento >= 0 AND Descuento <= ValorBruto),
    TotalNeto INT GENERATED ALWAYS AS (ValorBruto - Descuento) STORED,
    MontoIVA INT GENERATED ALWAYS AS (ROUND((ValorBruto - Descuento) * IVA / 100.0)::INT) STORED,
    Total INT NOT NULL DEFAULT 0 CHECK (Total >= 0),
    Descripcion TEXT,
    Despacho INT UNIQUE,
    Estado VARCHAR(30) NOT NULL DEFAULT 'En Preparación'
        CHECK (Estado IN ('En Preparación','Despachado','En reparto','Entregado','Recibido','Cancelada')),
    UNIQUE (ID, Cliente_id, Emprendedor_id),
    FOREIGN KEY (Despacho, Cliente_id) REFERENCES Envio(Seguimiento, Cliente_id) ON UPDATE CASCADE,
    CHECK (Total >= TotalNeto)
);

CREATE TABLE MedioPago (
    ID INT PRIMARY KEY,
    Cliente_id VARCHAR(10) NOT NULL REFERENCES Cliente(RUN) ON UPDATE CASCADE,
    Tipo VARCHAR(30) NOT NULL CHECK (Tipo IN ('Tarjeta','Transferencia','Efectivo','Otro')),
    Marca VARCHAR(30),
    Digitos CHAR(4) CHECK (Digitos IS NULL OR Digitos ~ '^[0-9]{4}$'),
    CodigoTransferencia VARCHAR(80),
    CHECK ((Tipo = 'Tarjeta' AND Marca IS NOT NULL AND Digitos IS NOT NULL)
        OR (Tipo <> 'Tarjeta' AND Digitos IS NULL)),
    CHECK (Tipo <> 'Transferencia' OR CodigoTransferencia IS NOT NULL)
);

CREATE TABLE Oferta (
    ID INT PRIMARY KEY,
    Precio INT NOT NULL CHECK (Precio >= 0)
);

CREATE TABLE Categoría (
    ID INT PRIMARY KEY,
    Nombre VARCHAR(80) NOT NULL,
    Categoria_id INT REFERENCES Categoría(ID) ON UPDATE CASCADE,
    CHECK (Categoria_id IS NULL OR Categoria_id <> ID)
);

CREATE TABLE Producto (
    ID INT PRIMARY KEY,
    Nombre VARCHAR(80) NOT NULL,
    Restriccion VARCHAR(60),
    EdadMinima INT NOT NULL DEFAULT 0 CHECK (EdadMinima BETWEEN 0 AND 120),
    Descripción JSONB NOT NULL DEFAULT '{}'::JSONB CHECK (jsonb_typeof(Descripción) = 'object'),
    Categoria_id INT NOT NULL REFERENCES Categoría(ID) ON UPDATE CASCADE,
    Activo BOOLEAN NOT NULL DEFAULT TRUE,
    FechaRegistro DATE NOT NULL DEFAULT CURRENT_DATE,
    UltimaVenta DATE,
    OcultoPorInactividad BOOLEAN NOT NULL DEFAULT FALSE,
    CHECK (FechaRegistro BETWEEN DATE '1995-01-01' AND CURRENT_DATE),
    CHECK (UltimaVenta IS NULL OR UltimaVenta BETWEEN FechaRegistro AND CURRENT_DATE)
);

CREATE TABLE Servicio (
    ID INT PRIMARY KEY,
    Nombre VARCHAR(80) NOT NULL,
    Restriccion VARCHAR(60),
    EdadMinima INT NOT NULL DEFAULT 0 CHECK (EdadMinima BETWEEN 0 AND 120),
    Duracion INTERVAL CHECK (Duracion IS NULL OR Duracion > INTERVAL '0 seconds'),
    Precio INT NOT NULL CHECK (Precio >= 0),
    Descripcion JSONB NOT NULL DEFAULT '{}'::JSONB CHECK (jsonb_typeof(Descripcion) = 'object'),
    Categoria_id INT NOT NULL REFERENCES Categoría(ID) ON UPDATE CASCADE,
    Activo BOOLEAN NOT NULL DEFAULT TRUE,
    FechaRegistro DATE NOT NULL DEFAULT CURRENT_DATE CHECK (FechaRegistro BETWEEN DATE '1995-01-01' AND CURRENT_DATE),
    UltimaVenta DATE,
    OcultoPorInactividad BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE Caracteristicas (
    ID INT PRIMARY KEY,
    Peso NUMERIC(10,2) NOT NULL CHECK (Peso >= 0),
    Color VARCHAR(30),
    Marca VARCHAR(60),
    Material VARCHAR(40),
    Medidas VARCHAR(60),
    Talla VARCHAR(20)
);

CREATE TABLE Poseer (
    Caracteristicas_id INT NOT NULL REFERENCES Caracteristicas(ID) ON UPDATE CASCADE,
    Producto_id INT NOT NULL REFERENCES Producto(ID) ON UPDATE CASCADE,
    Precio INT NOT NULL CHECK (Precio >= 0),
    PRIMARY KEY (Caracteristicas_id, Producto_id)
);

CREATE TABLE OfrecerP (
    Producto_id INT NOT NULL REFERENCES Producto(ID) ON UPDATE CASCADE,
    Emprendedor_id VARCHAR(10) NOT NULL REFERENCES Emprendedor(RUN) ON UPDATE CASCADE,
    Caracteristicas_id INT NOT NULL,
    FechaInicio DATE NOT NULL CHECK (FechaInicio >= DATE '1995-01-01'),
    FechaFin DATE,
    Stock INT NOT NULL CHECK (Stock >= 0),
    Precio INT NOT NULL CHECK (Precio >= 0),
    PRIMARY KEY (Producto_id, Emprendedor_id, Caracteristicas_id),
    FOREIGN KEY (Caracteristicas_id, Producto_id) REFERENCES Poseer(Caracteristicas_id, Producto_id) ON UPDATE CASCADE,
    CHECK (FechaFin IS NULL OR FechaInicio < FechaFin)
);

CREATE TABLE OfrecerS (
    Servicio_id INT NOT NULL REFERENCES Servicio(ID) ON UPDATE CASCADE,
    Emprendedor_id VARCHAR(10) NOT NULL REFERENCES Emprendedor(RUN) ON UPDATE CASCADE,
    FechaInicio DATE NOT NULL CHECK (FechaInicio >= DATE '1995-01-01'),
    FechaFin DATE,
    PRIMARY KEY (Servicio_id, Emprendedor_id),
    CHECK (FechaFin IS NULL OR FechaInicio < FechaFin)
);

CREATE TABLE OfertarP (
    Producto_id INT NOT NULL,
    Oferta_id INT NOT NULL REFERENCES Oferta(ID) ON UPDATE CASCADE,
    Emprendedor_id VARCHAR(10) NOT NULL,
    Caracteristicas_id INT NOT NULL,
    Finicio DATE NOT NULL CHECK (Finicio >= DATE '1995-01-01'),
    Ffin DATE,
    PRIMARY KEY (Producto_id, Emprendedor_id, Caracteristicas_id, Oferta_id, Finicio),
    FOREIGN KEY (Producto_id, Emprendedor_id, Caracteristicas_id)
        REFERENCES OfrecerP(Producto_id, Emprendedor_id, Caracteristicas_id) ON UPDATE CASCADE,
    CHECK (Ffin IS NULL OR Finicio < Ffin)
);

CREATE TABLE OfertarS (
    Servicio_id INT NOT NULL,
    Oferta_id INT NOT NULL REFERENCES Oferta(ID) ON UPDATE CASCADE,
    Emprendedor_id VARCHAR(10) NOT NULL,
    Finicio DATE NOT NULL CHECK (Finicio >= DATE '1995-01-01'),
    Ffin DATE,
    PRIMARY KEY (Servicio_id, Emprendedor_id, Oferta_id, Finicio),
    FOREIGN KEY (Servicio_id, Emprendedor_id) REFERENCES OfrecerS(Servicio_id, Emprendedor_id) ON UPDATE CASCADE,
    CHECK (Ffin IS NULL OR Finicio < Ffin)
);

CREATE TABLE Devolucion (
    ID INT PRIMARY KEY,
    Estado VARCHAR(30) NOT NULL DEFAULT 'En Preparación' CHECK (Estado IN ('En Preparación','Despachado','En reparto','Entregado')),
    Valor INT NOT NULL CHECK (Valor >= 0),
    Medio TEXT NOT NULL,
    Motivo TEXT NOT NULL
);

CREATE TABLE Comprar (
    Producto_id INT NOT NULL,
    Caracteristicas_id INT NOT NULL,
    Venta_id INT NOT NULL,
    Cliente_id VARCHAR(10) NOT NULL,
    Emprendedor_id VARCHAR(10) NOT NULL,
    Cantidad INT NOT NULL DEFAULT 1 CHECK (Cantidad > 0),
    PrecioUnitario INT NOT NULL CHECK (PrecioUnitario >= 0),
    EdadMinimaAplicada INT NOT NULL DEFAULT 0 CHECK (EdadMinimaAplicada BETWEEN 0 AND 120),
    Devolucion_id INT UNIQUE REFERENCES Devolucion(ID) ON UPDATE CASCADE,
    EstadoDevolucion VARCHAR(30) CHECK (EstadoDevolucion IN ('Solicitada','Aprobada','Rechazada')),
    FechaDevolucion DATE,
    CantidadDevuelta INT NOT NULL DEFAULT 0 CHECK (CantidadDevuelta BETWEEN 0 AND Cantidad),
    PRIMARY KEY (Producto_id, Caracteristicas_id, Venta_id),
    UNIQUE (Producto_id, Caracteristicas_id, Venta_id, Cliente_id, Emprendedor_id),
    FOREIGN KEY (Venta_id, Cliente_id, Emprendedor_id)
        REFERENCES Venta(ID, Cliente_id, Emprendedor_id) ON UPDATE CASCADE,
    FOREIGN KEY (Producto_id, Emprendedor_id, Caracteristicas_id)
        REFERENCES OfrecerP(Producto_id, Emprendedor_id, Caracteristicas_id) ON UPDATE CASCADE,
    CHECK ((EstadoDevolucion IS NULL AND Devolucion_id IS NULL AND FechaDevolucion IS NULL AND CantidadDevuelta = 0)
        OR (EstadoDevolucion IS NOT NULL AND Devolucion_id IS NOT NULL AND FechaDevolucion IS NOT NULL)),
    CHECK (EstadoDevolucion IS DISTINCT FROM 'Aprobada' OR CantidadDevuelta > 0),
    CHECK (FechaDevolucion IS NULL OR FechaDevolucion <= CURRENT_DATE)
);

CREATE TABLE Contratar (
    Servicio_id INT NOT NULL,
    Venta_id INT NOT NULL,
    Cliente_id VARCHAR(10) NOT NULL,
    Emprendedor_id VARCHAR(10) NOT NULL,
    Cantidad INT NOT NULL DEFAULT 1 CHECK (Cantidad > 0),
    PrecioUnitario INT NOT NULL CHECK (PrecioUnitario >= 0),
    EdadMinimaAplicada INT NOT NULL DEFAULT 0 CHECK (EdadMinimaAplicada BETWEEN 0 AND 120),
    Direccion_id INT,
    PRIMARY KEY (Servicio_id, Venta_id),
    UNIQUE (Servicio_id, Venta_id, Cliente_id, Emprendedor_id),
    FOREIGN KEY (Venta_id, Cliente_id, Emprendedor_id)
        REFERENCES Venta(ID, Cliente_id, Emprendedor_id) ON UPDATE CASCADE,
    FOREIGN KEY (Servicio_id, Emprendedor_id) REFERENCES OfrecerS(Servicio_id, Emprendedor_id) ON UPDATE CASCADE,
    FOREIGN KEY (Cliente_id, Direccion_id) REFERENCES Registrar(Cliente_id, Direccion_id) ON UPDATE CASCADE
);

CREATE TABLE Vender (
    Venta_id INT NOT NULL REFERENCES Venta(ID) ON UPDATE CASCADE,
    MedioPago_id INT NOT NULL REFERENCES MedioPago(ID) ON UPDATE CASCADE,
    Fecha DATE NOT NULL DEFAULT CURRENT_DATE CHECK (Fecha BETWEEN DATE '1995-01-01' AND CURRENT_DATE),
    Monto INT NOT NULL CHECK (Monto >= 0),
    PRIMARY KEY (Venta_id, MedioPago_id)
);

CREATE TABLE Pregunta (
    ID INT PRIMARY KEY,
    Texto TEXT NOT NULL,
    Tiempo TIMESTAMP NOT NULL DEFAULT LOCALTIMESTAMP CHECK (Tiempo <= LOCALTIMESTAMP)
);

CREATE TABLE PreguntarP (
    Pregunta_id INT PRIMARY KEY REFERENCES Pregunta(ID) ON UPDATE CASCADE,
    Producto_id INT NOT NULL REFERENCES Producto(ID) ON UPDATE CASCADE,
    Emprendedor_id VARCHAR(10) NOT NULL REFERENCES Emprendedor(RUN) ON UPDATE CASCADE,
    Cliente_id VARCHAR(10) NOT NULL REFERENCES Cliente(RUN) ON UPDATE CASCADE,
    Fecha TIMESTAMP NOT NULL DEFAULT LOCALTIMESTAMP,
    UNIQUE (Pregunta_id, Producto_id, Emprendedor_id, Cliente_id)
);

CREATE TABLE PreguntarS (
    Pregunta_id INT PRIMARY KEY REFERENCES Pregunta(ID) ON UPDATE CASCADE,
    Servicio_id INT NOT NULL,
    Emprendedor_id VARCHAR(10) NOT NULL,
    Cliente_id VARCHAR(10) NOT NULL REFERENCES Cliente(RUN) ON UPDATE CASCADE,
    Fecha TIMESTAMP NOT NULL DEFAULT LOCALTIMESTAMP,
    UNIQUE (Pregunta_id, Servicio_id, Emprendedor_id, Cliente_id),
    FOREIGN KEY (Servicio_id, Emprendedor_id) REFERENCES OfrecerS(Servicio_id, Emprendedor_id) ON UPDATE CASCADE
);

CREATE TABLE Mensajeria (
    ID INT PRIMARY KEY,
    Texto TEXT NOT NULL,
    Tiempo TIMESTAMP NOT NULL DEFAULT LOCALTIMESTAMP CHECK (Tiempo <= LOCALTIMESTAMP),
    Emisor VARCHAR(20) NOT NULL CHECK (Emisor IN ('Cliente','Emprendedor')),
    RespuestaA INT REFERENCES Mensajeria(ID) ON UPDATE CASCADE,
    CHECK (RespuestaA IS NULL OR RespuestaA <> ID)
);

CREATE TABLE ComunicarP (
    Producto_id INT NOT NULL REFERENCES Producto(ID) ON UPDATE CASCADE,
    Mensajeria_id INT PRIMARY KEY REFERENCES Mensajeria(ID) ON UPDATE CASCADE,
    Cliente_id VARCHAR(10) NOT NULL REFERENCES Cliente(RUN) ON UPDATE CASCADE,
    Emprendedor_id VARCHAR(10) NOT NULL REFERENCES Emprendedor(RUN) ON UPDATE CASCADE,
    Fecha TIMESTAMP NOT NULL DEFAULT LOCALTIMESTAMP,
    Pregunta_id INT,
    FOREIGN KEY (Pregunta_id, Producto_id, Emprendedor_id, Cliente_id)
        REFERENCES PreguntarP(Pregunta_id, Producto_id, Emprendedor_id, Cliente_id) ON UPDATE CASCADE
);

CREATE TABLE ComunicarS (
    Servicio_id INT NOT NULL,
    Mensajeria_id INT PRIMARY KEY REFERENCES Mensajeria(ID) ON UPDATE CASCADE,
    Cliente_id VARCHAR(10) NOT NULL REFERENCES Cliente(RUN) ON UPDATE CASCADE,
    Emprendedor_id VARCHAR(10) NOT NULL,
    Fecha TIMESTAMP NOT NULL DEFAULT LOCALTIMESTAMP,
    Pregunta_id INT,
    FOREIGN KEY (Servicio_id, Emprendedor_id) REFERENCES OfrecerS(Servicio_id, Emprendedor_id) ON UPDATE CASCADE,
    FOREIGN KEY (Pregunta_id, Servicio_id, Emprendedor_id, Cliente_id)
        REFERENCES PreguntarS(Pregunta_id, Servicio_id, Emprendedor_id, Cliente_id) ON UPDATE CASCADE
);

CREATE TABLE CalificarP (
    Producto_id INT NOT NULL,
    Caracteristicas_id INT NOT NULL,
    Calificacion_id INT PRIMARY KEY REFERENCES Calificacion(ID) ON UPDATE CASCADE,
    Venta_id INT NOT NULL,
    Cliente_id VARCHAR(10) NOT NULL,
    Emprendedor_id VARCHAR(10) NOT NULL,
    Fecha TIMESTAMP NOT NULL DEFAULT LOCALTIMESTAMP CHECK (Fecha <= LOCALTIMESTAMP),
    UNIQUE (Producto_id, Caracteristicas_id, Venta_id),
    FOREIGN KEY (Producto_id, Caracteristicas_id, Venta_id, Cliente_id, Emprendedor_id)
        REFERENCES Comprar(Producto_id, Caracteristicas_id, Venta_id, Cliente_id, Emprendedor_id) ON UPDATE CASCADE
);

CREATE TABLE CalificarS (
    Servicio_id INT NOT NULL,
    Cliente_id VARCHAR(10) NOT NULL,
    Calificacion_id INT PRIMARY KEY REFERENCES Calificacion(ID) ON UPDATE CASCADE,
    Venta_id INT NOT NULL,
    Emprendedor_id VARCHAR(10) NOT NULL,
    Fecha TIMESTAMP NOT NULL DEFAULT LOCALTIMESTAMP CHECK (Fecha <= LOCALTIMESTAMP),
    UNIQUE (Servicio_id, Venta_id),
    FOREIGN KEY (Servicio_id, Venta_id, Cliente_id, Emprendedor_id)
        REFERENCES Contratar(Servicio_id, Venta_id, Cliente_id, Emprendedor_id) ON UPDATE CASCADE
);

CREATE TABLE DesearP (
    Producto_id INT NOT NULL REFERENCES Producto(ID) ON UPDATE CASCADE,
    Cliente_id VARCHAR(10) NOT NULL REFERENCES Cliente(RUN) ON UPDATE CASCADE,
    Lista VARCHAR(60),
    Fecha DATE NOT NULL DEFAULT CURRENT_DATE CHECK (Fecha BETWEEN DATE '1995-01-01' AND CURRENT_DATE),
    PRIMARY KEY (Producto_id, Cliente_id)
);

CREATE TABLE DesearS (
    Servicio_id INT NOT NULL REFERENCES Servicio(ID) ON UPDATE CASCADE,
    Cliente_id VARCHAR(10) NOT NULL REFERENCES Cliente(RUN) ON UPDATE CASCADE,
    Lista VARCHAR(60),
    Fecha DATE NOT NULL DEFAULT CURRENT_DATE CHECK (Fecha BETWEEN DATE '1995-01-01' AND CURRENT_DATE),
    PRIMARY KEY (Servicio_id, Cliente_id)
);

CREATE TABLE Cotizacion (
    ID INT PRIMARY KEY,
    Cliente_id VARCHAR(10) NOT NULL REFERENCES Cliente(RUN) ON UPDATE CASCADE,
    Emprendedor_id VARCHAR(10) NOT NULL REFERENCES Emprendedor(RUN) ON UPDATE CASCADE,
    Fecha DATE NOT NULL DEFAULT CURRENT_DATE CHECK (Fecha BETWEEN DATE '1995-01-01' AND CURRENT_DATE),
    UltimoAjuste DATE NOT NULL DEFAULT CURRENT_DATE,
    FechaExpiracion DATE GENERATED ALWAYS AS (Fecha + 45) STORED,
    -- Sin crear otra tabla: los elementos JSON se validan mediante trigger.
    -- Cada elemento contiene producto_id, caracteristicas_id, cantidad y precio_unitario.
    Detalle JSONB NOT NULL CHECK (jsonb_typeof(Detalle) = 'array' AND jsonb_array_length(Detalle) > 0),
    Total INT NOT NULL DEFAULT 0 CHECK (Total >= 0),
    Estado VARCHAR(30) NOT NULL DEFAULT 'Solicitada'
        CHECK (Estado IN ('Solicitada','Respondida','Aceptada por el cliente','Expirada')),
    CHECK (UltimoAjuste BETWEEN Fecha AND CURRENT_DATE)
);
