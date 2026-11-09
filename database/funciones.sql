-- Ejecutar segundo: funciones, vistas de apoyo e índices.
CREATE INDEX idx_provincia_region ON Provincia(ID_Region);
CREATE INDEX idx_comuna_provincia ON Comuna(ID_Provincia);
CREATE INDEX idx_direccion_comuna ON Direccion(Comuna_id);
CREATE INDEX idx_registrar_direccion ON Registrar(Direccion_id);
CREATE INDEX idx_venta_cliente_fecha ON Venta(Cliente_id, Fecha);
CREATE INDEX idx_venta_vendedor_fecha ON Venta(Emprendedor_id, Fecha);
CREATE INDEX idx_venta_fecha ON Venta(Fecha);
CREATE INDEX idx_comprar_venta ON Comprar(Venta_id);
CREATE INDEX idx_comprar_cliente ON Comprar(Cliente_id, Venta_id);
CREATE INDEX idx_comprar_vendedor ON Comprar(Emprendedor_id, Producto_id);
CREATE INDEX idx_contratar_venta ON Contratar(Venta_id);
CREATE INDEX idx_contratar_cliente ON Contratar(Cliente_id, Venta_id);
CREATE INDEX idx_vender_mediopago ON Vender(MedioPago_id);
CREATE INDEX idx_producto_categoria ON Producto(Categoria_id);
CREATE INDEX idx_servicio_categoria ON Servicio(Categoria_id);
CREATE INDEX idx_categoria_padre ON Categoría(Categoria_id);
CREATE INDEX idx_ofrecerp_vendedor ON OfrecerP(Emprendedor_id);
CREATE INDEX idx_ofrecers_vendedor ON OfrecerS(Emprendedor_id);
CREATE INDEX idx_calificarp_vendedor_fecha ON CalificarP(Emprendedor_id, Fecha);
CREATE INDEX idx_calificars_vendedor_fecha ON CalificarS(Emprendedor_id, Fecha);
CREATE INDEX idx_comunicarp_pregunta ON ComunicarP(Pregunta_id);
CREATE INDEX idx_comunicars_pregunta ON ComunicarS(Pregunta_id);
CREATE INDEX idx_mensajeria_respuesta ON Mensajeria(RespuestaA);
CREATE INDEX idx_cotizacion_fecha ON Cotizacion(Fecha);
CREATE INDEX idx_tienedire_direccion ON TieneDirE(Direccion_id);
CREATE INDEX idx_tienedirempresa_direccion ON TieneDirEmpresa(Direccion_id);
-- FUNCIONES, VISTAS Y CRUD COMPLETOS - PostgreSQL 15+
-- Ejecutar despues de create_tables.txt y antes de triggers.txt.
-- Las consultas de negocio excluyen ventas canceladas, salvo que se indique lo contrario.
-- Venta.Fecha es la fecha de la operacion; Vender.Fecha es la fecha de cada pago.
-- No se crea ninguna tabla en este archivo.

CREATE OR REPLACE FUNCTION fn_dv_rut(p_cuerpo TEXT)
RETURNS TEXT
LANGUAGE plpgsql IMMUTABLE
AS $func$
DECLARE v_suma INT := 0; v_factor INT := 2; v_i INT; v_dv INT;
BEGIN
    IF p_cuerpo IS NULL OR p_cuerpo !~ '^[0-9]{1,8}$' OR p_cuerpo::BIGINT = 0 THEN
        RAISE EXCEPTION 'Cuerpo de RUN/RUT invalido: %', p_cuerpo;
    END IF;
    FOR v_i IN REVERSE length(p_cuerpo)..1 LOOP
        v_suma := v_suma + substring(p_cuerpo,v_i,1)::INT * v_factor;
        v_factor := CASE WHEN v_factor = 7 THEN 2 ELSE v_factor + 1 END;
    END LOOP;
    v_dv := 11 - v_suma % 11;
    RETURN CASE v_dv WHEN 11 THEN '0' WHEN 10 THEN 'K' ELSE v_dv::TEXT END;
END;
$func$;

CREATE OR REPLACE FUNCTION fn_rut_desde_numero(p_numero BIGINT)
RETURNS VARCHAR
LANGUAGE sql IMMUTABLE
AS $func$
SELECT (p_numero::TEXT || '-' || fn_dv_rut(p_numero::TEXT))::VARCHAR
$func$;

CREATE OR REPLACE FUNCTION fn_rut_valido(p_rut TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql IMMUTABLE
AS $func$
BEGIN
    IF p_rut IS NULL OR p_rut !~ '^[0-9]{1,8}-[0-9K]$' THEN RETURN FALSE; END IF;
    RETURN split_part(p_rut,'-',2) = fn_dv_rut(split_part(p_rut,'-',1));
EXCEPTION WHEN OTHERS THEN RETURN FALSE;
END;
$func$;

CREATE OR REPLACE FUNCTION fn_correo_valido(p_correo TEXT)
RETURNS BOOLEAN
LANGUAGE sql IMMUTABLE
AS $func$
SELECT COALESCE(p_correo ~ '^[A-Za-z0-9.!#$%&''*+/=?^_`{|}~-]+@([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$', FALSE)
    AND p_correo NOT LIKE '.%' AND p_correo NOT LIKE '%..%' AND p_correo NOT LIKE '%.@%'
$func$;

CREATE OR REPLACE FUNCTION fn_numero_json(p_doc JSONB, p_clave TEXT)
RETURNS NUMERIC
LANGUAGE sql IMMUTABLE
AS $func$
SELECT CASE WHEN jsonb_typeof(p_doc -> p_clave) = 'number' THEN (p_doc ->> p_clave)::NUMERIC END
$func$;

CREATE OR REPLACE FUNCTION fn_categoria_raiz(p_categoria INT)
RETURNS INT
LANGUAGE sql STABLE
AS $func$
WITH RECURSIVE padres AS (
    SELECT c.ID,c.Categoria_id,ARRAY[c.ID] AS ruta FROM Categoría c WHERE c.ID=p_categoria
    UNION ALL
    SELECT c.ID,c.Categoria_id,p.ruta || c.ID FROM Categoría c JOIN padres p ON c.ID=p.Categoria_id
    WHERE NOT c.ID=ANY(p.ruta)
)
SELECT p.ID FROM padres p WHERE p.Categoria_id IS NULL
$func$;

CREATE OR REPLACE FUNCTION fn_categorias_descendientes(p_categoria INT)
RETURNS TABLE(categoria_id INT)
LANGUAGE sql STABLE
AS $func$
WITH RECURSIVE hijos AS (
    SELECT c.ID,ARRAY[c.ID] AS ruta FROM Categoría c WHERE c.ID=p_categoria
    UNION ALL
    SELECT c.ID,h.ruta || c.ID FROM Categoría c JOIN hijos h ON c.Categoria_id=h.ID
    WHERE NOT c.ID=ANY(h.ruta)
)
SELECT h.ID FROM hijos h
$func$;

CREATE OR REPLACE FUNCTION fn_precio_producto(p_producto INT, p_vendedor VARCHAR, p_variante INT, p_fecha DATE DEFAULT CURRENT_DATE)
RETURNS INT
LANGUAGE sql STABLE
AS $func$
SELECT COALESCE((
    SELECT o.Precio FROM OfertarP t JOIN Oferta o ON o.ID=t.Oferta_id
    WHERE t.Producto_id=op.Producto_id AND t.Emprendedor_id=op.Emprendedor_id
      AND t.Caracteristicas_id=op.Caracteristicas_id
      AND p_fecha BETWEEN t.Finicio AND COALESCE(t.Ffin,'infinity'::DATE)
    ORDER BY t.Finicio DESC LIMIT 1
),op.Precio)
FROM OfrecerP op WHERE op.Producto_id=p_producto AND op.Emprendedor_id=p_vendedor
  AND op.Caracteristicas_id=p_variante
  AND p_fecha BETWEEN op.FechaInicio AND COALESCE(op.FechaFin,'infinity'::DATE)
$func$;

CREATE OR REPLACE FUNCTION fn_precio_servicio(p_servicio INT, p_vendedor VARCHAR, p_fecha DATE DEFAULT CURRENT_DATE)
RETURNS INT
LANGUAGE sql STABLE
AS $func$
SELECT COALESCE((
    SELECT o.Precio FROM OfertarS t JOIN Oferta o ON o.ID=t.Oferta_id
    WHERE t.Servicio_id=os.Servicio_id AND t.Emprendedor_id=os.Emprendedor_id
      AND p_fecha BETWEEN t.Finicio AND COALESCE(t.Ffin,'infinity'::DATE)
    ORDER BY t.Finicio DESC LIMIT 1
),s.Precio)
FROM OfrecerS os JOIN Servicio s ON s.ID=os.Servicio_id
WHERE os.Servicio_id=p_servicio AND os.Emprendedor_id=p_vendedor
  AND p_fecha BETWEEN os.FechaInicio AND COALESCE(os.FechaFin,'infinity'::DATE)
$func$;

CREATE OR REPLACE VIEW vw_lineas_venta AS
SELECT d.*,v.Fecha,v.Estado FROM (
    SELECT 'Producto'::TEXT AS tipo_item,c.Venta_id,c.Cliente_id,c.Emprendedor_id,
           c.Producto_id AS item_id,c.Caracteristicas_id,c.Cantidad,c.PrecioUnitario,
           c.Cantidad::BIGINT*c.PrecioUnitario AS importe_linea
    FROM Comprar c
    UNION ALL
    SELECT 'Servicio',c.Venta_id,c.Cliente_id,c.Emprendedor_id,c.Servicio_id,
           NULL::INT,c.Cantidad,c.PrecioUnitario,c.Cantidad::BIGINT*c.PrecioUnitario
    FROM Contratar c
) d JOIN Venta v ON v.ID=d.Venta_id;

CREATE OR REPLACE VIEW vw_calificaciones_vendedor AS
SELECT p.Emprendedor_id,p.Cliente_id,p.Calificacion_id,p.Fecha,c.Puntaje,c.Comentario
FROM CalificarP p JOIN Calificacion c ON c.ID=p.Calificacion_id
UNION ALL
SELECT s.Emprendedor_id,s.Cliente_id,s.Calificacion_id,s.Fecha,c.Puntaje,c.Comentario
FROM CalificarS s JOIN Calificacion c ON c.ID=s.Calificacion_id;

CREATE OR REPLACE VIEW vw_comunicaciones AS
SELECT 'Producto'::TEXT AS tipo_item,p.Producto_id AS item_id,p.Mensajeria_id,
       p.Cliente_id,p.Emprendedor_id,p.Pregunta_id,m.Tiempo AS Fecha,m.Emisor,m.RespuestaA
FROM ComunicarP p JOIN Mensajeria m ON m.ID=p.Mensajeria_id
UNION ALL
SELECT 'Servicio',s.Servicio_id,s.Mensajeria_id,s.Cliente_id,s.Emprendedor_id,
       s.Pregunta_id,m.Tiempo,m.Emisor,m.RespuestaA
FROM ComunicarS s JOIN Mensajeria m ON m.ID=s.Mensajeria_id;

CREATE OR REPLACE FUNCTION fn_recalcular_venta(p_venta INT)
RETURNS VOID
LANGUAGE plpgsql VOLATILE
AS $func$
BEGIN
    UPDATE Venta SET ValorBruto=(SELECT COALESCE(SUM(l.importe_linea),0)::INT
                                 FROM vw_lineas_venta l WHERE l.Venta_id=p_venta)
    WHERE ID=p_venta;
END;
$func$;

CREATE OR REPLACE FUNCTION fn_actualizar_catalogo()
RETURNS INT
LANGUAGE plpgsql VOLATILE
AS $func$
DECLARE v_cantidad INT; v_servicios INT;
BEGIN
    UPDATE Producto SET OcultoPorInactividad=(COALESCE(UltimaVenta,FechaRegistro)<CURRENT_DATE-40)
    WHERE OcultoPorInactividad IS DISTINCT FROM (COALESCE(UltimaVenta,FechaRegistro)<CURRENT_DATE-40);
    GET DIAGNOSTICS v_cantidad=ROW_COUNT;
    UPDATE Servicio SET OcultoPorInactividad=(COALESCE(UltimaVenta,FechaRegistro)<CURRENT_DATE-40)
    WHERE OcultoPorInactividad IS DISTINCT FROM (COALESCE(UltimaVenta,FechaRegistro)<CURRENT_DATE-40);
    GET DIAGNOSTICS v_servicios=ROW_COUNT;
    RETURN v_cantidad+v_servicios;
END;
$func$;

CREATE OR REPLACE FUNCTION fn_valorar_cotizacion(p_detalle JSONB, p_vendedor VARCHAR, p_fecha DATE)
RETURNS JSONB
LANGUAGE plpgsql STABLE
AS $func$
DECLARE e JSONB; v_resultado JSONB := '[]'::JSONB; v_precio INT; v_producto INT; v_variante INT; v_cantidad INT;
BEGIN
    IF jsonb_typeof(p_detalle) IS DISTINCT FROM 'array' OR jsonb_array_length(p_detalle)=0 THEN
        RAISE EXCEPTION 'La cotizacion necesita al menos un producto';
    END IF;
    FOR e IN SELECT value FROM jsonb_array_elements(p_detalle) LOOP
        IF jsonb_typeof(e) IS DISTINCT FROM 'object'
           OR COALESCE(e->>'producto_id','') !~ '^[0-9]+$'
           OR COALESCE(e->>'caracteristicas_id','') !~ '^[0-9]+$'
           OR COALESCE(e->>'cantidad','') !~ '^[1-9][0-9]*$' THEN
            RAISE EXCEPTION 'Detalle de cotizacion invalido: %',e;
        END IF;
        v_producto := (e->>'producto_id')::INT;
        v_variante := (e->>'caracteristicas_id')::INT;
        v_cantidad := (e->>'cantidad')::INT;
        IF EXISTS (SELECT 1 FROM jsonb_array_elements(v_resultado) a
                   WHERE (a->>'producto_id')::INT=v_producto AND (a->>'caracteristicas_id')::INT=v_variante) THEN
            RAISE EXCEPTION 'Variante repetida en la cotizacion';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM OfrecerP WHERE Producto_id=v_producto
            AND Emprendedor_id=p_vendedor AND Caracteristicas_id=v_variante AND Stock>=v_cantidad) THEN
            RAISE NOTICE 'Disponibilidad insuficiente para cotizar producto %, variante %, cantidad %',v_producto,v_variante,v_cantidad;
        END IF;
        v_precio := fn_precio_producto(v_producto,p_vendedor,v_variante,p_fecha);
        IF v_precio IS NULL THEN RAISE EXCEPTION 'Producto/variante no ofrecido por el vendedor en la fecha solicitada'; END IF;
        v_resultado := v_resultado || jsonb_build_array(jsonb_build_object(
            'producto_id',v_producto,'caracteristicas_id',v_variante,
            'cantidad',v_cantidad,'precio_unitario',v_precio));
    END LOOP;
    RETURN v_resultado;
END;
$func$;

CREATE OR REPLACE FUNCTION fn_actualizar_cotizaciones()
RETURNS TABLE(actualizadas INT, eliminadas INT)
LANGUAGE plpgsql VOLATILE
AS $func$
BEGIN
    DELETE FROM Cotizacion WHERE Fecha<CURRENT_DATE-45;
    GET DIAGNOSTICS eliminadas=ROW_COUNT;
    UPDATE Cotizacion SET UltimoAjuste=CURRENT_DATE
    WHERE Fecha<CURRENT_DATE-15 AND Estado<>'Aceptada por el cliente'
      AND (UltimoAjuste<=Fecha+15 OR UltimoAjuste<=CURRENT_DATE-7);
    GET DIAGNOSTICS actualizadas=ROW_COUNT;
    RETURN NEXT;
END;
$func$;

CREATE OR REPLACE FUNCTION fn_mantenimiento()
RETURNS TABLE(cotizaciones_actualizadas INT, cotizaciones_eliminadas INT, productos_actualizados INT)
LANGUAGE plpgsql VOLATILE
AS $func$
DECLARE r RECORD;
BEGIN
    PERFORM pg_advisory_xact_lock(750802);
    SELECT * INTO r FROM fn_actualizar_cotizaciones();
    cotizaciones_actualizadas := r.actualizadas;
    cotizaciones_eliminadas := r.eliminadas;
    productos_actualizados := fn_actualizar_catalogo();
    RETURN NEXT;
