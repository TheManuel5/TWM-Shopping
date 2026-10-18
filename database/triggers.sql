CREATE OR REPLACE FUNCTION tg_descuento_frecuencia() RETURNS TRIGGER AS $$
DECLARE v_compras INT;
BEGIN SELECT COUNT(*) INTO v_compras FROM Venta v JOIN Comprar c ON v.ID = c.Venta_id JOIN Vender ve ON v.ID = ve.Venta_id WHERE c.Cliente_id = (SELECT Cliente_id FROM Comprar WHERE Venta_id = NEW.ID LIMIT 1) AND EXTRACT(MONTH FROM ve.Fecha) = EXTRACT(MONTH FROM CURRENT_DATE);
IF v_compras > 5 THEN NEW.Descuento := NEW.ValorBruto * 0.10; NEW.Descripcion := CONCAT(NEW.Descripcion, ' - Descuento cliente frecuente (10%)'); END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_descuento_frecuencia BEFORE INSERT ON Venta FOR EACH ROW EXECUTE FUNCTION tg_descuento_frecuencia();

CREATE OR REPLACE FUNCTION tg_calculo_dinamico_envio() RETURNS TRIGGER AS $$
BEGIN IF NEW.Altura IS NOT NULL AND NEW.Ancho IS NOT NULL AND NEW.Fondo IS NOT NULL THEN NEW.Valor := ((((NEW.Altura * NEW.Ancho * NEW.Fondo) * 0.25) + 2000)::NUMERIC)::MONEY; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_calculo_dinamico_envio BEFORE INSERT OR UPDATE ON Envio FOR EACH ROW EXECUTE FUNCTION tg_calculo_dinamico_envio();

CREATE OR REPLACE FUNCTION tg_exclusividad_oferta() RETURNS TRIGGER AS $$
BEGIN IF EXISTS (SELECT 1 FROM OfertarP WHERE Producto_id = NEW.Producto_id AND (NEW.Finicio BETWEEN Finicio AND COALESCE(Ffin, '2099-12-31') OR COALESCE(NEW.Ffin, '2099-12-31') BETWEEN Finicio AND COALESCE(Ffin, '2099-12-31'))) THEN RAISE EXCEPTION 'Operación rechazada: Oferta solapada.'; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_exclusividad_oferta BEFORE INSERT ON OfertarP FOR EACH ROW EXECUTE FUNCTION tg_exclusividad_oferta();

CREATE OR REPLACE FUNCTION tg_precedencia_precios() RETURNS TRIGGER AS $$
DECLARE v_precio_oferta INT;
BEGIN SELECT o.Precio INTO v_precio_oferta FROM OfertarP op JOIN Oferta o ON op.Oferta_id = o.ID WHERE op.Producto_id = NEW.Producto_id AND CURRENT_DATE BETWEEN op.Finicio AND COALESCE(op.Ffin, '2099-12-31') LIMIT 1; IF v_precio_oferta IS NOT NULL THEN RAISE NOTICE 'Se aplicará precio de Oferta: %', v_precio_oferta; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_precedencia_precios BEFORE INSERT ON Comprar FOR EACH ROW EXECUTE FUNCTION tg_precedencia_precios();

CREATE OR REPLACE FUNCTION tg_barrera_etaria() RETURNS TRIGGER AS $$
DECLARE v_edad INT; v_minima INT;
BEGIN SELECT EXTRACT(YEAR FROM AGE(CURRENT_DATE, FechaNac)) INTO v_edad FROM Cliente WHERE RUN = NEW.Cliente_id; SELECT COALESCE((Descripcion->>'RestriccionEdad')::INT, 0) INTO v_minima FROM Servicio WHERE ID = NEW.Servicio_id;
IF v_edad < v_minima THEN RAISE EXCEPTION 'Edad mínima no cumplida.'; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_barrera_etaria BEFORE INSERT ON Contratar FOR EACH ROW EXECUTE FUNCTION tg_barrera_etaria();

