-- Ejecutar tercero: activación de todos los triggers.

CREATE TRIGGER trg_validar_dv_rut BEFORE INSERT OR UPDATE ON Cliente FOR EACH ROW EXECUTE FUNCTION tg_validar_dv_rut();

CREATE TRIGGER trg_validar_dv_rut BEFORE INSERT OR UPDATE ON Emprendedor FOR EACH ROW EXECUTE FUNCTION tg_validar_dv_rut();

CREATE TRIGGER trg_validar_dv_rut BEFORE INSERT OR UPDATE ON Empresa FOR EACH ROW EXECUTE FUNCTION tg_validar_dv_rut();

CREATE TRIGGER trg_validar_correo BEFORE INSERT OR UPDATE ON Correo FOR EACH ROW EXECUTE FUNCTION tg_validar_correo();

CREATE TRIGGER trg_categoria_sin_ciclos BEFORE INSERT OR UPDATE ON Categoría FOR EACH ROW EXECUTE FUNCTION tg_categoria_sin_ciclos();

CREATE TRIGGER trg_edad_json_servicio BEFORE INSERT OR UPDATE ON Servicio FOR EACH ROW EXECUTE FUNCTION tg_edad_json_servicio();

CREATE TRIGGER trg_10_descuento_frecuencia BEFORE INSERT ON Venta FOR EACH ROW EXECUTE FUNCTION tg_descuento_frecuencia();

CREATE TRIGGER trg_20_incentivo_inactividad BEFORE INSERT ON Venta FOR EACH ROW EXECUTE FUNCTION tg_incentivo_inactividad();

CREATE TRIGGER trg_80_calculo_total_factura BEFORE INSERT OR UPDATE ON Venta FOR EACH ROW EXECUTE FUNCTION tg_calculo_total_factura();

CREATE TRIGGER trg_90_proteger_boleta_cerrada BEFORE UPDATE OR DELETE ON Venta FOR EACH ROW EXECUTE FUNCTION tg_proteger_boleta_cerrada();

CREATE TRIGGER trg_calculo_dinamico_envio BEFORE INSERT OR UPDATE ON Envio FOR EACH ROW EXECUTE FUNCTION tg_calculo_dinamico_envio();

CREATE TRIGGER trg_envio_recalcular_venta AFTER UPDATE OF Valor ON Envio
FOR EACH ROW WHEN (OLD.Valor IS DISTINCT FROM NEW.Valor) EXECUTE FUNCTION tg_envio_recalcular_venta();

CREATE TRIGGER trg_exclusividad_oferta BEFORE INSERT OR UPDATE ON OfertarP FOR EACH ROW EXECUTE FUNCTION tg_exclusividad_oferta();

CREATE TRIGGER trg_exclusividad_oferta BEFORE INSERT OR UPDATE ON OfertarS FOR EACH ROW EXECUTE FUNCTION tg_exclusividad_oferta();

CREATE TRIGGER trg_proteger_variante_cotizada BEFORE DELETE OR UPDATE OF Producto_id,Emprendedor_id,Caracteristicas_id ON OfrecerP
FOR EACH ROW EXECUTE FUNCTION tg_proteger_variante_cotizada();

CREATE TRIGGER trg_proteger_direccion_utilizada BEFORE UPDATE ON Direccion FOR EACH ROW EXECUTE FUNCTION tg_proteger_direccion_utilizada();

CREATE TRIGGER trg_10_precedencia_precios BEFORE INSERT OR UPDATE ON Comprar FOR EACH ROW EXECUTE FUNCTION tg_precedencia_precios();

CREATE TRIGGER trg_20_ocultar_stock_cero BEFORE INSERT OR UPDATE ON Comprar FOR EACH ROW EXECUTE FUNCTION tg_ocultar_stock_cero();

CREATE TRIGGER trg_proteger_borrado_detalle BEFORE DELETE ON Comprar FOR EACH ROW EXECUTE FUNCTION tg_proteger_borrado_detalle();

