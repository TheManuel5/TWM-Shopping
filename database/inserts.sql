DO $$
DECLARE i INT;
BEGIN
    INSERT INTO Region (ID, Nombre, Superficie) VALUES (10, 'Los Lagos', 48371) ON CONFLICT DO NOTHING;
    INSERT INTO Provincia (ID, Nombre, Superficie, ID_Region) VALUES (103, 'Osorno', 9253, 10) ON CONFLICT DO NOTHING;
    INSERT INTO Comuna (ID, Nombre, Superficie, ID_Provincia) VALUES (10301, 'Osorno', 955, 103) ON CONFLICT DO NOTHING;

    FOR i IN 1..1000 LOOP
        INSERT INTO Empresa (RUT, Nombre, Giro) VALUES (LPAD(i::text, 8, '0') || '-K', 'Empresa_' || i, 'Comercial') ON CONFLICT DO NOTHING;
        INSERT INTO Cliente (RUN, Nombre, Apellido, FechaNac, Passwd) VALUES (LPAD((10000000 + i)::text, 8, '0') || '-K', 'Cliente_' || i, 'Apellido_' || i, '1990-01-01', 'pass_c_' || i) ON CONFLICT DO NOTHING;
        INSERT INTO Emprendedor (RUN, Nombre, Apellido, FechaNac, Passwd, Web, Empresa_id) VALUES (LPAD((20000000 + i)::text, 8, '0') || '-K', 'Emprendedor_' || i, 'Apellido', '1985-01-01', 'pass_e_' || i, NULL, LPAD(i::text, 8, '0') || '-K') ON CONFLICT DO NOTHING;
        INSERT INTO Envio (Seguimiento, Empresa, Valor, Peso, Altura, Ancho, Fondo, FechaLlegada) VALUES (i, 'Starken', 0::MONEY, 5.0, 10.0, 10.0, 10.0, CURRENT_DATE) ON CONFLICT DO NOTHING;
        INSERT INTO Venta (ID, ValorBruto, IVA, Descuento, Total, Descripcion, Despacho, Estado) VALUES (i, 10000, 19.00, 0, 11900, 'Venta ' || i, i, 'En Preparación') ON CONFLICT DO NOTHING;
        INSERT INTO MedioPago (ID, Tipo, Marca, Digitos) VALUES (i, 'Tarjeta', 'Visa', 1234) ON CONFLICT DO NOTHING;
        INSERT INTO Vender (Venta_id, MedioPago_id, Fecha) VALUES (i, i, CURRENT_DATE) ON CONFLICT DO NOTHING;
        INSERT INTO Categoría (ID, Nombre) VALUES (i, 'Categoria ' || i) ON CONFLICT DO NOTHING;
        INSERT INTO Producto (ID, Nombre, Categoria_id) VALUES (i, 'Producto ' || i, i) ON CONFLICT DO NOTHING;
        INSERT INTO Servicio (ID, Nombre, Precio, Descripcion, Categoria_id) VALUES (i, 'Servicio ' || i, 15000, '{"RestriccionEdad": 18}'::json, i) ON CONFLICT DO NOTHING;
        INSERT INTO OfrecerP (Producto_id, Emprendedor_id, FechaInicio, Stock) VALUES (i, LPAD((20000000 + i)::text, 8, '0') || '-K', CURRENT_DATE, 50) ON CONFLICT DO NOTHING;
        INSERT INTO Comprar (Producto_id, Venta_id, Cliente_id) VALUES (i, i, LPAD((10000000 + i)::text, 8, '0') || '-K') ON CONFLICT DO NOTHING;
        INSERT INTO Contratar (Servicio_id, Venta_id, Cliente_id) VALUES (i, i, LPAD((10000000 + i)::text, 8, '0') || '-K') ON CONFLICT DO NOTHING;
    END LOOP;
END $$;