CREATE OR REPLACE FUNCTION tg_validar_correo() RETURNS TRIGGER AS $$
BEGIN IF NEW.Correo !~ '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$' THEN RAISE EXCEPTION 'Correo inválido: %', NEW.Correo; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_validar_correo BEFORE INSERT OR UPDATE ON Correo FOR EACH ROW EXECUTE FUNCTION tg_validar_correo();

CREATE OR REPLACE FUNCTION tg_alerta_stock() RETURNS TRIGGER AS $$
BEGIN IF NEW.Stock < 10 THEN RAISE NOTICE 'ALERTA: Stock crítico para producto ID %. Quedan % unidades.', NEW.Producto_id, NEW.Stock; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_alerta_stock AFTER UPDATE ON OfrecerP FOR EACH ROW EXECUTE FUNCTION tg_alerta_stock();

CREATE OR REPLACE FUNCTION tg_descuento_stock() RETURNS TRIGGER AS $$
BEGIN UPDATE OfrecerP SET Stock = Stock - 1 WHERE Producto_id = NEW.Producto_id; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_descuento_stock AFTER INSERT ON Comprar FOR EACH ROW EXECUTE FUNCTION tg_descuento_stock();

CREATE OR REPLACE FUNCTION tg_aumento_stock_devolucion() RETURNS TRIGGER AS $$
BEGIN IF NEW.EstadoDevolucion = 'Aprobada' AND OLD.EstadoDevolucion IS DISTINCT FROM 'Aprobada' THEN UPDATE OfrecerP SET Stock = Stock + 1 WHERE Producto_id = NEW.Producto_id; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_aumento_stock_devolucion AFTER UPDATE ON Comprar FOR EACH ROW EXECUTE FUNCTION tg_aumento_stock_devolucion();

CREATE OR REPLACE FUNCTION tg_ocultar_stock_cero() RETURNS TRIGGER AS $$
BEGIN IF (SELECT Stock FROM OfrecerP WHERE Producto_id = NEW.Producto_id LIMIT 1) <= 0 THEN RAISE EXCEPTION 'Producto sin stock disponible.'; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_ocultar_stock_cero BEFORE INSERT ON OfertarP FOR EACH ROW EXECUTE FUNCTION tg_ocultar_stock_cero();

CREATE OR REPLACE FUNCTION tg_ocultar_inactivos() RETURNS TRIGGER AS $$
BEGIN UPDATE Producto SET Activo = FALSE WHERE ID NOT IN (SELECT Producto_id FROM Comprar c JOIN Vender ve ON c.Venta_id = ve.Venta_id WHERE ve.Fecha >= CURRENT_DATE - INTERVAL '40 days'); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_ocultar_inactivos AFTER INSERT ON Venta FOR EACH STATEMENT EXECUTE FUNCTION tg_ocultar_inactivos();

CREATE OR REPLACE FUNCTION tg_calculo_total_factura() RETURNS TRIGGER AS $$
BEGIN NEW.Total := ROUND(NEW.ValorBruto * (1 + NEW.IVA / 100.0)) - COALESCE(NEW.Descuento, 0); IF NEW.Total < 0 THEN RAISE EXCEPTION 'Total no puede ser negativo.'; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_calculo_total_factura BEFORE INSERT OR UPDATE ON Venta FOR EACH ROW EXECUTE FUNCTION tg_calculo_total_factura();

CREATE OR REPLACE FUNCTION tg_validar_dv_rut() RETURNS TRIGGER AS $$
BEGIN IF NEW.RUN NOT LIKE '%-K' AND NEW.RUN NOT SIMILAR TO '%-[0-9]' THEN NEW.RUN := CONCAT(SUBSTRING(NEW.RUN FROM 1 FOR LENGTH(NEW.RUN)-1), '-0'); RAISE NOTICE 'RUT DV corregido a %', NEW.RUN; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_validar_dv_rut BEFORE INSERT OR UPDATE ON Cliente FOR EACH ROW EXECUTE FUNCTION tg_validar_dv_rut();