END;
$func$;

CREATE OR REPLACE FUNCTION fn_auditar_ruts_masivo()
RETURNS TABLE(identificador VARCHAR, msj TEXT)
LANGUAGE sql STABLE
AS $func$
SELECT c.RUN,'Cliente: RUN/DV incorrecto'::TEXT FROM Cliente c WHERE NOT fn_rut_valido(c.RUN)
UNION ALL SELECT e.RUN,'Emprendedor: RUN/DV incorrecto' FROM Emprendedor e WHERE NOT fn_rut_valido(e.RUN)
UNION ALL SELECT e.RUT,'Empresa: RUT/DV incorrecto' FROM Empresa e WHERE NOT fn_rut_valido(e.RUT)
$func$;

-- CRUD dinamico comun para las 41 tablas del esquema.
-- Los nombres de tablas y columnas se validan contra el catalogo de PostgreSQL.
-- Los datos se reciben como objetos JSONB usando los nombres reales de columnas
-- (PostgreSQL convierte identificadores SQL sin comillas a minusculas).

CREATE OR REPLACE FUNCTION fn_crud_tabla(p_tabla TEXT)
RETURNS TEXT
LANGUAGE plpgsql STABLE
AS $func$
DECLARE v_relacion TEXT;
BEGIN
    SELECT format('%I.%I',n.nspname,c.relname)
      INTO v_relacion
      FROM pg_class c
      JOIN pg_namespace n ON n.oid=c.relnamespace
     WHERE n.nspname='public'
       AND lower(c.relname)=lower(trim(p_tabla))
       AND c.relkind IN ('r','p')
     ORDER BY c.oid
     LIMIT 1;
    IF v_relacion IS NULL THEN
        RAISE EXCEPTION 'La tabla % no existe en el esquema public',p_tabla;
    END IF;
    RETURN v_relacion;
END;
$func$;

CREATE OR REPLACE FUNCTION fn_crud_validar_campos(p_relacion TEXT,p_datos JSONB)
RETURNS VOID
LANGUAGE plpgsql STABLE
AS $func$
BEGIN
    IF p_datos IS NULL OR jsonb_typeof(p_datos)<>'object' THEN
        RAISE EXCEPTION 'Los datos deben enviarse como un objeto JSON';
    END IF;
    IF EXISTS (
        SELECT 1
          FROM jsonb_object_keys(p_datos) AS j(columna)
         WHERE NOT EXISTS (
            SELECT 1 FROM pg_attribute a
             WHERE a.attrelid=to_regclass(p_relacion)
               AND a.attnum>0 AND NOT a.attisdropped
               AND a.attname=j.columna
         )
    ) THEN
        RAISE EXCEPTION 'El objeto contiene una columna que no pertenece a %',p_relacion;
    END IF;
END;
$func$;

CREATE OR REPLACE FUNCTION fn_crud_validar_clave(p_relacion TEXT,p_clave JSONB)
RETURNS VOID
LANGUAGE plpgsql STABLE
AS $func$
DECLARE v_columnas_pk INT; v_presentes INT; v_nulos INT;
BEGIN
    PERFORM fn_crud_validar_campos(p_relacion,p_clave);
    SELECT COUNT(*)::INT,
           COUNT(*) FILTER (WHERE p_clave ? a.attname)::INT,
           COUNT(*) FILTER (WHERE NOT (p_clave ? a.attname)
                                  OR p_clave->a.attname='null'::JSONB)::INT
      INTO v_columnas_pk,v_presentes,v_nulos
      FROM pg_index i
      CROSS JOIN LATERAL unnest(i.indkey) WITH ORDINALITY AS k(attnum,orden)
      JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=k.attnum
     WHERE i.indrelid=to_regclass(p_relacion)
       AND i.indisprimary
       AND k.orden<=i.indnkeyatts;
    IF v_columnas_pk=0 THEN
        RAISE EXCEPTION 'La tabla % no tiene clave primaria; no se permite modificarla por CRUD',p_relacion;
    END IF;
    IF (SELECT COUNT(*) FROM jsonb_object_keys(p_clave))<>v_columnas_pk OR v_presentes<>v_columnas_pk THEN
        RAISE EXCEPTION 'La clave debe indicar todas y solo las columnas de la clave primaria de %',p_relacion;
    END IF;
    IF v_nulos>0 THEN
        RAISE EXCEPTION 'La clave primaria no puede contener valores nulos';
    END IF;
END;
$func$;

