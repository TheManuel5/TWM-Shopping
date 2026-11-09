-- Extensión TWM basada en las funciones de entrega_mejorada. Preserva las protecciones BDA.

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
        v_precio:=COALESCE((SELECT (d->>'precio_unitario')::int FROM public.cotizacion q CROSS JOIN LATERAL jsonb_array_elements(q.detalle) d WHERE q.id=NULLIF(current_setting('shopping.quote_id',true),'')::int AND q.cliente_id=v.cliente_id AND q.emprendedor_id=v.emprendedor_id AND q.estado='Aceptada por el cliente' AND CURRENT_DATE<=q.fecha+15 AND (d->>'producto_id')::int=NEW.Producto_id AND (d->>'caracteristicas_id')::int=NEW.Caracteristicas_id LIMIT 1),fn_precio_producto(NEW.Producto_id,v.Emprendedor_id,NEW.Caracteristicas_id,v.Fecha));
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
        NEW.PrecioUnitario:=COALESCE((SELECT (d->>'precio_unitario')::int FROM public.cotizacion q CROSS JOIN LATERAL jsonb_array_elements(q.detalle) d WHERE q.id=NULLIF(current_setting('shopping.quote_id',true),'')::int AND q.cliente_id=v.cliente_id AND q.emprendedor_id=v.emprendedor_id AND q.estado='Aceptada por el cliente' AND CURRENT_DATE<=q.fecha+15 AND (d->>'servicio_id')::int=NEW.Servicio_id LIMIT 1),fn_precio_servicio(NEW.Servicio_id,v.Emprendedor_id,v.Fecha));
        IF NEW.PrecioUnitario IS NULL THEN RAISE EXCEPTION 'Servicio no ofrecido en la fecha indicada'; END IF;
    ELSIF NEW.PrecioUnitario IS DISTINCT FROM OLD.PrecioUnitario THEN RAISE EXCEPTION 'El precio historico no se modifica'; END IF;
    RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.fn_valorar_cotizacion(p_detalle JSONB,p_vendedor VARCHAR,p_fecha DATE) RETURNS JSONB LANGUAGE plpgsql STABLE AS $$
DECLARE item jsonb; result jsonb:='[]'; price int; quantity int; product int; variant int;
BEGIN
 IF jsonb_typeof(p_detalle) IS DISTINCT FROM 'array' OR jsonb_array_length(p_detalle)=0 THEN RAISE EXCEPTION 'La cotización requiere artículos';END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(p_detalle) LOOP
  IF coalesce(item->>'cantidad','') !~ '^[1-9][0-9]*$' THEN RAISE EXCEPTION 'Cantidad inválida';END IF;quantity:=(item->>'cantidad')::int;
  IF item ? 'servicio_id' THEN
   product:=(item->>'servicio_id')::int;price:=public.fn_precio_servicio(product,p_vendedor,p_fecha);
   IF EXISTS(SELECT 1 FROM jsonb_array_elements(result) x WHERE x->>'servicio_id'=product::text) THEN RAISE EXCEPTION 'Servicio repetido';END IF;
   IF price IS NULL THEN RAISE EXCEPTION 'Servicio no ofrecido por el vendedor';END IF;
   result:=result||jsonb_build_array(jsonb_build_object('tipo_item','Servicio','servicio_id',product,'cantidad',quantity,'precio_unitario',price));
  ELSE
   product:=(item->>'producto_id')::int;variant:=(item->>'caracteristicas_id')::int;price:=public.fn_precio_producto(product,p_vendedor,variant,p_fecha);
   IF EXISTS(SELECT 1 FROM jsonb_array_elements(result) x WHERE x->>'producto_id'=product::text AND x->>'caracteristicas_id'=variant::text) THEN RAISE EXCEPTION 'Variante repetida';END IF;
   IF price IS NULL THEN RAISE EXCEPTION 'Variante no ofrecida por el vendedor';END IF;
   IF NOT EXISTS(SELECT 1 FROM public.ofrecerp WHERE producto_id=product AND emprendedor_id=p_vendedor AND caracteristicas_id=variant AND stock>=quantity) THEN RAISE NOTICE 'Stock insuficiente para la cantidad cotizada';END IF;
   result:=result||jsonb_build_array(jsonb_build_object('producto_id',product,'caracteristicas_id',variant,'cantidad',quantity,'precio_unitario',price));
  END IF;
 END LOOP;RETURN result;
END;$$;


CREATE OR REPLACE VIEW vw_catalogo_unificado AS
SELECT 'Producto'::TEXT AS tipo_item,p.ID AS item_id,p.Nombre AS item_nombre,c.Nombre AS categoria_nombre,o.Stock AS disponibilidad_stock,fn_precio_producto(p.ID,o.Emprendedor_id,o.Caracteristicas_id,CURRENT_DATE) AS precio,o.Emprendedor_id AS vendedor_run,o.Caracteristicas_id FROM Producto p JOIN Categoría c ON c.ID=p.Categoria_id JOIN OfrecerP o ON o.Producto_id=p.ID WHERE NOT EXISTS(SELECT 1 FROM shopping_ui.listing_state ls WHERE ls.id='P-'||p.ID||'-'||o.Emprendedor_id AND NOT ls.active) AND p.Activo AND COALESCE(p.UltimaVenta,p.FechaRegistro)>=CURRENT_DATE-40 AND o.Stock>0 AND CURRENT_DATE BETWEEN o.FechaInicio AND COALESCE(o.FechaFin,'infinity'::DATE) UNION ALL SELECT 'Servicio',s.ID,s.Nombre,c.Nombre,NULL::INT,fn_precio_servicio(s.ID,o.Emprendedor_id,CURRENT_DATE),o.Emprendedor_id,NULL::INT FROM Servicio s JOIN Categoría c ON c.ID=s.Categoria_id JOIN OfrecerS o ON o.Servicio_id=s.ID WHERE NOT EXISTS(SELECT 1 FROM shopping_ui.listing_state ls WHERE ls.id='S-'||s.ID||'-'||o.Emprendedor_id AND NOT ls.active) AND s.Activo AND COALESCE(s.UltimaVenta,s.FechaRegistro)>=CURRENT_DATE-40 AND CURRENT_DATE BETWEEN o.FechaInicio AND COALESCE(o.FechaFin,'infinity'::DATE);