CREATE TRIGGER trg_proteger_borrado_detalle BEFORE DELETE ON Contratar FOR EACH ROW EXECUTE FUNCTION tg_proteger_borrado_detalle();

CREATE TRIGGER trg_30_descuento_stock AFTER INSERT OR UPDATE OR DELETE ON Comprar FOR EACH ROW EXECUTE FUNCTION tg_descuento_stock();

CREATE TRIGGER trg_40_ocultar_inactivos AFTER INSERT OR UPDATE OR DELETE ON Comprar FOR EACH ROW EXECUTE FUNCTION tg_ocultar_inactivos();

CREATE TRIGGER trg_alerta_stock AFTER INSERT OR UPDATE ON OfrecerP FOR EACH ROW EXECUTE FUNCTION tg_alerta_stock();

CREATE TRIGGER trg_barrera_etaria BEFORE INSERT OR UPDATE ON Contratar FOR EACH ROW EXECUTE FUNCTION tg_barrera_etaria();

CREATE TRIGGER trg_total_contratacion AFTER INSERT OR UPDATE OR DELETE ON Contratar FOR EACH ROW EXECUTE FUNCTION tg_total_contratacion();

CREATE TRIGGER trg_cancelar_venta AFTER UPDATE OF Estado ON Venta FOR EACH ROW EXECUTE FUNCTION tg_cancelar_venta();

CREATE TRIGGER trg_fecha_automatica_venta BEFORE INSERT OR UPDATE OR DELETE ON Vender FOR EACH ROW EXECUTE FUNCTION tg_fecha_automatica_venta();

CREATE TRIGGER trg_proteger_historial_cliente BEFORE DELETE ON Cliente FOR EACH ROW EXECUTE FUNCTION tg_proteger_historial_cliente();

CREATE TRIGGER trg_verificar_cotizacion BEFORE INSERT OR UPDATE ON Cotizacion FOR EACH ROW EXECUTE FUNCTION tg_verificar_cotizacion();

CREATE TRIGGER trg_contexto_pregunta BEFORE INSERT OR UPDATE ON PreguntarP FOR EACH ROW EXECUTE FUNCTION tg_contexto_pregunta();

CREATE TRIGGER trg_contexto_pregunta BEFORE INSERT OR UPDATE ON PreguntarS FOR EACH ROW EXECUTE FUNCTION tg_contexto_pregunta();

CREATE TRIGGER trg_contexto_mensaje BEFORE INSERT OR UPDATE ON ComunicarP FOR EACH ROW EXECUTE FUNCTION tg_contexto_mensaje();

CREATE TRIGGER trg_contexto_mensaje BEFORE INSERT OR UPDATE ON ComunicarS FOR EACH ROW EXECUTE FUNCTION tg_contexto_mensaje();

CREATE TRIGGER trg_proteger_tiempo_mensaje BEFORE UPDATE ON Mensajeria FOR EACH ROW EXECUTE FUNCTION tg_proteger_tiempo_mensaje();

CREATE TRIGGER trg_proteger_tiempo_pregunta BEFORE UPDATE ON Pregunta FOR EACH ROW EXECUTE FUNCTION tg_proteger_tiempo_mensaje();

CREATE TRIGGER trg_validar_calificacion BEFORE INSERT OR UPDATE ON CalificarP FOR EACH ROW EXECUTE FUNCTION tg_validar_calificacion();

CREATE TRIGGER trg_validar_calificacion BEFORE INSERT OR UPDATE ON CalificarS FOR EACH ROW EXECUTE FUNCTION tg_validar_calificacion();

CREATE TRIGGER trg_00_registrar_fecha_venta BEFORE INSERT ON Venta FOR EACH ROW EXECUTE FUNCTION tg_registrar_fecha_venta();

CREATE TRIGGER trg_inactividad_servicio AFTER INSERT OR UPDATE OR DELETE ON Contratar FOR EACH ROW EXECUTE FUNCTION tg_inactividad_servicio();