CREATE OR REPLACE FUNCTION tg_fecha_automatica_venta() RETURNS TRIGGER AS $$
BEGIN NEW.Fecha := CURRENT_DATE; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_fecha_automatica_venta BEFORE INSERT ON Vender FOR EACH ROW EXECUTE FUNCTION tg_fecha_automatica_venta();

CREATE OR REPLACE FUNCTION tg_proteger_historial_cliente() RETURNS TRIGGER AS $$
DECLARE v_recientes INT;
BEGIN SELECT COUNT(*) INTO v_recientes FROM Comprar c JOIN Vender ve ON c.Venta_id = ve.Venta_id WHERE c.Cliente_id = OLD.RUN AND ve.Fecha >= CURRENT_DATE - INTERVAL '60 days'; IF v_recientes > 0 THEN RAISE EXCEPTION 'Cliente posee compras recientes.'; END IF; RETURN OLD; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_proteger_historial_cliente BEFORE DELETE ON Cliente FOR EACH ROW EXECUTE FUNCTION tg_proteger_historial_cliente();

CREATE OR REPLACE FUNCTION tg_evitar_stock_negativo() RETURNS TRIGGER AS $$
BEGIN IF NEW.Stock < 0 THEN RAISE EXCEPTION 'Stock no puede ser negativo.'; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_evitar_stock_negativo BEFORE UPDATE ON OfrecerP FOR EACH ROW EXECUTE FUNCTION tg_evitar_stock_negativo();

CREATE OR REPLACE FUNCTION tg_proteger_boleta_cerrada() RETURNS TRIGGER AS $$
BEGIN IF OLD.Estado IN ('Entregado', 'Pagada') THEN RAISE EXCEPTION 'Venta inmutable.'; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_proteger_boleta_cerrada BEFORE UPDATE ON Venta FOR EACH ROW EXECUTE FUNCTION tg_proteger_boleta_cerrada();

CREATE OR REPLACE FUNCTION tg_verificar_cotizacion() RETURNS TRIGGER AS $$
BEGIN RAISE NOTICE 'Evaluando cotización.'; IF NEW.Fecha < CURRENT_DATE - INTERVAL '45 days' THEN NEW.Estado := 'Expirada'; ELSIF NEW.Fecha < CURRENT_DATE - INTERVAL '15 days' THEN NEW.Total := NEW.Total * 1.05; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_verificar_cotizacion BEFORE UPDATE OR INSERT ON Cotizacion FOR EACH ROW EXECUTE FUNCTION tg_verificar_cotizacion();

CREATE OR REPLACE FUNCTION tg_incentivo_inactividad() RETURNS TRIGGER AS $$
DECLARE v_ultima_compra DATE;
BEGIN SELECT MAX(ve.Fecha) INTO v_ultima_compra FROM Comprar c JOIN Vender ve ON c.Venta_id = ve.Venta_id WHERE c.Cliente_id = (SELECT Cliente_id FROM Comprar WHERE Venta_id = NEW.ID LIMIT 1);
IF v_ultima_compra IS NOT NULL AND v_ultima_compra <= CURRENT_DATE - INTERVAL '6 months' THEN
IF CURRENT_DATE <= v_ultima_compra + INTERVAL '6 months' + INTERVAL '45 days' THEN NEW.Descuento := NEW.ValorBruto * 0.05; NEW.Descripcion := CONCAT(NEW.Descripcion, ' - Promo Regreso (5%)'); ELSE RAISE NOTICE 'Beneficio caducado.'; END IF; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_incentivo_inactividad BEFORE INSERT ON Venta FOR EACH ROW EXECUTE FUNCTION tg_incentivo_inactividad();