CREATE OR REPLACE FUNCTION fn_crud_select(p_tabla TEXT,p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB
LANGUAGE plpgsql STABLE
AS $func$
DECLARE v_relacion TEXT;
BEGIN
    v_relacion:=fn_crud_tabla(p_tabla);
    PERFORM fn_crud_validar_campos(v_relacion,COALESCE(p_filtros,'{}'::JSONB));
    IF p_limite IS NOT NULL AND p_limite<1 THEN
        RAISE EXCEPTION 'El limite debe ser mayor que cero';
    END IF;
    RETURN QUERY EXECUTE format(
        'SELECT to_jsonb(t) FROM %s AS t WHERE to_jsonb(t) @> $1 LIMIT $2',v_relacion
    ) USING COALESCE(p_filtros,'{}'::JSONB),p_limite;
END;
$func$;

CREATE OR REPLACE FUNCTION fn_crud_insert(p_tabla TEXT,p_datos JSONB)
RETURNS JSONB
LANGUAGE plpgsql VOLATILE
AS $func$
DECLARE v_relacion TEXT; v_columnas TEXT; v_valores TEXT; v_resultado JSONB;
BEGIN
    v_relacion:=fn_crud_tabla(p_tabla);
    PERFORM fn_crud_validar_campos(v_relacion,p_datos);
    SELECT string_agg(format('%I',a.attname),', ' ORDER BY a.attnum),
           string_agg(format('(jsonb_populate_record(NULL::%s,$1)).%I',v_relacion,a.attname),', ' ORDER BY a.attnum)
      INTO v_columnas,v_valores
      FROM jsonb_object_keys(p_datos) AS j(columna)
      JOIN pg_attribute a ON a.attrelid=to_regclass(v_relacion)
                         AND a.attnum>0 AND NOT a.attisdropped
                         AND a.attname=j.columna;
    IF v_columnas IS NULL THEN
        EXECUTE format('INSERT INTO %s AS t DEFAULT VALUES RETURNING to_jsonb(t)',v_relacion)
           INTO v_resultado;
    ELSE
        EXECUTE format('INSERT INTO %s AS t (%s) VALUES (%s) RETURNING to_jsonb(t)',
                       v_relacion,v_columnas,v_valores)
           INTO v_resultado USING p_datos;
    END IF;
    RETURN v_resultado;
END;
$func$;

CREATE OR REPLACE FUNCTION fn_crud_update(p_tabla TEXT,p_clave JSONB,p_cambios JSONB)
RETURNS JSONB
LANGUAGE plpgsql VOLATILE
AS $func$
DECLARE v_relacion TEXT; v_asignaciones TEXT; v_resultado JSONB;
BEGIN
    v_relacion:=fn_crud_tabla(p_tabla);
    PERFORM fn_crud_validar_clave(v_relacion,p_clave);
    PERFORM fn_crud_validar_campos(v_relacion,p_cambios);
    SELECT string_agg(
               format('%I=(jsonb_populate_record(NULL::%s,$2)).%I',a.attname,v_relacion,a.attname),
               ', ' ORDER BY a.attnum
           )
      INTO v_asignaciones
      FROM jsonb_object_keys(p_cambios) AS j(columna)
      JOIN pg_attribute a ON a.attrelid=to_regclass(v_relacion)
                         AND a.attnum>0 AND NOT a.attisdropped
                         AND a.attname=j.columna
     WHERE NOT (p_cambios->j.columna='null'::JSONB)
       AND NOT (jsonb_typeof(p_cambios->j.columna)='string'
                AND btrim(p_cambios->>j.columna)='')
       AND NOT EXISTS (
           SELECT 1
             FROM pg_index i
             CROSS JOIN LATERAL unnest(i.indkey) WITH ORDINALITY AS k(attnum,orden)
            WHERE i.indrelid=a.attrelid AND i.indisprimary
              AND k.orden<=i.indnkeyatts AND k.attnum=a.attnum
       );
    IF v_asignaciones IS NULL THEN
        EXECUTE format('SELECT to_jsonb(t) FROM %s AS t WHERE to_jsonb(t) @> $1',v_relacion)
           INTO v_resultado USING p_clave;
    ELSE
        EXECUTE format('UPDATE %s AS t SET %s WHERE to_jsonb(t) @> $1 RETURNING to_jsonb(t)',
                       v_relacion,v_asignaciones)
           INTO v_resultado USING p_clave,p_cambios;
    END IF;
    IF v_resultado IS NULL THEN
        RAISE EXCEPTION 'No existe una fila de % con la clave indicada',v_relacion;
    END IF;
    RETURN v_resultado;
END;
$func$;

CREATE OR REPLACE FUNCTION fn_crud_delete(p_tabla TEXT,p_clave JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql VOLATILE
AS $func$
DECLARE v_relacion TEXT; v_eliminado JSONB;
BEGIN
    v_relacion:=fn_crud_tabla(p_tabla);
    PERFORM fn_crud_validar_clave(v_relacion,p_clave);
    EXECUTE format('DELETE FROM %s AS t WHERE to_jsonb(t) @> $1 RETURNING to_jsonb(t)',v_relacion)
       INTO v_eliminado USING p_clave;
    RETURN v_eliminado IS NOT NULL;
END;
$func$;

-- Interfaz CRUD explicita para cada tabla. INSERT recibe un JSONB dinamico;
-- UPDATE solo aplica los valores no vacios; DELETE delega en la funcion universal.
CREATE OR REPLACE FUNCTION fn_crud_select_region(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Region',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_region(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Region',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_region(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Region',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_region(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Region',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_provincia(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Provincia',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_provincia(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Provincia',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_provincia(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Provincia',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_provincia(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Provincia',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_comuna(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Comuna',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_comuna(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Comuna',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_comuna(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Comuna',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_comuna(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Comuna',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_empresa(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Empresa',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_empresa(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Empresa',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_empresa(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Empresa',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_empresa(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Empresa',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_emprendedor(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Emprendedor',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_emprendedor(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Emprendedor',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_emprendedor(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Emprendedor',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_emprendedor(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Emprendedor',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_cliente(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Cliente',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_cliente(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Cliente',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_cliente(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Cliente',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_cliente(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Cliente',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_calificacion(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Calificacion',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_calificacion(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Calificacion',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_calificacion(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Calificacion',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_calificacion(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Calificacion',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_direccion(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Direccion',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_direccion(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Direccion',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_direccion(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Direccion',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_direccion(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Direccion',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_telefono(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Telefono',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_telefono(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Telefono',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_telefono(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Telefono',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_telefono(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Telefono',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_correo(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Correo',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_correo(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Correo',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_correo(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Correo',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_correo(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Correo',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_registrar(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Registrar',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_registrar(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Registrar',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_registrar(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Registrar',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_registrar(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Registrar',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_tienedirempresa(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('TieneDirEmpresa',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_tienedirempresa(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('TieneDirEmpresa',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_tienedirempresa(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('TieneDirEmpresa',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_tienedirempresa(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('TieneDirEmpresa',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_tienedire(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('TieneDirE',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_tienedire(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('TieneDirE',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_tienedire(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('TieneDirE',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_tienedire(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('TieneDirE',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_envio(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Envio',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_envio(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Envio',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_envio(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Envio',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_envio(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Envio',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_venta(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Venta',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_venta(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Venta',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_venta(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Venta',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_venta(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Venta',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_mediopago(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('MedioPago',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_mediopago(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('MedioPago',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_mediopago(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('MedioPago',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_mediopago(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('MedioPago',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_oferta(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Oferta',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_oferta(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Oferta',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_oferta(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Oferta',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_oferta(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Oferta',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_categoria(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Categoría',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_categoria(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Categoría',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_categoria(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Categoría',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_categoria(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Categoría',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_producto(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Producto',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_producto(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Producto',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_producto(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Producto',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_producto(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Producto',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_servicio(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Servicio',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_servicio(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Servicio',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_servicio(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Servicio',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_servicio(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Servicio',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_caracteristicas(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Caracteristicas',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_caracteristicas(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Caracteristicas',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_caracteristicas(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Caracteristicas',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_caracteristicas(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Caracteristicas',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_poseer(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Poseer',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_poseer(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Poseer',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_poseer(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Poseer',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_poseer(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Poseer',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_ofrecerp(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('OfrecerP',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_ofrecerp(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('OfrecerP',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_ofrecerp(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('OfrecerP',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_ofrecerp(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('OfrecerP',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_ofrecers(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('OfrecerS',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_ofrecers(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('OfrecerS',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_ofrecers(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('OfrecerS',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_ofrecers(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('OfrecerS',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_ofertarp(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('OfertarP',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_ofertarp(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('OfertarP',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_ofertarp(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('OfertarP',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_ofertarp(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('OfertarP',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_ofertars(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('OfertarS',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_ofertars(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('OfertarS',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_ofertars(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('OfertarS',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_ofertars(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('OfertarS',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_devolucion(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Devolucion',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_devolucion(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Devolucion',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_devolucion(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Devolucion',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_devolucion(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Devolucion',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_comprar(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Comprar',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_comprar(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Comprar',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_comprar(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Comprar',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_comprar(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Comprar',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_contratar(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Contratar',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_contratar(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Contratar',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_contratar(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Contratar',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_contratar(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Contratar',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_vender(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Vender',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_vender(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Vender',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_vender(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Vender',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_vender(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Vender',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_pregunta(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Pregunta',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_pregunta(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Pregunta',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_pregunta(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Pregunta',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_pregunta(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Pregunta',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_preguntarp(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('PreguntarP',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_preguntarp(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('PreguntarP',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_preguntarp(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('PreguntarP',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_preguntarp(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('PreguntarP',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_preguntars(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('PreguntarS',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_preguntars(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('PreguntarS',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_preguntars(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('PreguntarS',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_preguntars(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('PreguntarS',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_mensajeria(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Mensajeria',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_mensajeria(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Mensajeria',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_mensajeria(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Mensajeria',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_mensajeria(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Mensajeria',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_comunicarp(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('ComunicarP',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_comunicarp(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('ComunicarP',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_comunicarp(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('ComunicarP',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_comunicarp(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('ComunicarP',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_comunicars(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('ComunicarS',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_comunicars(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('ComunicarS',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_comunicars(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('ComunicarS',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_comunicars(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('ComunicarS',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_calificarp(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('CalificarP',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_calificarp(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('CalificarP',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_calificarp(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('CalificarP',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_calificarp(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('CalificarP',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_calificars(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('CalificarS',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_calificars(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('CalificarS',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_calificars(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('CalificarS',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_calificars(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('CalificarS',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_desearp(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('DesearP',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_desearp(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('DesearP',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_desearp(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('DesearP',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_desearp(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('DesearP',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_desears(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('DesearS',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_desears(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('DesearS',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_desears(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('DesearS',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_desears(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('DesearS',p_clave)
$crud$;

CREATE OR REPLACE FUNCTION fn_crud_select_cotizacion(p_filtros JSONB DEFAULT '{}'::JSONB,p_limite INTEGER DEFAULT NULL)
RETURNS SETOF JSONB LANGUAGE SQL STABLE AS $crud$
    SELECT * FROM fn_crud_select('Cotizacion',p_filtros,p_limite)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_insert_cotizacion(p_datos JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_insert('Cotizacion',p_datos)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_update_cotizacion(p_clave JSONB,p_cambios JSONB)
RETURNS JSONB LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_update('Cotizacion',p_clave,p_cambios)
$crud$;
CREATE OR REPLACE FUNCTION fn_crud_delete_cotizacion(p_clave JSONB)
RETURNS BOOLEAN LANGUAGE SQL VOLATILE AS $crud$
    SELECT fn_crud_delete('Cotizacion',p_clave)
$crud$;

-- Nombres anteriores conservados como compatibilidad para las cinco bajas existentes.
CREATE OR REPLACE FUNCTION fn_delete_region(p_id TEXT)
RETURNS VOID LANGUAGE plpgsql VOLATILE AS $func$
BEGIN
    IF NOT fn_crud_delete('Region',jsonb_build_object('id',p_id::INT)) THEN
        RAISE NOTICE 'No existe el registro % en region',p_id;
    END IF;
END;
$func$;
CREATE OR REPLACE FUNCTION fn_delete_cliente(p_id TEXT)
RETURNS VOID LANGUAGE plpgsql VOLATILE AS $func$
BEGIN
    IF NOT fn_crud_delete('Cliente',jsonb_build_object('run',p_id::VARCHAR)) THEN
        RAISE NOTICE 'No existe el registro % en cliente',p_id;
    END IF;
END;
$func$;
CREATE OR REPLACE FUNCTION fn_delete_empresa(p_id TEXT)
RETURNS VOID LANGUAGE plpgsql VOLATILE AS $func$
BEGIN
    IF NOT fn_crud_delete('Empresa',jsonb_build_object('rut',p_id::VARCHAR)) THEN
        RAISE NOTICE 'No existe el registro % en empresa',p_id;
    END IF;
END;
$func$;
CREATE OR REPLACE FUNCTION fn_delete_producto(p_id TEXT)
RETURNS VOID LANGUAGE plpgsql VOLATILE AS $func$
BEGIN
    IF NOT fn_crud_delete('Producto',jsonb_build_object('id',p_id::INT)) THEN
        RAISE NOTICE 'No existe el registro % en producto',p_id;
    END IF;
END;
$func$;
CREATE OR REPLACE FUNCTION fn_delete_venta(p_id TEXT)
RETURNS VOID LANGUAGE plpgsql VOLATILE AS $func$
BEGIN
    IF NOT fn_crud_delete('Venta',jsonb_build_object('id',p_id::INT)) THEN
        RAISE NOTICE 'No existe el registro % en venta',p_id;
    END IF;
END;
$func$;

-- GRUPO 1. Consolidacion temporal y volumetria

CREATE OR REPLACE FUNCTION fn_cant_clientes_compraron_producto(p_producto VARCHAR, p_f_inicio DATE, p_f_fin DATE)
RETURNS INT
LANGUAGE sql STABLE
AS $func$
SELECT COUNT(DISTINCT c.Cliente_id)::INT FROM Comprar c JOIN Producto p ON p.ID=c.Producto_id JOIN Venta v ON v.ID=c.Venta_id
WHERE p.Nombre ILIKE '%' || p_producto || '%' AND v.Estado<>'Cancelada'
  AND v.Fecha BETWEEN p_f_inicio AND p_f_fin
$func$;

CREATE OR REPLACE FUNCTION fn_clientes_compraron_producto(p_producto VARCHAR, p_f_inicio DATE, p_f_fin DATE,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(run_cliente VARCHAR, nombre_cliente VARCHAR, apellido_cliente VARCHAR)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT DISTINCT cl.RUN,cl.Nombre,cl.Apellido FROM Comprar c JOIN Producto p ON p.ID=c.Producto_id JOIN Venta v ON v.ID=c.Venta_id
JOIN Cliente cl ON cl.RUN=c.Cliente_id WHERE p.Nombre ILIKE '%' || p_producto || '%' AND v.Estado<>'Cancelada'
  AND v.Fecha BETWEEN p_f_inicio AND p_f_fin
) AS resultado(run_cliente, nombre_cliente, apellido_cliente)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_cant_clientes_compraron_servicio(p_servicio VARCHAR, p_f_inicio DATE, p_f_fin DATE)
RETURNS INT
LANGUAGE sql STABLE
AS $func$
SELECT COUNT(DISTINCT c.Cliente_id)::INT FROM Contratar c JOIN Servicio p ON p.ID=c.Servicio_id JOIN Venta v ON v.ID=c.Venta_id
WHERE p.Nombre ILIKE '%' || p_servicio || '%' AND v.Estado<>'Cancelada'
  AND v.Fecha BETWEEN p_f_inicio AND p_f_fin
$func$;

CREATE OR REPLACE FUNCTION fn_clientes_compraron_servicio(p_servicio VARCHAR, p_f_inicio DATE, p_f_fin DATE,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(run_cliente VARCHAR, nombre_cliente VARCHAR, apellido_cliente VARCHAR)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT DISTINCT cl.RUN,cl.Nombre,cl.Apellido FROM Contratar c JOIN Servicio p ON p.ID=c.Servicio_id JOIN Venta v ON v.ID=c.Venta_id
JOIN Cliente cl ON cl.RUN=c.Cliente_id WHERE p.Nombre ILIKE '%' || p_servicio || '%' AND v.Estado<>'Cancelada'
  AND v.Fecha BETWEEN p_f_inicio AND p_f_fin
) AS resultado(run_cliente, nombre_cliente, apellido_cliente)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_compras_mes_actual_cliente(p_run_cliente VARCHAR,
    p_fecha_referencia DATE DEFAULT CURRENT_DATE,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(run VARCHAR, total_compras BIGINT, total_pagado NUMERIC, corresponde_descuento BOOLEAN)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT c.RUN,COUNT(v.ID),COALESCE(SUM(v.Total),0)::NUMERIC,COUNT(v.ID)>5
FROM Cliente c LEFT JOIN Venta v ON v.Cliente_id=c.RUN AND v.Estado<>'Cancelada'
 AND v.Fecha>=date_trunc('month',p_fecha_referencia)::DATE
 AND v.Fecha<(date_trunc('month',p_fecha_referencia)+INTERVAL '1 month')::DATE
 AND EXISTS (SELECT 1 FROM vw_lineas_venta l WHERE l.Venta_id=v.ID)
WHERE c.RUN=p_run_cliente GROUP BY c.RUN
) AS resultado(run, total_compras, total_pagado, corresponde_descuento)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_ventas_mes_articulo_vendedor(p_fecha_referencia DATE DEFAULT CURRENT_DATE,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(vendedor_run VARCHAR, producto_id INT, producto_nombre VARCHAR, total_ventas BIGINT, importe_neto NUMERIC, es_total_vendedor BOOLEAN)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT l.Emprendedor_id,l.item_id,
       CASE WHEN GROUPING(l.item_id)=1 THEN 'TOTAL VENDEDOR' ELSE MAX(p.Nombre) END::VARCHAR,
       SUM(l.Cantidad)::BIGINT,SUM(l.importe_linea)::NUMERIC,GROUPING(l.item_id)=1
FROM vw_lineas_venta l JOIN Producto p ON l.item_id=p.ID
WHERE l.tipo_item='Producto' AND l.Estado<>'Cancelada'
 AND l.Fecha>=date_trunc('month',p_fecha_referencia)::DATE
 AND l.Fecha<(date_trunc('month',p_fecha_referencia)+INTERVAL '1 month')::DATE
GROUP BY GROUPING SETS ((l.Emprendedor_id,l.item_id),(l.Emprendedor_id))
ORDER BY l.Emprendedor_id,GROUPING(l.item_id),l.item_id
) AS resultado(vendedor_run, producto_id, producto_nombre, total_ventas, importe_neto, es_total_vendedor)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_volumen_ventas_fin_semana_vs_habiles(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(tipo_dia TEXT, cantidad_ventas BIGINT, total_monto NUMERIC)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT CASE WHEN EXTRACT(ISODOW FROM v.Fecha) IN (6,7) THEN 'Fin de semana' ELSE 'Día hábil' END,COUNT(*),SUM(v.Total)::NUMERIC FROM Venta v WHERE v.Estado<>'Cancelada' GROUP BY 1
) AS resultado(tipo_dia, cantidad_ventas, total_monto)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_variacion_porcentual_ingresos_mensual(p_fecha_referencia DATE DEFAULT CURRENT_DATE,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(mes_actual_monto NUMERIC, mes_anterior_monto NUMERIC, variacion_porcentual NUMERIC)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
WITH montos AS (
 SELECT COALESCE(SUM(v.Total) FILTER (WHERE v.Fecha>=date_trunc('month',p_fecha_referencia)::DATE),0)::NUMERIC AS actual,
        COALESCE(SUM(v.Total) FILTER (WHERE v.Fecha<date_trunc('month',p_fecha_referencia)::DATE),0)::NUMERIC AS anterior
 FROM Venta v WHERE v.Estado<>'Cancelada'
  AND v.Fecha>=(date_trunc('month',p_fecha_referencia)-INTERVAL '1 month')::DATE AND v.Fecha<=p_fecha_referencia
)
SELECT m.actual,m.anterior,ROUND(100*(m.actual-m.anterior)/NULLIF(m.anterior,0),2) FROM montos m
) AS resultado(mes_actual_monto, mes_anterior_monto, variacion_porcentual)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_ventas_ultimo_trimestre_con_descuento(p_fecha_referencia DATE DEFAULT CURRENT_DATE,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(venta_id INT, valor_bruto INT, descuento INT, total INT, fecha DATE)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT v.ID,v.ValorBruto,v.Descuento,v.Total,v.Fecha FROM Venta v WHERE v.Estado<>'Cancelada' AND v.Descuento>0 AND v.Fecha BETWEEN (p_fecha_referencia-INTERVAL '3 months')::DATE AND p_fecha_referencia
) AS resultado(venta_id, valor_bruto, descuento, total, fecha)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

-- GRUPO 2. Georreferenciacion y logistica

CREATE OR REPLACE FUNCTION fn_ciudades_contrataron_servicio(p_servicio VARCHAR,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(comuna_id INT, comuna_nombre VARCHAR)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT DISTINCT cm.ID,cm.Nombre FROM Contratar ct JOIN Servicio s ON s.ID=ct.Servicio_id JOIN Venta v ON v.ID=ct.Venta_id JOIN Direccion d ON d.ID=ct.Direccion_id JOIN Comuna cm ON cm.ID=d.Comuna_id WHERE s.Nombre ILIKE '%'||p_servicio||'%' AND v.Estado<>'Cancelada'
) AS resultado(comuna_id, comuna_nombre)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_ciudades_despachado_producto(p_producto VARCHAR,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(comuna_id INT, comuna_nombre VARCHAR)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT DISTINCT cm.ID,cm.Nombre FROM Comprar c JOIN Producto p ON p.ID=c.Producto_id JOIN Venta v ON v.ID=c.Venta_id JOIN Envio e ON e.Seguimiento=v.Despacho JOIN Direccion d ON d.ID=e.Direccion_id JOIN Comuna cm ON cm.ID=d.Comuna_id WHERE p.Nombre ILIKE '%'||p_producto||'%' AND v.Estado IN ('Despachado','En reparto','Entregado','Recibido')
) AS resultado(comuna_id, comuna_nombre)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_productos_vendedor_despacho_pendiente(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(vendedor_run VARCHAR, producto_id INT, producto_nombre VARCHAR, venta_id INT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT DISTINCT v.Emprendedor_id,p.ID,p.Nombre,v.ID FROM Venta v JOIN Comprar c ON c.Venta_id=v.ID JOIN Producto p ON p.ID=c.Producto_id WHERE v.Estado='En Preparación' AND v.Despacho IS NOT NULL
) AS resultado(vendedor_run, producto_id, producto_nombre, venta_id)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_tiempo_promedio_transito_logistico(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(empresa_transporte VARCHAR, dias_promedio NUMERIC)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT e.Empresa,ROUND(AVG(e.FechaLlegada-e.FechaSalida),2) FROM Envio e WHERE e.FechaLlegada IS NOT NULL AND e.Estado='Entregado' GROUP BY e.Empresa
) AS resultado(empresa_transporte, dias_promedio)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_regiones_mayor_volumen_envios_pesados(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(region_id INT, region_nombre VARCHAR, total_envios BIGINT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT r.ID,r.Nombre,COUNT(*) FROM Venta v JOIN Envio e ON e.Seguimiento=v.Despacho JOIN Direccion d ON d.ID=e.Direccion_id JOIN Comuna cm ON cm.ID=d.Comuna_id JOIN Provincia pr ON pr.ID=cm.ID_Provincia JOIN Region r ON r.ID=pr.ID_Region WHERE v.Estado<>'Cancelada' AND e.Peso>10 GROUP BY r.ID,r.Nombre ORDER BY COUNT(*) DESC
) AS resultado(region_id, region_nombre, total_envios)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_costo_envio_proyectado(p_seguimiento INT)
RETURNS NUMERIC
LANGUAGE sql STABLE
AS $func$
SELECT ROUND(2000+e.Altura*e.Ancho*e.Fondo*0.25,0) FROM Envio e WHERE e.Seguimiento=p_seguimiento
$func$;

CREATE OR REPLACE FUNCTION fn_comunas_clientes_despacho_sin_pasaje_sector(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(comuna_id INT, comuna_nombre VARCHAR)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT DISTINCT cm.ID,cm.Nombre FROM Venta v JOIN Envio e ON e.Seguimiento=v.Despacho JOIN Direccion d ON d.ID=e.Direccion_id JOIN Comuna cm ON cm.ID=d.Comuna_id WHERE v.Estado<>'Cancelada' AND (NULLIF(trim(d.Pasaje),'') IS NULL OR NULLIF(trim(d.Sector),'') IS NULL)
) AS resultado(comuna_id, comuna_nombre)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

-- GRUPO 3. Fidelizacion y valoraciones

CREATE OR REPLACE FUNCTION fn_producto_mas_vendido_por_vendedor(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(vendedor_run VARCHAR, producto_id INT, producto_nombre VARCHAR, cantidad_vendida BIGINT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
WITH cantidades AS (
 SELECT l.Emprendedor_id,l.item_id,SUM(l.Cantidad)::BIGINT AS cantidad,
        DENSE_RANK() OVER (PARTITION BY l.Emprendedor_id ORDER BY SUM(l.Cantidad) DESC) AS posicion
 FROM vw_lineas_venta l WHERE l.tipo_item='Producto' AND l.Estado<>'Cancelada' GROUP BY l.Emprendedor_id,l.item_id
)
SELECT c.Emprendedor_id,p.ID,p.Nombre,c.cantidad FROM cantidades c JOIN Producto p ON p.ID=c.item_id WHERE c.posicion=1
) AS resultado(vendedor_run, producto_id, producto_nombre, cantidad_vendida)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_servicio_mas_contratado_por_vendedor(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(vendedor_run VARCHAR, servicio_id INT, servicio_nombre VARCHAR, cantidad_contratada BIGINT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
WITH cantidades AS (
 SELECT l.Emprendedor_id,l.item_id,SUM(l.Cantidad)::BIGINT AS cantidad,
        DENSE_RANK() OVER (PARTITION BY l.Emprendedor_id ORDER BY SUM(l.Cantidad) DESC) AS posicion
 FROM vw_lineas_venta l WHERE l.tipo_item='Servicio' AND l.Estado<>'Cancelada' GROUP BY l.Emprendedor_id,l.item_id
)
SELECT c.Emprendedor_id,p.ID,p.Nombre,c.cantidad FROM cantidades c JOIN Servicio p ON p.ID=c.item_id WHERE c.posicion=1
) AS resultado(vendedor_run, servicio_id, servicio_nombre, cantidad_contratada)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_consultas_sin_responder_producto(p_producto_id INT)
RETURNS INT
LANGUAGE sql STABLE
AS $func$
SELECT COUNT(*)::INT FROM PreguntarP p WHERE p.Producto_id=p_producto_id AND NOT EXISTS (SELECT 1 FROM ComunicarP r JOIN Mensajeria m ON m.ID=r.Mensajeria_id WHERE r.Pregunta_id=p.Pregunta_id AND m.Emisor='Emprendedor')
$func$;

CREATE OR REPLACE FUNCTION fn_productos_vendedor_calificacion_alta(p_run_vendedor VARCHAR,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(producto_id INT, producto_nombre VARCHAR, promedio_puntaje NUMERIC)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT p.ID,p.Nombre,ROUND(AVG(c.Puntaje),2) FROM CalificarP cp JOIN Producto p ON p.ID=cp.Producto_id JOIN Calificacion c ON c.ID=cp.Calificacion_id WHERE cp.Emprendedor_id=p_run_vendedor GROUP BY p.ID,p.Nombre HAVING AVG(c.Puntaje)>=4
) AS resultado(producto_id, producto_nombre, promedio_puntaje)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_emprendedores_promedio_calificacion_baja(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(vendedor_run VARCHAR, promedio_puntaje NUMERIC)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT v.Emprendedor_id,ROUND(AVG(v.Puntaje),2) FROM vw_calificaciones_vendedor v GROUP BY v.Emprendedor_id HAVING AVG(v.Puntaje)<3
) AS resultado(vendedor_run, promedio_puntaje)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_emprendedores_sin_calificacion_ultimo_semestre(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(vendedor_run VARCHAR, nombre VARCHAR, apellido VARCHAR)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT e.RUN,e.Nombre,e.Apellido FROM Emprendedor e WHERE EXISTS (SELECT 1 FROM OfrecerS os WHERE os.Emprendedor_id=e.RUN) AND NOT EXISTS (SELECT 1 FROM CalificarS cs WHERE cs.Emprendedor_id=e.RUN AND cs.Fecha>=LOCALTIMESTAMP-INTERVAL '6 months')
) AS resultado(vendedor_run, nombre, apellido)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_reseñas_clave_calidad(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(calificacion_id INT, comentario TEXT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT c.ID,c.Comentario FROM Calificacion c WHERE c.Comentario ILIKE ANY (ARRAY['%excelente%','%recomendado%','%deficiente%'])
) AS resultado(calificacion_id, comentario)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_clientes_mas_diez_calificaciones(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(cliente_run VARCHAR, cliente_nombre VARCHAR, cliente_apellido VARCHAR, total_calificaciones BIGINT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT c.RUN,c.Nombre,c.Apellido,COUNT(*) FROM Cliente c JOIN vw_calificaciones_vendedor v ON v.Cliente_id=c.RUN GROUP BY c.RUN,c.Nombre,c.Apellido HAVING COUNT(*)>10 ORDER BY COUNT(*) DESC
) AS resultado(cliente_run, cliente_nombre, cliente_apellido, total_calificaciones)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_tiempo_promedio_respuesta_preguntas(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(vendedor_run VARCHAR, horas_promedio NUMERIC)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
WITH preguntas AS (
 SELECT p.Pregunta_id,p.Emprendedor_id,q.Tiempo FROM PreguntarP p JOIN Pregunta q ON q.ID=p.Pregunta_id
 UNION ALL SELECT p.Pregunta_id,p.Emprendedor_id,q.Tiempo FROM PreguntarS p JOIN Pregunta q ON q.ID=p.Pregunta_id
), respuestas AS (
 SELECT p.Pregunta_id,p.Emprendedor_id,p.Tiempo,MIN(c.Fecha) AS respuesta
 FROM preguntas p JOIN vw_comunicaciones c ON c.Pregunta_id=p.Pregunta_id
 WHERE c.Emisor='Emprendedor' AND c.Fecha>=p.Tiempo GROUP BY p.Pregunta_id,p.Emprendedor_id,p.Tiempo
)
SELECT r.Emprendedor_id,ROUND(AVG(EXTRACT(EPOCH FROM (r.respuesta-r.Tiempo))/3600),2)
FROM respuestas r GROUP BY r.Emprendedor_id
) AS resultado(vendedor_run, horas_promedio)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_mensajeria_sin_replica_48h(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(mensajeria_id INT, cliente_id VARCHAR, emprendedor_id VARCHAR, fecha TIMESTAMP)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT c.Mensajeria_id,c.Cliente_id,c.Emprendedor_id,c.Fecha FROM vw_comunicaciones c
WHERE c.Pregunta_id IS NULL AND c.Fecha<LOCALTIMESTAMP-INTERVAL '48 hours'
 AND NOT EXISTS (SELECT 1 FROM vw_comunicaciones r WHERE r.RespuestaA=c.Mensajeria_id
   AND r.tipo_item=c.tipo_item AND r.item_id=c.item_id AND r.Cliente_id=c.Cliente_id
   AND r.Emprendedor_id=c.Emprendedor_id AND r.Emisor<>c.Emisor AND r.Fecha>=c.Fecha)
) AS resultado(mensajeria_id, cliente_id, emprendedor_id, fecha)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

-- GRUPO 4. Atributos JSON

CREATE OR REPLACE FUNCTION fn_json_material_principal_vestuario(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(producto_id INT, nombre VARCHAR, material_principal TEXT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT p.ID,p.Nombre,p.Descripción->>'Material principal' FROM Producto p WHERE EXISTS (SELECT 1 FROM Categoría c WHERE c.Nombre ILIKE '%Vestuario%' AND p.Categoria_id IN (SELECT d.categoria_id FROM fn_categorias_descendientes(c.ID) d))
) AS resultado(producto_id, nombre, material_principal)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_json_servicios_modalidad_remoto(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(servicio_id INT, nombre VARCHAR, modalidad TEXT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT s.ID,s.Nombre,s.Descripcion->>'Modalidad' FROM Servicio s WHERE s.Descripcion->>'Modalidad' ILIKE 'Remoto'
) AS resultado(servicio_id, nombre, modalidad)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_json_peso_promedio_inventario(p_fecha_referencia DATE DEFAULT CURRENT_DATE)
RETURNS NUMERIC
LANGUAGE sql STABLE
AS $func$
SELECT ROUND(AVG(fn_numero_json(p.Descripción,'Peso')),2) FROM Producto p WHERE p.Activo AND NOT p.OcultoPorInactividad AND EXISTS (SELECT 1 FROM OfrecerP op WHERE op.Producto_id=p.ID AND op.Stock>0 AND p_fecha_referencia BETWEEN op.FechaInicio AND COALESCE(op.FechaFin,'infinity'::DATE))
$func$;

CREATE OR REPLACE FUNCTION fn_json_productos_tecno_sin_garantia(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(producto_id INT, nombre VARCHAR)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT p.ID,p.Nombre FROM Producto p WHERE NOT p.Descripción ? 'Garantía' AND p.Categoria_id IN (SELECT d.categoria_id FROM Categoría c CROSS JOIN LATERAL fn_categorias_descendientes(c.ID) d WHERE c.Nombre ILIKE '%Tecnolog%')
) AS resultado(producto_id, nombre)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE VIEW vw_variantes_json AS
SELECT p.ID AS producto_id,p.Nombre AS producto_nombre,v.value->>'Color' AS color,v.value->>'Talla' AS talla,p.Descripción->>'Material principal' AS material FROM Producto p CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(p.Descripción->'Variantes')='array' THEN p.Descripción->'Variantes' ELSE jsonb_build_array(p.Descripción) END) v;

CREATE OR REPLACE FUNCTION fn_vista_desnormalizar_variantes_json(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(producto_id INT, producto_nombre VARCHAR, color TEXT, talla TEXT, material TEXT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT v.producto_id,v.producto_nombre,v.color,v.talla,v.material FROM vw_variantes_json v
) AS resultado(producto_id, producto_nombre, color, talla, material)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_json_productos_exceden_volumen_logistico(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(producto_id INT, nombre VARCHAR, volumen NUMERIC)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT p.ID,p.Nombre,fn_numero_json(p.Descripción,'Ancho')*fn_numero_json(p.Descripción,'Alto')*fn_numero_json(p.Descripción,'Fondo') FROM Producto p WHERE fn_numero_json(p.Descripción,'Ancho')*fn_numero_json(p.Descripción,'Alto')*fn_numero_json(p.Descripción,'Fondo')>50000
) AS resultado(producto_id, nombre, volumen)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

-- GRUPO 5. Conjuntos y consultas correlacionadas

CREATE OR REPLACE FUNCTION fn_servicios_no_contratados_mes(p_mes INT, p_anio INT,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(servicio_id INT, nombre VARCHAR)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT s.ID,s.Nombre FROM Servicio s WHERE NOT EXISTS (
 SELECT 1 FROM Contratar c JOIN Venta v ON v.ID=c.Venta_id WHERE c.Servicio_id=s.ID AND v.Estado<>'Cancelada'
 AND v.Fecha>=make_date(p_anio,p_mes,1) AND v.Fecha<(make_date(p_anio,p_mes,1)+INTERVAL '1 month')::DATE)
) AS resultado(servicio_id, nombre)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_total_pedidos_vendedor_categoria(p_vendedor_id VARCHAR, p_categoria_id INT)
RETURNS BIGINT
LANGUAGE sql STABLE
AS $func$
SELECT COUNT(DISTINCT l.Venta_id) FROM vw_lineas_venta l
WHERE l.Emprendedor_id=p_vendedor_id AND l.Estado<>'Cancelada' AND (
 (l.tipo_item='Producto' AND EXISTS (SELECT 1 FROM Producto p WHERE p.ID=l.item_id AND p.Categoria_id IN (SELECT d.categoria_id FROM fn_categorias_descendientes(p_categoria_id) d)))
 OR (l.tipo_item='Servicio' AND EXISTS (SELECT 1 FROM Servicio s WHERE s.ID=l.item_id AND s.Categoria_id IN (SELECT d.categoria_id FROM fn_categorias_descendientes(p_categoria_id) d))))
$func$;

CREATE OR REPLACE FUNCTION fn_clientes_vendedor_negocio(p_vendedor_id VARCHAR,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(cliente_run VARCHAR, cliente_nombre VARCHAR, cliente_apellido VARCHAR)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT DISTINCT c.RUN,c.Nombre,c.Apellido FROM Cliente c JOIN Venta v ON v.Cliente_id=c.RUN WHERE v.Emprendedor_id=p_vendedor_id AND v.Estado<>'Cancelada'
) AS resultado(cliente_run, cliente_nombre, cliente_apellido)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_usuarios_rol_dual_cliente_emprendedor(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(run VARCHAR, nombre VARCHAR, apellido VARCHAR)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT c.RUN,c.Nombre,c.Apellido FROM Cliente c WHERE EXISTS (SELECT 1 FROM Emprendedor e WHERE e.RUN=c.RUN)
) AS resultado(run, nombre, apellido)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_clientes_wishlist_sin_compras(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(cliente_run VARCHAR, cliente_nombre VARCHAR, cliente_apellido VARCHAR)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT c.RUN,c.Nombre,c.Apellido FROM Cliente c WHERE (EXISTS (SELECT 1 FROM DesearP d WHERE d.Cliente_id=c.RUN) OR EXISTS (SELECT 1 FROM DesearS d WHERE d.Cliente_id=c.RUN)) AND c.RUN NOT IN (SELECT v.Cliente_id FROM Venta v WHERE v.Estado<>'Cancelada')
) AS resultado(cliente_run, cliente_nombre, cliente_apellido)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_categorias_principales_sin_subcategorias_ni_productos(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(categoria_id INT, nombre VARCHAR)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT c.ID,c.Nombre FROM Categoría c WHERE c.Categoria_id IS NULL AND NOT EXISTS (SELECT 1 FROM Categoría h WHERE h.Categoria_id=c.ID) AND NOT EXISTS (SELECT 1 FROM Producto p WHERE p.Categoria_id=c.ID)
) AS resultado(categoria_id, nombre)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_clientes_compraron_todas_categorias(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(cliente_run VARCHAR, cliente_nombre VARCHAR, cliente_apellido VARCHAR)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
WITH principales AS (
 SELECT DISTINCT fn_categoria_raiz(p.Categoria_id) AS ID FROM Producto p WHERE p.Activo
)
SELECT c.RUN,c.Nombre,c.Apellido FROM Cliente c
WHERE EXISTS (SELECT 1 FROM principales) AND NOT EXISTS (
 SELECT 1 FROM principales k WHERE NOT EXISTS (
  SELECT 1 FROM Comprar co JOIN Producto p ON p.ID=co.Producto_id JOIN Venta v ON v.ID=co.Venta_id
  WHERE co.Cliente_id=c.RUN AND v.Estado<>'Cancelada' AND fn_categoria_raiz(p.Categoria_id)=k.ID))
) AS resultado(cliente_run, cliente_nombre, cliente_apellido)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_servicios_multiples_regiones(p_fecha_referencia DATE DEFAULT CURRENT_DATE,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(servicio_id INT, servicio_nombre VARCHAR, cantidad_regiones BIGINT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT s.ID,s.Nombre,COUNT(DISTINCT pr.ID_Region) FROM Servicio s JOIN OfrecerS os ON os.Servicio_id=s.ID JOIN TieneDirE t ON t.Emprendedor_id=os.Emprendedor_id JOIN Direccion d ON d.ID=t.Direccion_id JOIN Comuna c ON c.ID=d.Comuna_id JOIN Provincia pr ON pr.ID=c.ID_Provincia WHERE p_fecha_referencia BETWEEN os.FechaInicio AND COALESCE(os.FechaFin,'infinity'::DATE) GROUP BY s.ID,s.Nombre HAVING COUNT(DISTINCT pr.ID_Region)>1
) AS resultado(servicio_id, servicio_nombre, cantidad_regiones)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_productos_frecuentemente_juntos(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(producto1_id INT, producto2_id INT, veces_juntos BIGINT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT a.Producto_id,b.Producto_id,COUNT(DISTINCT a.Venta_id) FROM Comprar a JOIN Comprar b ON a.Venta_id=b.Venta_id AND a.Producto_id<b.Producto_id JOIN Venta v ON v.ID=a.Venta_id WHERE v.Estado<>'Cancelada' GROUP BY a.Producto_id,b.Producto_id ORDER BY COUNT(DISTINCT a.Venta_id) DESC
) AS resultado(producto1_id, producto2_id, veces_juntos)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

-- GRUPO 6. Inventario y finanzas

CREATE OR REPLACE FUNCTION fn_productos_devoluciones_por_cliente(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(cliente_id VARCHAR, producto_id INT, motivo TEXT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT c.Cliente_id,c.Producto_id,d.Motivo FROM Comprar c JOIN Devolucion d ON d.ID=c.Devolucion_id
) AS resultado(cliente_id, producto_id, motivo)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_productos_ofertas_vigentes(p_fecha_referencia DATE DEFAULT CURRENT_DATE,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(producto_id INT, producto_nombre VARCHAR, precio_original INT, precio_oferta INT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT p.ID,p.Nombre,op.Precio,o.Precio FROM Producto p JOIN OfertarP t ON t.Producto_id=p.ID JOIN OfrecerP op ON (op.Producto_id,op.Emprendedor_id,op.Caracteristicas_id)=(t.Producto_id,t.Emprendedor_id,t.Caracteristicas_id) JOIN Oferta o ON o.ID=t.Oferta_id WHERE p.Activo AND op.Stock>0 AND p_fecha_referencia BETWEEN t.Finicio AND COALESCE(t.Ffin,'infinity'::DATE) AND p_fecha_referencia BETWEEN op.FechaInicio AND COALESCE(op.FechaFin,'infinity'::DATE)
) AS resultado(producto_id, producto_nombre, precio_original, precio_oferta)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_volumen_capital_reintegrado_devoluciones(p_fecha_referencia DATE DEFAULT CURRENT_DATE)
RETURNS NUMERIC
LANGUAGE sql STABLE
AS $func$
SELECT COALESCE(SUM(d.Valor),0)::NUMERIC FROM Devolucion d JOIN Comprar c ON c.Devolucion_id=d.ID WHERE c.EstadoDevolucion='Aprobada' AND c.FechaDevolucion>=date_trunc('year',p_fecha_referencia)::DATE AND c.FechaDevolucion<=p_fecha_referencia
$func$;

CREATE OR REPLACE FUNCTION fn_wishlist_oferta_expira_24h(p_fecha_referencia DATE DEFAULT CURRENT_DATE,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(cliente_id VARCHAR, producto_id INT, finicio DATE, ffin DATE)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT DISTINCT d.Cliente_id,d.Producto_id,t.Finicio,t.Ffin FROM DesearP d JOIN OfertarP t ON t.Producto_id=d.Producto_id WHERE t.Finicio<=p_fecha_referencia AND t.Ffin+INTERVAL '1 day'>LOCALTIMESTAMP AND t.Ffin+INTERVAL '1 day'<=LOCALTIMESTAMP+INTERVAL '24 hours'
) AS resultado(cliente_id, producto_id, finicio, ffin)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_tasa_devoluciones_por_emprendedor(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(vendedor_run VARCHAR, ventas_exitosas BIGINT, devoluciones BIGINT, tasa NUMERIC)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT v.Emprendedor_id,COUNT(DISTINCT v.ID),COUNT(DISTINCT v.ID) FILTER (WHERE c.EstadoDevolucion='Aprobada'),ROUND(100.0*COUNT(DISTINCT v.ID) FILTER (WHERE c.EstadoDevolucion='Aprobada')/NULLIF(COUNT(DISTINCT v.ID),0),2) FROM Venta v LEFT JOIN Comprar c ON c.Venta_id=v.ID WHERE v.Estado IN ('Entregado','Recibido') GROUP BY v.Emprendedor_id
) AS resultado(vendedor_run, ventas_exitosas, devoluciones, tasa)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_productos_mas_tres_variantes_stock_alto(p_fecha_referencia DATE DEFAULT CURRENT_DATE,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(producto_id INT, producto_nombre VARCHAR, stock_total BIGINT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
WITH variantes AS (SELECT p.Producto_id,COUNT(DISTINCT c.Color) AS colores FROM Poseer p JOIN Caracteristicas c ON c.ID=p.Caracteristicas_id GROUP BY p.Producto_id),
stock AS (SELECT o.Producto_id,SUM(o.Stock)::BIGINT AS total FROM OfrecerP o WHERE p_fecha_referencia BETWEEN o.FechaInicio AND COALESCE(o.FechaFin,'infinity'::DATE) GROUP BY o.Producto_id)
SELECT p.ID,p.Nombre,s.total FROM Producto p JOIN variantes v ON v.Producto_id=p.ID JOIN stock s ON s.Producto_id=p.ID WHERE v.colores>3 AND s.total>50
) AS resultado(producto_id, producto_nombre, stock_total)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_ventas_canceladas_transferencia(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(venta_id INT, cliente_id VARCHAR, total INT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT v.ID,v.Cliente_id,v.Total FROM Venta v WHERE v.Estado='Cancelada' AND EXISTS (SELECT 1 FROM Vender ve JOIN MedioPago mp ON mp.ID=ve.MedioPago_id WHERE ve.Venta_id=v.ID AND mp.Tipo='Transferencia')
) AS resultado(venta_id, cliente_id, total)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE VIEW vw_wishlist_vs_conversion AS
SELECT p.ID AS producto_id,p.Nombre AS producto_nombre,COUNT(d.Cliente_id) AS deseados,
       COUNT(d.Cliente_id) FILTER (WHERE EXISTS (SELECT 1 FROM Comprar co JOIN Venta v ON v.ID=co.Venta_id WHERE co.Producto_id=p.ID AND co.Cliente_id=d.Cliente_id AND v.Fecha>=d.Fecha AND v.Estado<>'Cancelada')) AS compras,
       COALESCE(ROUND(100.0*COUNT(d.Cliente_id) FILTER (WHERE EXISTS (SELECT 1 FROM Comprar co JOIN Venta v ON v.ID=co.Venta_id WHERE co.Producto_id=p.ID AND co.Cliente_id=d.Cliente_id AND v.Fecha>=d.Fecha AND v.Estado<>'Cancelada'))/NULLIF(COUNT(d.Cliente_id),0),2),0) AS conversion
FROM Producto p LEFT JOIN DesearP d ON d.Producto_id=p.ID GROUP BY p.ID,p.Nombre;

CREATE OR REPLACE FUNCTION fn_vista_inteligencia_wishlist_vs_conversion(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(producto_id INT, producto_nombre VARCHAR, deseados BIGINT, compras BIGINT, conversion NUMERIC)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT w.* FROM vw_wishlist_vs_conversion w ORDER BY w.deseados DESC,w.conversion
) AS resultado(producto_id, producto_nombre, deseados, compras, conversion)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

-- GRUPO 7. Demografia y validaciones

CREATE OR REPLACE FUNCTION fn_edad_cronologica_clientes(p_fecha_referencia DATE DEFAULT CURRENT_DATE,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(cliente_run VARCHAR, cliente_nombre VARCHAR, cliente_apellido VARCHAR, edad_anios INT, es_menor BOOLEAN)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT c.RUN,c.Nombre,c.Apellido,EXTRACT(YEAR FROM AGE(p_fecha_referencia,c.FechaNac))::INT,EXTRACT(YEAR FROM AGE(p_fecha_referencia,c.FechaNac))<18 FROM Cliente c
) AS resultado(cliente_run, cliente_nombre, cliente_apellido, edad_anios, es_menor)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_intentos_contratacion_servicio_menores_edad(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(cliente_run VARCHAR, servicio_id INT, servicio_nombre VARCHAR, edad_cliente INT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT c.RUN,s.ID,s.Nombre,EXTRACT(YEAR FROM AGE(v.Fecha,c.FechaNac))::INT FROM Contratar ct JOIN Cliente c ON c.RUN=ct.Cliente_id JOIN Servicio s ON s.ID=ct.Servicio_id JOIN Venta v ON v.ID=ct.Venta_id WHERE EXTRACT(YEAR FROM AGE(v.Fecha,c.FechaNac))<ct.EdadMinimaAplicada
) AS resultado(cliente_run, servicio_id, servicio_nombre, edad_cliente)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

-- La funcion anterior es una auditoria de contratos guardados: con los triggers activos debe devolver cero filas.
-- Los intentos rechazados se demuestran en pruebas.txt; no se inventa una tabla de auditoria.

CREATE OR REPLACE FUNCTION fn_segmentacion_etaria_decenales(p_fecha_referencia DATE DEFAULT CURRENT_DATE,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(rango_etario TEXT, cantidad_clientes BIGINT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
WITH edades AS (SELECT (EXTRACT(YEAR FROM AGE(p_fecha_referencia,c.FechaNac))::INT/10)*10 AS inferior FROM Cliente c) SELECT e.inferior::TEXT||'-'||(e.inferior+9)::TEXT,COUNT(*) FROM edades e GROUP BY e.inferior ORDER BY e.inferior
) AS resultado(rango_etario, cantidad_clientes)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_correos_anomalias_estructurales(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(correo VARCHAR, motivo TEXT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT c.Correo,'Formato invalido'::TEXT FROM Correo c WHERE NOT fn_correo_valido(c.Correo)
) AS resultado(correo, motivo)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_emprendedores_empresa_sin_web(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(emprendedor_run VARCHAR, empresa_rut VARCHAR, empresa_nombre VARCHAR)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT e.RUN,emp.RUT,emp.Nombre FROM Emprendedor e JOIN Empresa emp ON emp.RUT=e.Empresa_id WHERE emp.Web IS NULL
) AS resultado(emprendedor_run, empresa_rut, empresa_nombre)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_direcciones_despacho_avenida_camino(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(direccion_id INT, calle VARCHAR, numero INT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT DISTINCT d.ID,d.Calle,d.Numero FROM Direccion d JOIN Envio e ON e.Direccion_id=d.ID WHERE d.Calle ILIKE 'Avenida%' OR d.Calle ILIKE 'Camino%'
) AS resultado(direccion_id, calle, numero)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_emprendedores_mayores_60_servicio_educativo(p_fecha_referencia DATE DEFAULT CURRENT_DATE,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(emprendedor_run VARCHAR, emprendedor_nombre VARCHAR, emprendedor_apellido VARCHAR, edad INT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT DISTINCT e.RUN,e.Nombre,e.Apellido,EXTRACT(YEAR FROM AGE(p_fecha_referencia,e.FechaNac))::INT FROM Emprendedor e JOIN OfrecerS os ON os.Emprendedor_id=e.RUN JOIN Servicio s ON s.ID=os.Servicio_id WHERE EXTRACT(YEAR FROM AGE(p_fecha_referencia,e.FechaNac))>60 AND s.Descripcion->>'Modalidad'='Presencial' AND p_fecha_referencia BETWEEN os.FechaInicio AND COALESCE(os.FechaFin,'infinity'::DATE) AND s.Categoria_id IN (SELECT d.categoria_id FROM Categoría c CROSS JOIN LATERAL fn_categorias_descendientes(c.ID) d WHERE c.Nombre ILIKE '%Educaci%')
) AS resultado(emprendedor_run, emprendedor_nombre, emprendedor_apellido, edad)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_medios_pago_visa_mastercard(p_marcas TEXT[] DEFAULT ARRAY['Visa','MasterCard','American Express','Diners Club','Maestro','Redcompra'],
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(medio_id INT, tipo VARCHAR, marca VARCHAR)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT m.ID,m.Tipo,m.Marca FROM MedioPago m WHERE m.Marca ILIKE ANY (p_marcas)
) AS resultado(medio_id, tipo, marca)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

-- GRUPO 8. Vistas e indicadores de negocio

CREATE OR REPLACE VIEW vw_factura_fiscal_cliente AS
SELECT v.ID AS venta_id,v.ValorBruto AS valor_neto,v.MontoIVA::NUMERIC AS impuesto_iva,v.Descuento,COALESCE(e.Valor,0)::NUMERIC AS recargo_envio,v.Total AS total_pagado,v.TotalNeto AS base_imponible,COALESCE((SELECT SUM(p.Monto) FROM Vender p WHERE p.Venta_id=v.ID),0) AS abonado FROM Venta v LEFT JOIN Envio e ON e.Seguimiento=v.Despacho;

CREATE OR REPLACE FUNCTION fn_factura_fiscal_cliente(p_venta_id INT,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(venta_id INT, valor_neto INT, impuesto_iva NUMERIC, descuento INT, recargo_envio NUMERIC, total_pagado INT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT f.venta_id,f.valor_neto,f.impuesto_iva,f.Descuento,f.recargo_envio,f.total_pagado FROM vw_factura_fiscal_cliente f WHERE f.venta_id=p_venta_id
) AS resultado(venta_id, valor_neto, impuesto_iva, descuento, recargo_envio, total_pagado)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE VIEW vw_inventario_critico AS
SELECT p.ID AS producto_id,p.Nombre AS producto_nombre,o.Stock AS stock_disponible,o.Emprendedor_id,o.Caracteristicas_id FROM Producto p JOIN OfrecerP o ON o.Producto_id=p.ID WHERE o.Stock<10 AND CURRENT_DATE BETWEEN o.FechaInicio AND COALESCE(o.FechaFin,'infinity'::DATE);

CREATE OR REPLACE FUNCTION fn_inventario_critico(p_fecha_referencia DATE DEFAULT CURRENT_DATE,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(producto_id INT, producto_nombre VARCHAR, stock_disponible INT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT i.producto_id,i.producto_nombre,i.stock_disponible FROM (SELECT p.ID AS producto_id,p.Nombre AS producto_nombre,o.Stock AS stock_disponible,o.Emprendedor_id,o.Caracteristicas_id FROM Producto p JOIN OfrecerP o ON o.Producto_id=p.ID WHERE o.Stock<10 AND p_fecha_referencia BETWEEN o.FechaInicio AND COALESCE(o.FechaFin,'infinity'::DATE)) i
) AS resultado(producto_id, producto_nombre, stock_disponible)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE VIEW vw_rendimiento_emprendedores AS
SELECT v.Emprendedor_id AS emprendedor_run,SUM(v.ValorBruto)::BIGINT AS facturacion_trimestral,CASE WHEN SUM(v.ValorBruto)>=1000000 THEN 'Alto Rendimiento' WHEN SUM(v.ValorBruto)>=500000 THEN 'Rendimiento Medio' ELSE 'Bajo Rendimiento' END::TEXT AS categoria_rendimiento FROM Venta v WHERE v.Estado<>'Cancelada' AND v.Fecha>=(CURRENT_DATE-INTERVAL '3 months')::DATE GROUP BY v.Emprendedor_id;

CREATE OR REPLACE FUNCTION fn_rendimiento_emprendedores(p_fecha_referencia DATE DEFAULT CURRENT_DATE,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(emprendedor_run VARCHAR, facturacion_trimestral BIGINT, categoria_rendimiento TEXT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT r.* FROM (SELECT v.Emprendedor_id AS emprendedor_run,SUM(v.ValorBruto)::BIGINT AS facturacion_trimestral,CASE WHEN SUM(v.ValorBruto)>=1000000 THEN 'Alto Rendimiento' WHEN SUM(v.ValorBruto)>=500000 THEN 'Rendimiento Medio' ELSE 'Bajo Rendimiento' END::TEXT AS categoria_rendimiento FROM Venta v WHERE v.Estado<>'Cancelada' AND v.Fecha>=(p_fecha_referencia-INTERVAL '3 months')::DATE GROUP BY v.Emprendedor_id) r
) AS resultado(emprendedor_run, facturacion_trimestral, categoria_rendimiento)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE VIEW vw_life_time_value_cliente AS
SELECT c.RUN AS cliente_run,c.Nombre AS cliente_nombre,c.Apellido AS cliente_apellido,COALESCE(SUM(v.Total),0)::BIGINT AS ltv_total_acumulado,COUNT(v.ID) AS total_transacciones FROM Cliente c LEFT JOIN Venta v ON v.Cliente_id=c.RUN AND v.Estado<>'Cancelada' AND EXISTS (SELECT 1 FROM vw_lineas_venta l WHERE l.Venta_id=v.ID) GROUP BY c.RUN,c.Nombre,c.Apellido;

CREATE OR REPLACE FUNCTION fn_life_time_value_cliente(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(cliente_run VARCHAR, cliente_nombre VARCHAR, cliente_apellido VARCHAR, ltv_total_acumulado BIGINT, total_transacciones BIGINT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT l.* FROM vw_life_time_value_cliente l
) AS resultado(cliente_run, cliente_nombre, cliente_apellido, ltv_total_acumulado, total_transacciones)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE VIEW vw_categorias_jerarquica AS
WITH RECURSIVE arbol AS (SELECT c.ID,c.Nombre,c.Categoria_id,1 AS nivel,c.Nombre::TEXT AS ruta,ARRAY[c.ID] AS visitadas FROM Categoría c WHERE c.Categoria_id IS NULL UNION ALL SELECT c.ID,c.Nombre,c.Categoria_id,a.nivel+1,a.ruta||' > '||c.Nombre,a.visitadas||c.ID FROM Categoría c JOIN arbol a ON c.Categoria_id=a.ID WHERE NOT c.ID=ANY(a.visitadas)) SELECT a.ID AS categoria_id,a.Nombre AS categoria_nombre,a.Categoria_id AS padre_id,a.nivel,a.ruta FROM arbol a;

CREATE OR REPLACE FUNCTION fn_categorias_jerarquica(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(categoria_id INT, categoria_nombre VARCHAR, padre_id INT, nivel INT, ruta TEXT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT c.* FROM vw_categorias_jerarquica c
) AS resultado(categoria_id, categoria_nombre, padre_id, nivel, ruta)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE VIEW vw_utilidades_operativas AS
SELECT COALESCE(SUM(v.ValorBruto),0)::BIGINT AS total_ventas_brutas,ROUND(COALESCE(SUM(v.ValorBruto),0)*0.05,2) AS comision_plataforma FROM Venta v WHERE v.Estado<>'Cancelada';

CREATE OR REPLACE FUNCTION fn_utilidades_operativas(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(total_ventas_brutas BIGINT, comision_plataforma NUMERIC)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT u.* FROM vw_utilidades_operativas u
) AS resultado(total_ventas_brutas, comision_plataforma)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE VIEW vw_empresas_geoespacial AS
WITH presencia AS (SELECT DISTINCT e.Giro,e.RUT,c.ID,c.Superficie FROM Empresa e JOIN TieneDirEmpresa t ON t.Empresa_ID=e.RUT JOIN Direccion d ON d.ID=t.Direccion_id JOIN Comuna c ON c.ID=d.Comuna_id), empresas AS (SELECT p.Giro,COUNT(DISTINCT p.RUT) AS cantidad FROM presencia p GROUP BY p.Giro), superficies AS (SELECT p.Giro,SUM(p.Superficie)::BIGINT AS total FROM (SELECT DISTINCT Giro,ID,Superficie FROM presencia) p GROUP BY p.Giro) SELECT e.Giro,e.cantidad AS cantidad_empresas,s.total AS superficie FROM empresas e JOIN superficies s ON s.Giro IS NOT DISTINCT FROM e.Giro;

CREATE OR REPLACE FUNCTION fn_empresas_geoespacial(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(giro VARCHAR, cantidad_empresas BIGINT, superficie BIGINT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT e.* FROM vw_empresas_geoespacial e
) AS resultado(giro, cantidad_empresas, superficie)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE VIEW vw_monitoreo_nuevos_clientes AS
SELECT ROUND(COUNT(*)::NUMERIC/(date_trunc('month',CURRENT_DATE)::DATE-(date_trunc('month',CURRENT_DATE)-INTERVAL '1 month')::DATE),2) AS promedio_diario_nuevos_registros FROM Cliente c WHERE c.FechaRegistro>=(date_trunc('month',CURRENT_DATE)-INTERVAL '1 month')::DATE AND c.FechaRegistro<date_trunc('month',CURRENT_DATE)::DATE;

CREATE OR REPLACE FUNCTION fn_monitoreo_nuevos_clientes(p_fecha_referencia DATE DEFAULT CURRENT_DATE)
RETURNS NUMERIC
LANGUAGE sql STABLE
AS $func$
SELECT m.promedio_diario_nuevos_registros FROM (SELECT ROUND(COUNT(*)::NUMERIC/(date_trunc('month',p_fecha_referencia)::DATE-(date_trunc('month',p_fecha_referencia)-INTERVAL '1 month')::DATE),2) AS promedio_diario_nuevos_registros FROM Cliente c WHERE c.FechaRegistro>=(date_trunc('month',p_fecha_referencia)-INTERVAL '1 month')::DATE AND c.FechaRegistro<date_trunc('month',p_fecha_referencia)::DATE) m
$func$;

CREATE OR REPLACE FUNCTION fn_auditoria_consistencia_numerica_ventas(p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(venta_id INT, total_registrado INT, total_calculado NUMERIC, es_consistente BOOLEAN)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT v.ID,v.Total,(v.ValorBruto-v.Descuento+ROUND((v.ValorBruto-v.Descuento)*v.IVA/100.0)+COALESCE(e.Valor,0))::NUMERIC,v.Total=(v.ValorBruto-v.Descuento+ROUND((v.ValorBruto-v.Descuento)*v.IVA/100.0)+COALESCE(e.Valor,0)) FROM Venta v LEFT JOIN Envio e ON e.Seguimiento=v.Despacho
) AS resultado(venta_id, total_registrado, total_calculado, es_consistente)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE VIEW vw_catalogo_unificado AS
SELECT 'Producto'::TEXT AS tipo_item,p.ID AS item_id,p.Nombre AS item_nombre,c.Nombre AS categoria_nombre,o.Stock AS disponibilidad_stock,fn_precio_producto(p.ID,o.Emprendedor_id,o.Caracteristicas_id,CURRENT_DATE) AS precio,o.Emprendedor_id AS vendedor_run,o.Caracteristicas_id FROM Producto p JOIN Categoría c ON c.ID=p.Categoria_id JOIN OfrecerP o ON o.Producto_id=p.ID WHERE p.Activo AND COALESCE(p.UltimaVenta,p.FechaRegistro)>=CURRENT_DATE-40 AND o.Stock>0 AND CURRENT_DATE BETWEEN o.FechaInicio AND COALESCE(o.FechaFin,'infinity'::DATE) UNION ALL SELECT 'Servicio',s.ID,s.Nombre,c.Nombre,NULL::INT,fn_precio_servicio(s.ID,o.Emprendedor_id,CURRENT_DATE),o.Emprendedor_id,NULL::INT FROM Servicio s JOIN Categoría c ON c.ID=s.Categoria_id JOIN OfrecerS o ON o.Servicio_id=s.ID WHERE s.Activo AND COALESCE(s.UltimaVenta,s.FechaRegistro)>=CURRENT_DATE-40 AND CURRENT_DATE BETWEEN o.FechaInicio AND COALESCE(o.FechaFin,'infinity'::DATE);

CREATE OR REPLACE FUNCTION fn_catalogo_unificado(p_fecha_referencia DATE DEFAULT CURRENT_DATE,
    p_filtros JSONB DEFAULT '{}'::JSONB,
    p_limite INT DEFAULT NULL)
RETURNS TABLE(tipo_item TEXT, item_id INT, item_nombre VARCHAR, categoria_nombre VARCHAR, disponibilidad_stock INT, precio INT, vendedor_run VARCHAR, caracteristicas_id INT)
LANGUAGE sql STABLE
AS $func$
SELECT resultado.* FROM (
SELECT c.* FROM (SELECT 'Producto'::TEXT AS tipo_item,p.ID AS item_id,p.Nombre AS item_nombre,c.Nombre AS categoria_nombre,o.Stock AS disponibilidad_stock,fn_precio_producto(p.ID,o.Emprendedor_id,o.Caracteristicas_id,p_fecha_referencia) AS precio,o.Emprendedor_id AS vendedor_run,o.Caracteristicas_id FROM Producto p JOIN Categoría c ON c.ID=p.Categoria_id JOIN OfrecerP o ON o.Producto_id=p.ID WHERE p.Activo AND COALESCE(p.UltimaVenta,p.FechaRegistro)>=p_fecha_referencia-40 AND o.Stock>0 AND p_fecha_referencia BETWEEN o.FechaInicio AND COALESCE(o.FechaFin,'infinity'::DATE) UNION ALL SELECT 'Servicio',s.ID,s.Nombre,c.Nombre,NULL::INT,fn_precio_servicio(s.ID,o.Emprendedor_id,p_fecha_referencia),o.Emprendedor_id,NULL::INT FROM Servicio s JOIN Categoría c ON c.ID=s.Categoria_id JOIN OfrecerS o ON o.Servicio_id=s.ID WHERE s.Activo AND COALESCE(s.UltimaVenta,s.FechaRegistro)>=p_fecha_referencia-40 AND p_fecha_referencia BETWEEN o.FechaInicio AND COALESCE(o.FechaFin,'infinity'::DATE)) c
) AS resultado(tipo_item, item_id, item_nombre, categoria_nombre, disponibilidad_stock, precio, vendedor_run, caracteristicas_id)
WHERE to_jsonb(resultado) @> COALESCE(p_filtros,'{}'::JSONB)
LIMIT p_limite
$func$;

CREATE OR REPLACE FUNCTION fn_validar_ruts_masivo()
RETURNS TABLE(revisados BIGINT, incorrectos BIGINT) LANGUAGE plpgsql AS $$
DECLARE r RECORD;
BEGIN
    SELECT (SELECT count(*) FROM Cliente)+(SELECT count(*) FROM Emprendedor)+(SELECT count(*) FROM Empresa) INTO revisados;
    incorrectos:=0;
    FOR r IN SELECT * FROM fn_auditar_ruts_masivo() LOOP
        incorrectos:=incorrectos+1;
        RAISE NOTICE '%: %',r.identificador,r.msj;
    END LOOP;
    RAISE NOTICE 'Validación masiva: % identificadores revisados, % incorrectos',revisados,incorrectos;
    RETURN NEXT;
END; $$;

CREATE OR REPLACE FUNCTION tg_validar_dv_rut() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_rut TEXT;
BEGIN
    IF TG_TABLE_NAME='empresa' THEN v_rut:=upper(trim(NEW.RUT));
    ELSE v_rut:=upper(trim(NEW.RUN)); END IF;
    IF v_rut !~ '^[0-9]{1,8}-[0-9K]$' THEN
        RAISE EXCEPTION 'Formato de RUN/RUT invalido: %',v_rut;
    END IF;
    IF NOT fn_rut_valido(v_rut) THEN
        RAISE NOTICE 'DV corregido: % -> %',v_rut,fn_rut_desde_numero(split_part(v_rut,'-',1)::BIGINT);
        v_rut:=fn_rut_desde_numero(split_part(v_rut,'-',1)::BIGINT);
    END IF;
    IF TG_TABLE_NAME='empresa' THEN NEW.RUT:=v_rut; ELSE NEW.RUN:=v_rut; END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_validar_correo() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.Correo:=lower(trim(NEW.Correo));
    IF NOT fn_correo_valido(NEW.Correo) THEN RAISE EXCEPTION 'Correo invalido: %',NEW.Correo; END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_categoria_sin_ciclos() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    PERFORM pg_advisory_xact_lock(741852963);
    IF NEW.Categoria_id=NEW.ID OR EXISTS (
        WITH RECURSIVE padres AS (
            SELECT c.ID,c.Categoria_id,ARRAY[c.ID] AS ruta FROM Categoría c WHERE c.ID=NEW.Categoria_id
            UNION ALL SELECT c.ID,c.Categoria_id,p.ruta||c.ID FROM Categoría c JOIN padres p ON c.ID=p.Categoria_id
            WHERE NOT c.ID=ANY(p.ruta)
        ) SELECT 1 FROM padres p WHERE p.ID=NEW.ID
    ) THEN RAISE EXCEPTION 'La categoria no puede formar un ciclo'; END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_edad_json_servicio() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.Descripcion:=jsonb_set(COALESCE(NEW.Descripcion,'{}'::JSONB),'{RestriccionEdad}',to_jsonb(NEW.EdadMinima));
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_descuento_frecuencia() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_compras BIGINT;
BEGIN
    SELECT COUNT(*) INTO v_compras FROM Venta v
    WHERE v.Cliente_id=NEW.Cliente_id AND v.Estado IN ('Entregado','Recibido')
      AND v.Fecha>=date_trunc('month',NEW.Fecha)::DATE AND v.Fecha<=NEW.Fecha;
    IF v_compras>5 THEN
        NEW.PorcentajeDescuento:=GREATEST(NEW.PorcentajeDescuento,10);
        NEW.Descripcion:=concat_ws(' | ',NULLIF(NEW.Descripcion,''),'Descuento 10% por mas de cinco compras del mes');
    END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_incentivo_inactividad() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_ultima DATE;
BEGIN
    SELECT MAX(v.Fecha) INTO v_ultima FROM Venta v
    WHERE v.Cliente_id=NEW.Cliente_id AND v.Estado IN ('Entregado','Recibido') AND v.Fecha<=NEW.Fecha;
    IF v_ultima IS NOT NULL AND NEW.Fecha>=v_ultima+INTERVAL '6 months'
       AND NEW.Fecha<=v_ultima+INTERVAL '6 months 45 days' THEN
        NEW.PorcentajeDescuento:=GREATEST(NEW.PorcentajeDescuento,5);
        NEW.Descripcion:=concat_ws(' | ',NULLIF(NEW.Descripcion,''),'Descuento 5% por inactividad; vigencia de 45 dias');
    END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_calculo_total_factura() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_envio NUMERIC := 0;
BEGIN
    IF TG_OP='INSERT' THEN NEW.ValorBruto:=0;
    ELSE
        SELECT COALESCE(SUM(l.importe_linea),0)::INT INTO NEW.ValorBruto
        FROM vw_lineas_venta l WHERE l.Venta_id=NEW.ID;
    END IF;
    NEW.Descuento:=NEW.DescuentoManual+ROUND(NEW.ValorBruto*NEW.PorcentajeDescuento/100.0)::INT;
    IF NEW.Descuento>NEW.ValorBruto THEN RAISE EXCEPTION 'El descuento supera la base de la venta'; END IF;
    IF NEW.Despacho IS NOT NULL THEN
        SELECT e.Valor INTO v_envio FROM Envio e WHERE e.Seguimiento=NEW.Despacho AND e.Cliente_id=NEW.Cliente_id;
        IF NOT FOUND THEN RAISE EXCEPTION 'El envio no existe o pertenece a otro cliente'; END IF;
    END IF;
    NEW.Total:=NEW.ValorBruto-NEW.Descuento+ROUND((NEW.ValorBruto-NEW.Descuento)*NEW.IVA/100.0)::INT+v_envio::INT;
    IF EXISTS (SELECT 1 FROM Vender p WHERE p.Venta_id=NEW.ID
               GROUP BY p.Venta_id HAVING SUM(p.Monto)>NEW.Total) THEN
        RAISE EXCEPTION 'El total no puede ser menor que lo ya abonado';
    END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_proteger_boleta_cerrada() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP='DELETE' THEN
        IF OLD.Estado IN ('Despachado','En reparto','Entregado','Recibido','Cancelada')
           OR EXISTS(SELECT 1 FROM vw_lineas_venta l WHERE l.Venta_id=OLD.ID) THEN
            RAISE EXCEPTION 'No se puede borrar una venta con detalle o historial cerrado';
        END IF;
        RETURN OLD;
    END IF;
    -- El estado logistico puede avanzar; el documento economico permanece inmutable.
    IF (OLD.Estado IN ('Entregado','Recibido') OR
        (OLD.Total>0 AND COALESCE((SELECT SUM(Monto) FROM Vender WHERE Venta_id=OLD.ID),0)=OLD.Total))
       AND (to_jsonb(NEW)-'totalneto'-'montoiva'-'estado')
           IS DISTINCT FROM (to_jsonb(OLD)-'totalneto'-'montoiva'-'estado') THEN
        RAISE EXCEPTION 'Factura pagada o emitida inmutable';
    END IF;
    IF (NEW.Cliente_id,NEW.Emprendedor_id,NEW.Fecha) IS DISTINCT FROM (OLD.Cliente_id,OLD.Emprendedor_id,OLD.Fecha)
       AND EXISTS(SELECT 1 FROM vw_lineas_venta l WHERE l.Venta_id=OLD.ID) THEN
        RAISE EXCEPTION 'No se puede cambiar cliente, vendedor o fecha de una venta con detalle';
    END IF;
    IF OLD.Estado IN ('Despachado','En reparto','Entregado','Recibido','Cancelada')
       AND (NEW.ValorBruto,NEW.IVA,NEW.Descuento,NEW.DescuentoManual,NEW.PorcentajeDescuento,NEW.Total,NEW.Despacho)
           IS DISTINCT FROM (OLD.ValorBruto,OLD.IVA,OLD.Descuento,OLD.DescuentoManual,OLD.PorcentajeDescuento,OLD.Total,OLD.Despacho) THEN
        RAISE EXCEPTION 'Los importes y el despacho de una venta cerrada son inmutables';
    END IF;
    IF NEW.Estado IS DISTINCT FROM OLD.Estado THEN
        IF NOT ((OLD.Estado='En Preparación' AND NEW.Estado IN ('Despachado','Entregado','Cancelada'))
            OR (OLD.Estado='Despachado' AND NEW.Estado IN ('En reparto','Entregado'))
            OR (OLD.Estado='En reparto' AND NEW.Estado='Entregado')
            OR (OLD.Estado='Entregado' AND NEW.Estado='Recibido')) THEN
            RAISE EXCEPTION 'Transicion de estado no permitida: % -> %',OLD.Estado,NEW.Estado;
        END IF;
        IF NEW.Estado<>'Cancelada' AND NOT EXISTS(SELECT 1 FROM vw_lineas_venta l WHERE l.Venta_id=NEW.ID) THEN
            RAISE EXCEPTION 'La venta debe contener productos o servicios';
        END IF;
        IF NEW.Estado IN ('Despachado','En reparto') AND NEW.Despacho IS NULL THEN
            RAISE EXCEPTION 'El estado solicitado requiere un envio';
        END IF;
        IF NEW.Estado IN ('Entregado','Recibido')
           AND COALESCE((SELECT SUM(p.Monto) FROM Vender p WHERE p.Venta_id=NEW.ID),0)<>NEW.Total THEN
            RAISE EXCEPTION 'Para completar la venta, los abonos deben coincidir con el total';
        END IF;
    END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_calculo_dinamico_envio() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP='UPDATE' AND EXISTS(SELECT 1 FROM Venta v WHERE v.Despacho=OLD.Seguimiento
                               AND v.Estado IN ('Despachado','En reparto','Entregado','Recibido','Cancelada'))
       AND (NEW.Valor,NEW.Cliente_id,NEW.Direccion_id,NEW.Altura,NEW.Ancho,NEW.Fondo)
           IS DISTINCT FROM (OLD.Valor,OLD.Cliente_id,OLD.Direccion_id,OLD.Altura,OLD.Ancho,OLD.Fondo) THEN
        RAISE EXCEPTION 'No se puede modificar el costo o destino de un envio de venta cerrada';
    END IF;
    IF NEW.Altura IS NOT NULL AND NEW.Ancho IS NOT NULL AND NEW.Fondo IS NOT NULL THEN
        NEW.Valor:=ROUND(2000+NEW.Altura*NEW.Ancho*NEW.Fondo*0.25,0);
    END IF;
    IF NEW.Estado='Entregado' AND (NEW.FechaLlegada IS NULL OR NEW.FechaLlegada>CURRENT_DATE) THEN
        RAISE EXCEPTION 'Un envio entregado necesita una fecha real de llegada no futura';
    END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_envio_recalcular_venta() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT v.ID FROM Venta v WHERE v.Despacho=NEW.Seguimiento LOOP PERFORM fn_recalcular_venta(r.ID); END LOOP;
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION tg_exclusividad_oferta() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_TABLE_NAME='ofertarp' THEN
        PERFORM 1 FROM OfrecerP o WHERE (o.Producto_id,o.Emprendedor_id,o.Caracteristicas_id)
          =(NEW.Producto_id,NEW.Emprendedor_id,NEW.Caracteristicas_id) FOR UPDATE;
        IF EXISTS (SELECT 1 FROM OfertarP o
            WHERE (o.Producto_id,o.Emprendedor_id,o.Caracteristicas_id)=(NEW.Producto_id,NEW.Emprendedor_id,NEW.Caracteristicas_id)
              AND NEW.Finicio<=COALESCE(o.Ffin,'infinity'::DATE) AND o.Finicio<=COALESCE(NEW.Ffin,'infinity'::DATE)
              AND (TG_OP='INSERT' OR (o.Producto_id,o.Emprendedor_id,o.Caracteristicas_id,o.Oferta_id,o.Finicio)
                   IS DISTINCT FROM (OLD.Producto_id,OLD.Emprendedor_id,OLD.Caracteristicas_id,OLD.Oferta_id,OLD.Finicio))) THEN
            RAISE EXCEPTION 'Oferta de producto solapada para el mismo vendedor y variante';
        END IF;
    ELSE
        PERFORM 1 FROM OfrecerS o WHERE (o.Servicio_id,o.Emprendedor_id)=(NEW.Servicio_id,NEW.Emprendedor_id) FOR UPDATE;
        IF EXISTS (SELECT 1 FROM OfertarS o
            WHERE (o.Servicio_id,o.Emprendedor_id)=(NEW.Servicio_id,NEW.Emprendedor_id)
              AND NEW.Finicio<=COALESCE(o.Ffin,'infinity'::DATE) AND o.Finicio<=COALESCE(NEW.Ffin,'infinity'::DATE)
              AND (TG_OP='INSERT' OR (o.Servicio_id,o.Emprendedor_id,o.Oferta_id,o.Finicio)
                   IS DISTINCT FROM (OLD.Servicio_id,OLD.Emprendedor_id,OLD.Oferta_id,OLD.Finicio))) THEN
            RAISE EXCEPTION 'Oferta de servicio solapada para el mismo vendedor';
        END IF;
    END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_proteger_variante_cotizada() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP='DELETE' OR (NEW.Producto_id,NEW.Emprendedor_id,NEW.Caracteristicas_id)
                         IS DISTINCT FROM (OLD.Producto_id,OLD.Emprendedor_id,OLD.Caracteristicas_id) THEN
        IF EXISTS(SELECT 1 FROM Cotizacion c CROSS JOIN LATERAL jsonb_array_elements(c.Detalle) e
                  WHERE c.Emprendedor_id=OLD.Emprendedor_id AND (e->>'producto_id')::INT=OLD.Producto_id
                    AND (e->>'caracteristicas_id')::INT=OLD.Caracteristicas_id) THEN
            RAISE EXCEPTION 'La variante esta referenciada por una cotizacion';
        END IF;
    END IF;
    IF TG_OP='DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_proteger_direccion_utilizada() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF (NEW.CodPostal,NEW.Calle,NEW.Numero,NEW.Pasaje,NEW.Sector,NEW.Comuna_id)
       IS DISTINCT FROM (OLD.CodPostal,OLD.Calle,OLD.Numero,OLD.Pasaje,OLD.Sector,OLD.Comuna_id)
       AND (EXISTS(SELECT 1 FROM Envio e WHERE e.Direccion_id=OLD.ID)
            OR EXISTS(SELECT 1 FROM Contratar c WHERE c.Direccion_id=OLD.ID)) THEN
        RAISE EXCEPTION 'Direccion utilizada en una operacion: registre otra direccion para conservar el historial';
    END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_precedencia_precios() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v Venta%ROWTYPE; v_precio INT; v_edad INT; v_minima INT; v_activo BOOLEAN;
BEGIN
    IF TG_OP='UPDATE' AND NEW.Venta_id<>OLD.Venta_id THEN RAISE EXCEPTION 'No se puede trasladar una linea a otra venta'; END IF;
    SELECT * INTO v FROM Venta WHERE ID=NEW.Venta_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'La venta no existe'; END IF;
    IF v.Total>0 AND COALESCE((SELECT SUM(Monto) FROM Vender WHERE Venta_id=v.ID),0)=v.Total THEN
        IF TG_OP='INSERT' THEN RAISE EXCEPTION 'Factura pagada: no se agrega detalle'; END IF;
        IF (NEW.Producto_id,NEW.Caracteristicas_id,NEW.Cantidad,NEW.PrecioUnitario,NEW.EdadMinimaAplicada)
           IS DISTINCT FROM (OLD.Producto_id,OLD.Caracteristicas_id,OLD.Cantidad,OLD.PrecioUnitario,OLD.EdadMinimaAplicada) THEN
            RAISE EXCEPTION 'Factura pagada: detalle economico inmutable';
        END IF;
    END IF;
    IF TG_OP='INSERT' AND v.Estado<>'En Preparación' THEN RAISE EXCEPTION 'Solo se puede agregar detalle a una venta en preparacion'; END IF;
    IF NEW.Cliente_id IS NOT NULL AND NEW.Cliente_id<>v.Cliente_id THEN RAISE EXCEPTION 'El cliente no coincide con la venta'; END IF;
    IF NEW.Emprendedor_id IS NOT NULL AND NEW.Emprendedor_id<>v.Emprendedor_id THEN RAISE EXCEPTION 'El vendedor no coincide con la venta'; END IF;
    NEW.Cliente_id:=v.Cliente_id; NEW.Emprendedor_id:=v.Emprendedor_id;
    IF TG_OP='UPDATE' AND v.Estado<>'En Preparación'
       AND (NEW.Producto_id,NEW.Caracteristicas_id,NEW.Cantidad,NEW.PrecioUnitario)
           IS DISTINCT FROM (OLD.Producto_id,OLD.Caracteristicas_id,OLD.Cantidad,OLD.PrecioUnitario) THEN
        RAISE EXCEPTION 'El detalle economico de una venta cerrada es inmutable';
    END IF;
    IF v.Estado='Cancelada' THEN RAISE EXCEPTION 'La venta esta cancelada'; END IF;
    SELECT p.EdadMinima,p.Activo INTO v_minima,v_activo FROM Producto p WHERE p.ID=NEW.Producto_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Producto inexistente'; END IF;
    IF NOT v_activo AND (TG_OP='INSERT' OR (NEW.Producto_id,NEW.Caracteristicas_id) IS DISTINCT FROM (OLD.Producto_id,OLD.Caracteristicas_id)) THEN
        RAISE EXCEPTION 'Producto inactivo';
    END IF;
    IF TG_OP='INSERT' OR (NEW.Producto_id,NEW.Caracteristicas_id) IS DISTINCT FROM (OLD.Producto_id,OLD.Caracteristicas_id) THEN
        NEW.EdadMinimaAplicada:=v_minima;
    ELSE NEW.EdadMinimaAplicada:=OLD.EdadMinimaAplicada; END IF;
    v_minima:=NEW.EdadMinimaAplicada;
    SELECT EXTRACT(YEAR FROM AGE(v.Fecha,c.FechaNac))::INT INTO v_edad FROM Cliente c WHERE c.RUN=v.Cliente_id;
    IF v_edad<v_minima THEN RAISE EXCEPTION 'Edad minima del producto no cumplida'; END IF;
    IF TG_OP='INSERT' OR (NEW.Producto_id,NEW.Caracteristicas_id) IS DISTINCT FROM (OLD.Producto_id,OLD.Caracteristicas_id) THEN
        v_precio:=fn_precio_producto(NEW.Producto_id,v.Emprendedor_id,NEW.Caracteristicas_id,v.Fecha);
        IF v_precio IS NULL THEN RAISE EXCEPTION 'El vendedor no ofrece esta variante en la fecha de la venta'; END IF;
        NEW.PrecioUnitario:=v_precio;
    ELSIF NEW.PrecioUnitario IS DISTINCT FROM OLD.PrecioUnitario THEN
        RAISE EXCEPTION 'El precio unitario historico no se modifica';
    END IF;
    IF TG_OP='INSERT' AND NEW.EstadoDevolucion IS NOT NULL THEN RAISE EXCEPTION 'La devolucion se registra despues de la compra'; END IF;
    IF TG_OP='UPDATE' AND OLD.EstadoDevolucion='Aprobada'
       AND (NEW.EstadoDevolucion,NEW.Devolucion_id,NEW.FechaDevolucion,NEW.CantidadDevuelta,NEW.Cantidad,NEW.Producto_id,NEW.Caracteristicas_id)
           IS DISTINCT FROM (OLD.EstadoDevolucion,OLD.Devolucion_id,OLD.FechaDevolucion,OLD.CantidadDevuelta,OLD.Cantidad,OLD.Producto_id,OLD.Caracteristicas_id) THEN
        RAISE EXCEPTION 'Una devolucion aprobada no puede revertirse ni repetirse';
    END IF;
    IF NEW.EstadoDevolucion IS NOT NULL AND NEW.FechaDevolucion<v.Fecha THEN RAISE EXCEPTION 'Devolucion anterior a la venta'; END IF;
    IF NEW.EstadoDevolucion='Aprobada' AND NEW.CantidadDevuelta=0 THEN NEW.CantidadDevuelta:=NEW.Cantidad; END IF;
    IF NEW.EstadoDevolucion IS DISTINCT FROM 'Aprobada' THEN NEW.CantidadDevuelta:=0; END IF;
    IF NEW.EstadoDevolucion='Aprobada' AND NOT EXISTS(SELECT 1 FROM Devolucion d WHERE d.ID=NEW.Devolucion_id
         AND d.Valor<=ROUND(NEW.PrecioUnitario::NUMERIC*NEW.CantidadDevuelta
                    *(1-COALESCE(v.Descuento::NUMERIC/NULLIF(v.ValorBruto,0),0))*(1+v.IVA/100.0))) THEN
        RAISE EXCEPTION 'El reembolso no existe o supera el importe proporcional pagado';
    END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_ocultar_stock_cero() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_necesarias INT; v_stock INT;
BEGIN
    PERFORM 1 FROM OfrecerP o
    WHERE (o.Producto_id,o.Emprendedor_id,o.Caracteristicas_id)=(NEW.Producto_id,NEW.Emprendedor_id,NEW.Caracteristicas_id)
       OR (TG_OP='UPDATE' AND (o.Producto_id,o.Emprendedor_id,o.Caracteristicas_id)=(OLD.Producto_id,OLD.Emprendedor_id,OLD.Caracteristicas_id))
    ORDER BY o.Producto_id,o.Emprendedor_id,o.Caracteristicas_id FOR UPDATE;
    v_necesarias:=NEW.Cantidad-NEW.CantidadDevuelta;
    IF TG_OP='UPDATE' AND (NEW.Producto_id,NEW.Emprendedor_id,NEW.Caracteristicas_id)=(OLD.Producto_id,OLD.Emprendedor_id,OLD.Caracteristicas_id) THEN
        v_necesarias:=v_necesarias-(OLD.Cantidad-OLD.CantidadDevuelta);
    END IF;
    SELECT o.Stock INTO v_stock FROM OfrecerP o
    WHERE (o.Producto_id,o.Emprendedor_id,o.Caracteristicas_id)=(NEW.Producto_id,NEW.Emprendedor_id,NEW.Caracteristicas_id);
    IF NOT FOUND OR v_stock<v_necesarias THEN RAISE EXCEPTION 'Stock insuficiente o variante sin inventario'; END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_proteger_borrado_detalle() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_estado VARCHAR;
BEGIN
    SELECT v.Estado INTO v_estado FROM Venta v WHERE v.ID=OLD.Venta_id FOR UPDATE;
    IF EXISTS(SELECT 1 FROM Venta pagada WHERE pagada.ID=OLD.Venta_id AND pagada.Total>0
        AND pagada.Total=(SELECT COALESCE(SUM(Monto),0) FROM Vender WHERE Venta_id=pagada.ID)) THEN
        RAISE EXCEPTION 'Factura pagada: no se elimina detalle';
    END IF;
    IF v_estado<>'En Preparación' THEN RAISE EXCEPTION 'No se borra detalle de una venta cerrada o cancelada'; END IF;
    IF TG_TABLE_NAME='comprar' THEN
        IF OLD.EstadoDevolucion IS NOT NULL THEN RAISE EXCEPTION 'No se borra una compra con devolucion'; END IF;
    END IF;
    RETURN OLD;
END; $$;

CREATE OR REPLACE FUNCTION fn_mover_stock(p_producto INT,p_vendedor VARCHAR,p_variante INT,p_consumo INT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    UPDATE OfrecerP SET Stock=Stock-p_consumo
    WHERE (Producto_id,Emprendedor_id,Caracteristicas_id)=(p_producto,p_vendedor,p_variante) AND Stock>=p_consumo;
    IF NOT FOUND THEN RAISE EXCEPTION 'No se pudo actualizar stock: producto %, vendedor %, variante %',p_producto,p_vendedor,p_variante; END IF;
END; $$;

CREATE OR REPLACE FUNCTION tg_descuento_stock() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_antes INT := 0; v_despues INT := 0; v_venta INT;
BEGIN
    IF TG_OP<>'INSERT' THEN v_antes:=OLD.Cantidad-OLD.CantidadDevuelta; END IF;
    IF TG_OP<>'DELETE' THEN v_despues:=NEW.Cantidad-NEW.CantidadDevuelta; END IF;
    IF TG_OP='UPDATE' AND (OLD.Producto_id,OLD.Emprendedor_id,OLD.Caracteristicas_id)=(NEW.Producto_id,NEW.Emprendedor_id,NEW.Caracteristicas_id) THEN
        PERFORM fn_mover_stock(NEW.Producto_id,NEW.Emprendedor_id,NEW.Caracteristicas_id,v_despues-v_antes);
    ELSE
        IF TG_OP<>'INSERT' THEN PERFORM fn_mover_stock(OLD.Producto_id,OLD.Emprendedor_id,OLD.Caracteristicas_id,-v_antes); END IF;
        IF TG_OP<>'DELETE' THEN PERFORM fn_mover_stock(NEW.Producto_id,NEW.Emprendedor_id,NEW.Caracteristicas_id,v_despues); END IF;
    END IF;
    IF TG_OP='DELETE' THEN v_venta:=OLD.Venta_id; ELSE v_venta:=NEW.Venta_id; END IF;
    PERFORM fn_recalcular_venta(v_venta);
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION tg_ocultar_inactivos() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_producto INT; v_ultima DATE;
BEGIN
    FOR v_producto IN SELECT DISTINCT x FROM unnest(ARRAY[
        CASE WHEN TG_OP<>'INSERT' THEN OLD.Producto_id END,
        CASE WHEN TG_OP<>'DELETE' THEN NEW.Producto_id END]) x WHERE x IS NOT NULL LOOP
        SELECT MAX(v.Fecha) INTO v_ultima FROM Comprar c JOIN Venta v ON v.ID=c.Venta_id
        WHERE c.Producto_id=v_producto AND v.Estado<>'Cancelada';
        UPDATE Producto SET UltimaVenta=v_ultima,
            OcultoPorInactividad=(COALESCE(v_ultima,FechaRegistro)<CURRENT_DATE-40) WHERE ID=v_producto;
    END LOOP;
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION tg_alerta_stock() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.Stock<10 AND (TG_OP='INSERT' OR NEW.Stock IS DISTINCT FROM OLD.Stock) THEN
        RAISE NOTICE 'Stock critico: producto %, vendedor %, variante %, unidades %',NEW.Producto_id,NEW.Emprendedor_id,NEW.Caracteristicas_id,NEW.Stock;
    END IF;
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION tg_barrera_etaria() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v Venta%ROWTYPE; v_servicio Servicio%ROWTYPE; v_edad INT;
BEGIN
    IF TG_OP='UPDATE' AND NEW.Venta_id<>OLD.Venta_id THEN RAISE EXCEPTION 'No se traslada una contratacion a otra venta'; END IF;
    SELECT * INTO v FROM Venta WHERE ID=NEW.Venta_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Venta inexistente'; END IF;
    IF v.Total>0 AND COALESCE((SELECT SUM(Monto) FROM Vender WHERE Venta_id=v.ID),0)=v.Total THEN
        RAISE EXCEPTION 'Factura pagada: contrato inmutable';
    END IF;
    IF v.Estado<>'En Preparación' THEN RAISE EXCEPTION 'El detalle de una venta cerrada o cancelada es inmutable'; END IF;
    IF NEW.Cliente_id IS NOT NULL AND NEW.Cliente_id<>v.Cliente_id THEN RAISE EXCEPTION 'Cliente distinto al de la venta'; END IF;
    IF NEW.Emprendedor_id IS NOT NULL AND NEW.Emprendedor_id<>v.Emprendedor_id THEN RAISE EXCEPTION 'Vendedor distinto al de la venta'; END IF;
    NEW.Cliente_id:=v.Cliente_id; NEW.Emprendedor_id:=v.Emprendedor_id;
    SELECT * INTO v_servicio FROM Servicio WHERE ID=NEW.Servicio_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Servicio inexistente'; END IF;
    IF NOT v_servicio.Activo AND (TG_OP='INSERT' OR NEW.Servicio_id IS DISTINCT FROM OLD.Servicio_id) THEN RAISE EXCEPTION 'Servicio inactivo'; END IF;
    IF TG_OP='INSERT' OR NEW.Servicio_id IS DISTINCT FROM OLD.Servicio_id THEN NEW.EdadMinimaAplicada:=v_servicio.EdadMinima;
    ELSE NEW.EdadMinimaAplicada:=OLD.EdadMinimaAplicada; END IF;
    SELECT EXTRACT(YEAR FROM AGE(v.Fecha,c.FechaNac))::INT INTO v_edad FROM Cliente c WHERE c.RUN=v.Cliente_id;
    IF v_edad<NEW.EdadMinimaAplicada THEN RAISE EXCEPTION 'Edad minima no cumplida: se requieren % anios',NEW.EdadMinimaAplicada; END IF;
    IF v_servicio.Descripcion->>'Modalidad'='Presencial' AND NEW.Direccion_id IS NULL THEN RAISE EXCEPTION 'Servicio presencial sin direccion de realizacion'; END IF;
    IF TG_OP='INSERT' OR NEW.Servicio_id IS DISTINCT FROM OLD.Servicio_id THEN
        NEW.PrecioUnitario:=fn_precio_servicio(NEW.Servicio_id,v.Emprendedor_id,v.Fecha);
        IF NEW.PrecioUnitario IS NULL THEN RAISE EXCEPTION 'Servicio no ofrecido en la fecha indicada'; END IF;
    ELSIF NEW.PrecioUnitario IS DISTINCT FROM OLD.PrecioUnitario THEN RAISE EXCEPTION 'El precio historico no se modifica'; END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_total_contratacion() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP='DELETE' THEN PERFORM fn_recalcular_venta(OLD.Venta_id); ELSE PERFORM fn_recalcular_venta(NEW.Venta_id); END IF;
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION tg_cancelar_venta() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE r RECORD; v_ultima DATE;
BEGIN
    IF NEW.Estado='Cancelada' AND OLD.Estado IS DISTINCT FROM 'Cancelada' THEN
        FOR r IN SELECT c.Producto_id,c.Emprendedor_id,c.Caracteristicas_id,c.Cantidad-c.CantidadDevuelta AS pendiente
                 FROM Comprar c WHERE c.Venta_id=NEW.ID ORDER BY c.Producto_id,c.Emprendedor_id,c.Caracteristicas_id LOOP
            PERFORM fn_mover_stock(r.Producto_id,r.Emprendedor_id,r.Caracteristicas_id,-r.pendiente);
            SELECT MAX(v.Fecha) INTO v_ultima FROM Comprar c JOIN Venta v ON v.ID=c.Venta_id
            WHERE c.Producto_id=r.Producto_id AND v.Estado<>'Cancelada';
            UPDATE Producto SET UltimaVenta=v_ultima,OcultoPorInactividad=(COALESCE(v_ultima,FechaRegistro)<CURRENT_DATE-40)
            WHERE ID=r.Producto_id;
        END LOOP;
    END IF;
    RETURN NULL;
END; $$;

CREATE OR REPLACE FUNCTION tg_fecha_automatica_venta() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v Venta%ROWTYPE; v_cliente VARCHAR; v_otro BIGINT;
BEGIN
    IF TG_OP<>'INSERT' THEN
        PERFORM 1 FROM Venta WHERE ID=OLD.Venta_id FOR UPDATE;
        IF EXISTS(SELECT 1 FROM Venta pagada WHERE pagada.ID=OLD.Venta_id AND pagada.Total>0
            AND pagada.Total=(SELECT COALESCE(SUM(Monto),0) FROM Vender WHERE Venta_id=pagada.ID)) THEN
            RAISE EXCEPTION 'Factura pagada: abonos inmutables';
        END IF;
    END IF;
    IF TG_OP='DELETE' THEN
        IF EXISTS(SELECT 1 FROM Venta WHERE ID=OLD.Venta_id AND Estado<>'En Preparación') THEN RAISE EXCEPTION 'No se borra un abono de venta cerrada'; END IF;
        RETURN OLD;
    END IF;
    SELECT * INTO v FROM Venta WHERE ID=NEW.Venta_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Venta inexistente'; END IF;
    IF v.Estado<>'En Preparación' THEN RAISE EXCEPTION 'Los abonos se registran antes del cierre de la venta'; END IF;
    IF TG_OP='UPDATE' AND NEW.Venta_id<>OLD.Venta_id THEN RAISE EXCEPTION 'No se traslada un abono'; END IF;
    SELECT m.Cliente_id INTO v_cliente FROM MedioPago m WHERE m.ID=NEW.MedioPago_id;
    IF v_cliente IS DISTINCT FROM v.Cliente_id THEN RAISE EXCEPTION 'El medio de pago no pertenece al cliente'; END IF;
    NEW.Fecha:=COALESCE(NEW.Fecha,v.Fecha);
    IF NEW.Fecha<v.Fecha OR NEW.Fecha>CURRENT_DATE THEN RAISE EXCEPTION 'Fecha del abono invalida'; END IF;
    SELECT COALESCE(SUM(p.Monto),0) INTO v_otro FROM Vender p
    WHERE p.Venta_id=NEW.Venta_id AND (TG_OP='INSERT' OR p.MedioPago_id<>OLD.MedioPago_id);
    NEW.Monto:=COALESCE(NEW.Monto,v.Total-v_otro);
    IF NEW.Monto<0 OR NEW.Monto+v_otro>v.Total THEN RAISE EXCEPTION 'Los abonos superan el total de la venta'; END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_proteger_historial_cliente() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS(SELECT 1 FROM Venta v WHERE v.Cliente_id=OLD.RUN) THEN
        RAISE EXCEPTION 'El cliente tiene historial de ventas; no se elimina';
    END IF;
    RETURN OLD;
END; $$;

CREATE OR REPLACE FUNCTION tg_verificar_cotizacion() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_fecha_precio DATE; v_cambiar BOOLEAN;
BEGIN
    IF TG_OP='INSERT' THEN
        NEW.UltimoAjuste:=NEW.Fecha; v_fecha_precio:=NEW.Fecha; v_cambiar:=TRUE;
    ELSE
    
    IF (NEW.Cliente_id,NEW.Emprendedor_id,NEW.Fecha) IS DISTINCT FROM (OLD.Cliente_id,OLD.Emprendedor_id,OLD.Fecha) THEN
            RAISE EXCEPTION 'No se cambia la identidad o fecha original de una cotizacion';
        END IF;
        IF OLD.Estado='Aceptada por el cliente' AND (NEW.Detalle,NEW.Total,NEW.Estado)
           IS DISTINCT FROM (OLD.Detalle,OLD.Total,OLD.Estado) THEN RAISE EXCEPTION 'Cotizacion aceptada inmutable'; END IF;
        v_fecha_precio:=CURRENT_DATE;
        v_cambiar:=OLD.Estado<>'Aceptada por el cliente' AND (
            NEW.Detalle IS DISTINCT FROM OLD.Detalle
            OR (CURRENT_DATE>NEW.Fecha+15 AND (OLD.UltimoAjuste<=NEW.Fecha+15 OR OLD.UltimoAjuste<=CURRENT_DATE-7)));
        IF NOT v_cambiar THEN NEW.Detalle:=OLD.Detalle; NEW.UltimoAjuste:=OLD.UltimoAjuste; END IF;
    END IF;
    IF v_cambiar THEN
        NEW.Detalle:=fn_valorar_cotizacion(NEW.Detalle,NEW.Emprendedor_id,v_fecha_precio);
        NEW.UltimoAjuste:=v_fecha_precio;
    END IF;
    SELECT ROUND(SUM((e->>'cantidad')::NUMERIC*(e->>'precio_unitario')::NUMERIC)*1.19)::INT
        INTO NEW.Total FROM jsonb_array_elements(NEW.Detalle) e;
    IF NEW.Fecha<CURRENT_DATE-45 THEN NEW.Estado:='Expirada'; END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_contexto_pregunta() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    SELECT p.Tiempo INTO NEW.Fecha FROM Pregunta p WHERE p.ID=NEW.Pregunta_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Pregunta inexistente'; END IF;
    IF (TG_TABLE_NAME='preguntarp' AND EXISTS(SELECT 1 FROM PreguntarS WHERE Pregunta_id=NEW.Pregunta_id))
       OR (TG_TABLE_NAME='preguntars' AND EXISTS(SELECT 1 FROM PreguntarP WHERE Pregunta_id=NEW.Pregunta_id)) THEN
        RAISE EXCEPTION 'Una pregunta solo pertenece a un producto o servicio';
    END IF;
    IF TG_TABLE_NAME='preguntarp' THEN
        IF NOT EXISTS(SELECT 1 FROM OfrecerP o WHERE o.Producto_id=NEW.Producto_id AND o.Emprendedor_id=NEW.Emprendedor_id) THEN
            RAISE EXCEPTION 'El emprendedor no ofrece el producto consultado';
        END IF;
    END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_contexto_mensaje() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE m Mensajeria%ROWTYPE; v_tipo TEXT; v_item INT; v_fecha TIMESTAMP;
BEGIN
    SELECT * INTO m FROM Mensajeria WHERE ID=NEW.Mensajeria_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Mensaje inexistente'; END IF;
    NEW.Fecha:=m.Tiempo;
    IF TG_TABLE_NAME='comunicarp' THEN v_tipo:='Producto'; v_item:=NEW.Producto_id;
        IF EXISTS(SELECT 1 FROM ComunicarS WHERE Mensajeria_id=m.ID) THEN RAISE EXCEPTION 'Mensaje ya asociado a un servicio'; END IF;
    ELSE v_tipo:='Servicio'; v_item:=NEW.Servicio_id;
        IF EXISTS(SELECT 1 FROM ComunicarP WHERE Mensajeria_id=m.ID) THEN RAISE EXCEPTION 'Mensaje ya asociado a un producto'; END IF;
    END IF;
    IF NEW.Pregunta_id IS NOT NULL THEN
        SELECT p.Tiempo INTO v_fecha FROM Pregunta p WHERE p.ID=NEW.Pregunta_id;
        IF m.Emisor<>'Emprendedor' OR m.Tiempo<v_fecha THEN RAISE EXCEPTION 'Respuesta publica sin autor o fecha validos'; END IF;
    END IF;
    IF m.RespuestaA IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM vw_comunicaciones c WHERE c.Mensajeria_id=m.RespuestaA
        AND c.tipo_item=v_tipo AND c.item_id=v_item AND c.Cliente_id=NEW.Cliente_id
        AND c.Emprendedor_id=NEW.Emprendedor_id AND c.Emisor<>m.Emisor AND c.Fecha<=m.Tiempo
    ) THEN RAISE EXCEPTION 'La replica no corresponde a esta conversacion o autor'; END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_proteger_tiempo_mensaje() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_TABLE_NAME='mensajeria' THEN
        IF (NEW.Tiempo,NEW.Emisor,NEW.RespuestaA) IS DISTINCT FROM (OLD.Tiempo,OLD.Emisor,OLD.RespuestaA)
           AND (EXISTS(SELECT 1 FROM ComunicarP WHERE Mensajeria_id=OLD.ID) OR EXISTS(SELECT 1 FROM ComunicarS WHERE Mensajeria_id=OLD.ID)) THEN
            RAISE EXCEPTION 'No se cambia autor, fecha o replica de un mensaje asociado';
        END IF;
    ELSE
        IF NEW.Tiempo IS DISTINCT FROM OLD.Tiempo AND (EXISTS(SELECT 1 FROM PreguntarP WHERE Pregunta_id=OLD.ID) OR EXISTS(SELECT 1 FROM PreguntarS WHERE Pregunta_id=OLD.ID)) THEN
            RAISE EXCEPTION 'No se cambia la fecha de una pregunta asociada';
        END IF;
    END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_validar_calificacion() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v Venta%ROWTYPE;
BEGIN
    PERFORM 1 FROM Calificacion WHERE ID=NEW.Calificacion_id FOR UPDATE;
    IF (TG_TABLE_NAME='calificarp' AND EXISTS(SELECT 1 FROM CalificarS WHERE Calificacion_id=NEW.Calificacion_id))
       OR (TG_TABLE_NAME='calificars' AND EXISTS(SELECT 1 FROM CalificarP WHERE Calificacion_id=NEW.Calificacion_id)) THEN
        RAISE EXCEPTION 'Una calificacion no se reutiliza entre productos y servicios';
    END IF;
    SELECT * INTO v FROM Venta WHERE ID=NEW.Venta_id;
    IF v.Estado NOT IN ('Entregado','Recibido') OR NEW.Fecha::DATE<v.Fecha THEN RAISE EXCEPTION 'Solo se califica una compra completada, en fecha posterior a la venta'; END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION tg_registrar_fecha_venta() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.FechaHora:=LOCALTIMESTAMP; NEW.Fecha:=COALESCE(NEW.Fecha,CURRENT_DATE); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION tg_inactividad_servicio() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_id INT; v_ultima DATE;
BEGIN
 FOR v_id IN SELECT DISTINCT x FROM unnest(ARRAY[CASE WHEN TG_OP<>'INSERT' THEN OLD.Servicio_id END,CASE WHEN TG_OP<>'DELETE' THEN NEW.Servicio_id END]) x WHERE x IS NOT NULL LOOP
  SELECT max(v.Fecha) INTO v_ultima FROM Contratar ct JOIN Venta v ON v.ID=ct.Venta_id WHERE ct.Servicio_id=v_id AND v.Estado<>'Cancelada';
  UPDATE Servicio SET UltimaVenta=v_ultima,OcultoPorInactividad=COALESCE(v_ultima,FechaRegistro)<CURRENT_DATE-40 WHERE ID=v_id;
 END LOOP;
 RETURN NULL;
END; $$;

