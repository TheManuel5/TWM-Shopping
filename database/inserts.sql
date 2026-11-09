-- INSERTS COMPLETOS CORREGIDOS. Ejecutar UNA VEZ en el esquema vacio.
-- Los datos de demostracion se cargan por lotes; las series se generan con generate_series.
-- Fechas relativas a CURRENT_DATE para que la demostracion siga siendo reproducible.
-- Los RUN/RUT sinteticos tienen DV correcto; no representan personas reales.
-- Passwd contiene hashes sinteticos de demostracion; no son un sistema de autenticacion.
-- Los catalogos geograficos y las categorias conservan sus valores reales/finita jerarquia.
-- Para inserciones dinamicas por aplicacion, usar las funciones fn_crud_insert_<tabla>(JSONB) de funciones.txt.
BEGIN;

INSERT INTO Region (ID, Nombre, Superficie) VALUES
(4, 'Coquimbo', 40588),
(16, 'Ñuble', 13089),
(10, 'Los Lagos', 48371),
(1, 'Tarapacá', 42319),
(7, 'Maule', 30311),
(15, 'Arica y Parinacota', 16875),
(2, 'Antofagasta', 126144),
(9, 'La Araucanía', 31800),
(14, 'Los Ríos', 18320),
(13, 'Metropolitana de Santiago', 15398),
(6, 'Libertador General Bernardo O''Higgins', 16351),
(12, 'Magallanes y de la Antártica Chilena', 130540),
(3, 'Atacama', 75685),
(8, 'Biobío', 23991),
(11, 'Aysén del General Carlos Ibáñez del Campo', 106821),
(5, 'Valparaíso', 16239);

INSERT INTO Provincia (ID, Nombre, Superficie, ID_Region) VALUES
(122, 'Antártica Chilena', 15730, 12),
(74, 'Linares', 10069, 7),
(141, 'Valdivia', 10164, 14),
(82, 'Arauco', 5483, 8),
(72, 'Cauquenes', 3022, 7),
(73, 'Curicó', 7288, 7),
(114, 'General Carrera', 11756, 11),
(151, 'Arica', 8727, 15),
(103, 'Osorno', 9253, 10),
(43, 'Limarí', 13354, 4),
(132, 'Cordillera', 5518, 13),
(55, 'Quillota', 1112, 5),
(135, 'Melipilla', 4071, 13),
(51, 'Valparaíso', 2018, 5),
(54, 'Petorca', 4589, 5),
(123, 'Tierra del Fuego', 22432, 12),
(41, 'Elqui', 17103, 4),
(62, 'Cardenal Caro', 3296, 6),
(134, 'Maipo', 1122, 13),
(53, 'Los Andes', 3054, 5),
(58, 'Marga Marga', 1159, 5),
(42, 'Choapa', 10130, 4),
(56, 'San Antonio', 1507, 5),
(121, 'Magallanes', 37194, 12),
(111, 'Coihaique', 12714, 11),
(14, 'Tamarugal', 39457, 1),
(57, 'San Felipe de Aconcagua', 2636, 5),
(63, 'Colchagua', 5553, 6),
(21, 'Antofagasta', 67596, 2),
(71, 'Talca', 9932, 7),
(112, 'Aisén', 45945, 11),
(131, 'Santiago', 2031, 13),
(33, 'Huasco', 18211, 3),
(142, 'Ranco', 8156, 14),
(83, 'Biobío', 15040, 8),
(11, 'Iquique', 2862, 1),
(52, 'Isla de Pascua', 164, 5),
(61, 'Cachapoal', 7502, 6),
(92, 'Malleco', 13433, 9),
(31, 'Copiapó', 32732, 3),
(124, 'Última Esperanza', 55184, 12),
(133, 'Chacabuco', 2075, 13),
(136, 'Talagante', 581, 13),
(81, 'Concepción', 3468, 8),
(152, 'Parinacota', 8149, 15),
(161, 'Diguillín', 5089, 16),
(22, 'El Loa', 42085, 2),
(104, 'Palena', 14977, 10),
(91, 'Cautín', 18366, 9),
(102, 'Chiloé', 9286, 10),
(32, 'Chañaral', 24743, 3),
(23, 'Tocopilla', 16462, 2),
(113, 'Capitán Prat', 36406, 11),
(101, 'Llanquihue', 14854, 10),
(162, 'Itata', 2754, 16),
(163, 'Punilla', 5246, 16);

INSERT INTO Comuna (ID, Nombre, Superficie, ID_Provincia) VALUES
(11302, 'O''Higgins', 7785, 113),
(5503, 'Hijuelas', 268, 55),
(8308, 'Quilaco', 1124, 83),
(9209, 'Renaico', 265, 92),
(9202, 'Collipulli', 1306, 92),
(15201, 'Putre', 5890, 152),
(7110, 'San Rafael', 263, 71),
(8311, 'Santa Bárbara', 1251, 83),
(12102, 'Laguna Blanca', 3568, 121),
(11303, 'Tortel', 19991, 113),
(7203, 'Pelluhue', 369, 72),
(8309, 'Quilleco', 1118, 83),
(14202, 'Futrono', 2089, 142),
(9111, 'Nueva Imperial', 731, 91),
(6309, 'Pumanque', 441, 63),
(13130, 'San Miguel', 10, 131),
(3303, 'Freirina', 3221, 33),
(4204, 'Salamanca', 3447, 42),
(13118, 'Macul', 13, 131),
(7309, 'Vichuquén', 452, 73),
(6205, 'Navidad', 301, 62),
(3201, 'Chañaral', 5761, 32),
(4202, 'Canela', 2196, 42),
(16203, 'Coelemu', 342, 162),
(13119, 'Maipú', 137, 131),
(6301, 'San Fernando', 2322, 63),
(7108, 'Río Claro', 433, 71),
(16204, 'Ninhue', 403, 162),
(13123, 'Providencia', 14, 131),
(16101, 'Chillán', 477, 161),
(13131, 'San Ramón', 6, 131),
(10105, 'Frutillar', 828, 101),
(13120, 'Ñuñoa', 17, 131),
(1403, 'Colchane', 4011, 14),
(5602, 'Algarrobo', 176, 56),
(12101, 'Punta Arenas', 17767, 121),
(5803, 'Olmué', 231, 58),
(13603, 'Isla de Maipo', 190, 136),
(4304, 'Punitaqui', 1092, 43),
(13601, 'Talagante', 125, 136),
(16304, 'San Fabián', 1541, 163),
(8111, 'Tomé', 494, 81),
(8108, 'San Pedro de la Paz', 113, 81),
(4105, 'Paiguano', 1514, 41),
(10304, 'Puyehue', 1635, 103),
(7102, 'Constitución', 1339, 71),
(9101, 'Temuco', 467, 91),
(6114, 'Quinta de Tilcoco', 87, 61),
(4102, 'Coquimbo', 1426, 41),
(5402, 'Cabildo', 1455, 54),
(2102, 'Mejillones', 3578, 21),
(10103, 'Cochamó', 3978, 101),
(10108, 'Maullín', 823, 101),
(10106, 'Los Muermos', 1230, 101),
(10107, 'Llanquihue', 433, 101),
(4203, 'Los Vilos', 1859, 42),
(5501, 'Quillota', 301, 55),
(9103, 'Cunco', 1889, 91),
(2104, 'Taltal', 20424, 21),
(2202, 'Ollagüe', 2928, 22),
(6303, 'Chimbarongo', 509, 63),
(5506, 'Nogales', 405, 55),
(9114, 'Pitrufquén', 583, 91),
(13102, 'Cerrillos', 17, 131),
(16301, 'San Carlos', 877, 163),
(6110, 'Mostazal', 526, 61),
(13113, 'La Reina', 23, 131),
(8202, 'Arauco', 960, 82),
(7302, 'Hualañé', 629, 73),
(6104, 'Coltauco', 222, 61),
(4303, 'Monte Patria', 4212, 43),
(9115, 'Pucón', 1247, 91),
(6308, 'Placilla', 144, 63),
(7106, 'Pelarco', 331, 71),
(16206, 'Ranquil', 247, 162),
(9106, 'Galvarino', 568, 91),
(5702, 'Catemu', 362, 57),
(10205, 'Dalcahue', 1230, 102),
(9205, 'Lonquimay', 3928, 92),
(13302, 'Lampa', 450, 133),
(14203, 'Lago Ranco', 1763, 142),
(9113, 'Perquenco', 331, 91),
(6108, 'Machalí', 2594, 61),
(3202, 'Diego de Almagro', 18982, 32),
(8203, 'Cañete', 1089, 82),
(9206, 'Los Sauces', 848, 92),
(12402, 'Torres del Paine', 6216, 124),
(16302, 'Coihueco', 1771, 163),
(4201, 'Illapel', 2629, 42),
(16106, 'Pinto', 1102, 161),
(8304, 'Laja', 345, 83),
(9112, 'Padre Las Casas', 464, 91),
(16205, 'Portezuelo', 289, 162),
(13202, 'Pirque', 445, 132),
(13105, 'El Bosque', 14, 131),
(14105, 'Máfil', 579, 141),
(13108, 'Independencia', 7, 131),
(5601, 'San Antonio', 400, 56),
(13403, 'Calera de Tango', 73, 134),
(5405, 'Zapallar', 288, 54),
(4104, 'La Higuera', 4166, 41),
(14102, 'Corral', 730, 141),
(13117, 'Lo Prado', 7, 131),
(9102, 'Carahue', 1337, 91),
(12302, 'Primavera', 3949, 123),
(14204, 'Río Bueno', 2172, 142),
(13301, 'Colina', 971, 133),
(5802, 'Limache', 295, 58),
(2103, 'Sierra Gorda', 12892, 21),
(16102, 'Bulnes', 426, 161),
(9208, 'Purén', 464, 92),
(5502, 'Calera', 60, 55),
(2302, 'María Elena', 12339, 23),
(8102, 'Coronel', 281, 81),
(5706, 'Santa María', 166, 57),
(3101, 'Copiapó', 17793, 31),
(8206, 'Los Alamos', 601, 82),
(10203, 'Chonchi', 1362, 102),
(13127, 'Recoleta', 16, 131),
(5605, 'El Tabo', 100, 56),
(13402, 'Buin', 217, 134),
(10401, 'Chaitén', 8254, 104),
(7305, 'Rauco', 307, 73),
(10109, 'Puerto Varas', 4027, 101),
(8312, 'Tucapel', 914, 83),
(16202, 'Cobquecura', 569, 162),
(7402, 'Colbún', 2927, 74),
(7303, 'Licantén', 273, 73),
(5101, 'Valparaíso', 311, 51),
(13128, 'Renca', 24, 131),
(3301, 'Vallenar', 7228, 33),
(11401, 'Chile Chico', 5737, 114),
(11102, 'Lago Verde', 5437, 111),
(1401, 'Pozo Almonte', 13775, 14),
(16201, 'Quirihue', 590, 162),
(5304, 'San Esteban', 1375, 53),
(11203, 'Guaitecas', 632, 112),
(7109, 'San Clemente', 4501, 71),
(9109, 'Loncoche', 971, 91),
(11101, 'Coihaique', 7277, 111),
(12301, 'Porvenir', 7463, 123),
(5201, 'Isla de Pascua', 164, 52),
(3304, 'Huasco', 1602, 33),
(10207, 'Queilén', 331, 102),
(8105, 'Hualqui', 536, 81),
(6115, 'Rengo', 585, 61),
(9104, 'Curarrehue', 1166, 91),
(13124, 'Pudahuel', 199, 131),
(6203, 'Litueche', 619, 62),
(13107, 'Huechuraba', 45, 131),
(3102, 'Caldera', 3681, 31),
(4301, 'Ovalle', 3549, 43),
(1107, 'Alto Hospicio', 571, 11),
(16207, 'Treguaco', 313, 162),
(6202, 'La Estrella', 431, 62),
(10102, 'Calbuco', 588, 101),
(9116, 'Saavedra', 398, 91),
(13501, 'Melipilla', 1352, 135),
(5705, 'Putaendo', 1452, 57),
(6106, 'Graneros', 112, 61),
(6304, 'Lolol', 597, 63),
(4103, 'Andacollo', 514, 41),
(8301, 'Los Angeles', 1748, 83),
(13504, 'María Pinto', 394, 135),
(10101, 'Puerto Montt', 1670, 101),
(4106, 'Vicuña', 7582, 41),
(6204, 'Marchihue', 658, 62),
(14108, 'Panguipulli', 3295, 141),
(9210, 'Traiguén', 897, 92),
(8306, 'Nacimiento', 904, 83),
(6113, 'Pichidegua', 319, 61),
(9119, 'Vilcún', 1415, 91),
(13112, 'La Pintana', 30, 131),
(10305, 'Río Negro', 1281, 103),
(4305, 'Río Hurtado', 2205, 43),
(8302, 'Antuco', 1957, 83),
(6305, 'Nancagua', 152, 63),
(7403, 'Longaví', 1453, 74),
(11201, 'Aisén', 29892, 112),
(9120, 'Villarrica', 1292, 91),
(7406, 'San Javier', 1311, 74),
(6112, 'Peumo', 155, 61),
(1404, 'Huara', 10479, 14),
(6306, 'Palmilla', 236, 63),
(5404, 'Petorca', 1516, 54),
(7405, 'Retiro', 827, 74),
(10104, 'Fresia', 1276, 101),
(5606, 'Santo Domingo', 537, 56),
(16108, 'San Ignacio', 363, 161),
(16105, 'Pemuco', 563, 161),
(5804, 'Villa Alemana', 96, 58),
(13126, 'Quinta Normal', 12, 131),
(2203, 'San Pedro de Atacama', 23613, 22),
(8104, 'Florida', 606, 81),
(13111, 'La Granja', 10, 131),
(14104, 'Los Lagos', 1788, 141),
(14106, 'Mariquina', 1319, 141),
(7308, 'Teno', 618, 73),
(12401, 'Natales', 48968, 124),
(7408, 'Yerbas Buenas', 259, 74),
(1402, 'Camiña', 2201, 14),
(13201, 'Puente Alto', 88, 132),
(6201, 'Pichilemu', 715, 62),
(7103, 'Curepto', 1070, 71),
(6102, 'Codegua', 284, 61),
(9211, 'Victoria', 1262, 92),
(13404, 'Paine', 678, 134),
(6206, 'Paredones', 572, 62),
(10403, 'Hualaihué', 2833, 104),
(5604, 'El Quisco', 51, 56),
(8103, 'Chiguayante', 71, 81),
(2201, 'Calama', 15545, 22),
(10209, 'Quemchi', 438, 102),
(9121, 'Cholchol', 427, 91),
(13132, 'Vitacura', 29, 131),
(11402, 'Río Ibáñez', 6019, 114),
(6109, 'Malloa', 221, 61),
(5107, 'Quintero', 146, 51),
(11202, 'Cisnes', 15421, 112),
(14101, 'Valdivia', 1019, 141),
(7407, 'Villa Alegre', 189, 74),
(15102, 'Camarones', 3925, 151),
(9117, 'Teodoro Schmidt', 656, 91),
(6116, 'Requínoa', 677, 61),
(5403, 'Papudo', 166, 54),
(9203, 'Curacautín', 1658, 92),
(10402, 'Futaleufú', 1236, 104),
(10206, 'Puqueldón', 97, 102),
(13125, 'Quilicura', 57, 131),
(8107, 'Penco', 108, 81),
(13101, 'Santiago', 23, 131),
(8201, 'Lebu', 565, 82),
(6302, 'Chépica', 477, 63),
(12104, 'San Gregorio', 6711, 121),
(10302, 'Puerto Octay', 1793, 103),
(13503, 'Curacaví', 694, 135),
(5703, 'Llaillay', 349, 57),
(10306, 'San Juan de la Costa', 1507, 103),
(16107, 'Quillón', 406, 161),
(13605, 'Peñaflor', 69, 136),
(9107, 'Gorbea', 690, 91),
(13602, 'El Monte', 116, 136),
(13104, 'Conchalí', 11, 131),
(10301, 'Osorno', 955, 103),
(8314, 'Alto Biobío', 2124, 83),
(16104, 'El Carmen', 666, 161),
(8204, 'Contulmo', 639, 82),
(16103, 'Chillán Viejo', 262, 161),
(8110, 'Talcahuano', 93, 81),
(8307, 'Negrete', 155, 83),
(4101, 'La Serena', 1901, 41),
(8106, 'Lota', 115, 81),
(5704, 'Panquehue', 120, 57),
(7307, 'Sagrada Familia', 554, 73),
(9108, 'Lautaro', 906, 91),
(14201, 'La Unión', 2132, 142),
(15202, 'General Lagos', 2259, 152),
(7104, 'Empedrado', 565, 71),
(13109, 'La Cisterna', 10, 131),
(13106, 'Estación Central', 14, 131),
(13401, 'San Bernardo', 154, 134),
(9207, 'Lumaco', 1110, 92),
(7105, 'Maule', 243, 71),
(1101, 'Iquique', 2291, 11),
(10303, 'Purranque', 1452, 103),
(6307, 'Peralillo', 283, 63),
(5102, 'Casablanca', 954, 51),
(8101, 'Concepción', 220, 81),
(11301, 'Cochrane', 8630, 113),
(7401, 'Linares', 1466, 74),
(7404, 'Parral', 1638, 74),
(14107, 'Paillaco', 902, 141),
(10208, 'Quellón', 3362, 102),
(7107, 'Pencahue', 955, 71),
(6105, 'Doñihue', 81, 61),
(7201, 'Cauquenes', 2125, 72),
(12303, 'Timaukel', 11020, 123),
(8303, 'Cabrero', 657, 83),
(8305, 'Mulchén', 1921, 83),
(2301, 'Tocopilla', 4123, 23),
(13115, 'Lo Barnechea', 1024, 131),
(9105, 'Freire', 870, 91),
(16305, 'San Nicolás', 566, 163),
(13502, 'Alhué', 844, 135),
(6107, 'Las Cabras', 751, 61),
(9118, 'Toltén', 852, 91),
(9201, 'Angol', 1197, 92),
(16303, 'Ñiquén', 492, 163),
(5105, 'Puchuncaví', 299, 51),
(9110, 'Melipeuco', 1107, 91),
(13203, 'San José de Maipo', 4985, 132),
(5401, 'La Ligua', 1164, 54),
(8109, 'Santa Juana', 777, 81),
(8205, 'Curanilahue', 1003, 82),
(15101, 'Arica', 4802, 151),
(3103, 'Tierra Amarilla', 11258, 31),
(13103, 'Cerro Navia', 11, 131),
(5504, 'La Cruz', 78, 55),
(7306, 'Romeral', 1603, 73),
(5603, 'Cartagena', 244, 56),
(5801, 'Quilpué', 536, 58),
(8313, 'Yumbel', 727, 83),
(13116, 'Lo Espejo', 8, 131),
(1405, 'Pica', 8990, 14),
(10210, 'Quinchao', 159, 102),
(13110, 'La Florida', 71, 131),
(12103, 'Río Verde', 9148, 121),
(9204, 'Ercilla', 499, 92),
(10201, 'Castro', 472, 102),
(5104, 'Juan Fernández', 111, 51),
(5103, 'Concón', 77, 51),
(8310, 'San Rosendo', 94, 83),
(2101, 'Antofagasta', 30702, 21),
(5701, 'San Felipe', 187, 57),
(14103, 'Lanco', 533, 141),
(13303, 'Tiltil', 655, 133),
(13129, 'San Joaquín', 10, 131),
(12201, 'Cabo de Hornos', 15730, 122),
(7202, 'Chanco', 528, 72),
(13604, 'Padre Hurtado', 81, 136),
(10204, 'Curaco de Vélez', 80, 102),
(5109, 'Viña del Mar', 120, 51),
(7301, 'Curicó', 1335, 73),
(5302, 'Calle Larga', 321, 53),
(6101, 'Rancagua', 261, 61),
(6117, 'San Vicente', 485, 61),
(8207, 'Tirúa', 627, 82),
(3302, 'Alto del Carmen', 6159, 33),
(10404, 'Palena', 2654, 104),
(4302, 'Combarbalá', 2296, 43),
(13121, 'Pedro Aguirre Cerda', 9, 131),
(6310, 'Santa Cruz', 393, 63),
(5301, 'Los Andes', 1235, 53),
(8112, 'Hualpén', 54, 81),
(10307, 'San Pablo', 630, 103),
(6103, 'Coinco', 97, 61),
(7101, 'Talca', 232, 71),
(7304, 'Molina', 1517, 73),
(16109, 'Yungay', 824, 161),
(13114, 'Las Condes', 99, 131),
(13505, 'San Pedro', 787, 135),
(13122, 'Peñalolén', 54, 131),
(5303, 'Rinconada', 123, 53),
(6111, 'Olivar', 44, 61),
(10202, 'Ancud', 1756, 102);


INSERT INTO Empresa(RUT,Nombre,Giro,Web)
SELECT fn_rut_desde_numero(76000000+i),'Empresa '||i,
       CASE i%3 WHEN 0 THEN 'Comercial' WHEN 1 THEN 'Educacion' ELSE 'Servicios' END,
       CASE WHEN i%3<>0 THEN 'https://empresa'||i||'.example' END
FROM generate_series(1,1000) g(i);

INSERT INTO Emprendedor(RUN,Nombre,Apellido,FechaNac,Passwd,Web,Empresa_id,FechaRegistro)
SELECT fn_rut_desde_numero(20000000+i),'Emprendedor '||i,'Apellido '||i,
       CASE WHEN i%10=0 THEN DATE '1955-01-01' ELSE DATE '1980-01-01' END,
       encode(sha256(convert_to('hash-demo-emprendedor-'||i,'UTF8')),'hex'),
       CASE WHEN i%4<>0 THEN 'https://perfil'||i||'.example' END,
       fn_rut_desde_numero(76000000+i),CURRENT_DATE-900
FROM generate_series(1,1000) g(i);

INSERT INTO Cliente(RUN,Nombre,Apellido,FechaNac,Passwd,FechaRegistro)
SELECT fn_rut_desde_numero(CASE WHEN i<=100 THEN 20000000+i ELSE 10000000+i END),'Cliente '||i,'Apellido '||i,
       CASE WHEN i<=100 AND i%10=0 THEN DATE '1955-01-01'
            WHEN i<=100 THEN DATE '1980-01-01'
            WHEN i%25=0 THEN (CURRENT_DATE-INTERVAL '16 years')::DATE ELSE DATE '1990-01-01' END,
       encode(sha256(convert_to('hash-demo-cliente-'||i,'UTF8')),'hex'),
       CASE WHEN i>850 THEN (date_trunc('month',CURRENT_DATE)-INTERVAL '1 month')::DATE+(i%20)
            ELSE CURRENT_DATE-900 END
FROM generate_series(1,1000) g(i);

INSERT INTO Direccion(ID,CodPostal,Calle,Numero,Pasaje,Sector,Comuna_id,Cliente_id,Emprendedor_id)
SELECT i,lpad((1000000+i%500)::TEXT,7,'0'),
       CASE WHEN i%2=0 THEN 'Avenida Central' ELSE 'Camino del Lago' END,1+i%999,
       CASE WHEN i%3<>0 THEN 'Pasaje '||i END,CASE WHEN i%4<>0 THEN 'Sector '||i%20 END,
       (SELECT c.ID FROM Comuna c ORDER BY c.ID OFFSET ((i-1)%(SELECT COUNT(*) FROM Comuna)) LIMIT 1),
       CASE WHEN i<=2000 THEN fn_rut_desde_numero(CASE WHEN ((i-1)%1000+1)<=100 THEN 20000000+((i-1)%1000+1) ELSE 10000000+((i-1)%1000+1) END) END,
       CASE WHEN i>2000 THEN fn_rut_desde_numero(20000000+((i-1)%1000+1)) END
FROM generate_series(1,4000) g(i);

INSERT INTO Registrar(Cliente_id,Direccion_id)
SELECT fn_rut_desde_numero(CASE WHEN ((i-1)%1000+1)<=100 THEN 20000000+((i-1)%1000+1) ELSE 10000000+((i-1)%1000+1) END),i FROM generate_series(1,2000) g(i);

INSERT INTO TieneDirEmpresa(Empresa_ID,Direccion_id)
SELECT fn_rut_desde_numero(76000000+i),2000+i FROM generate_series(1,1000) g(i);

INSERT INTO TieneDirE(Emprendedor_id,Direccion_id)
SELECT fn_rut_desde_numero(20000000+((i-1)%1000+1)),2000+i FROM generate_series(1,2000) g(i);

INSERT INTO Telefono(Telefono,Cliente_id,Emprendedor_id,Empresa_id)
SELECT '+569'||lpad((10000000+i)::TEXT,8,'0'),
       CASE WHEN i<=1000 THEN fn_rut_desde_numero(CASE WHEN i<=100 THEN 20000000+i ELSE 10000000+i END) END,
       CASE WHEN i BETWEEN 1001 AND 2000 THEN fn_rut_desde_numero(20000000+(i-1000)) END,
       CASE WHEN i>2000 THEN fn_rut_desde_numero(76000000+i-2000) END
FROM generate_series(1,3000) g(i);

INSERT INTO Correo(Correo,Cliente_id,Emprendedor_id,Empresa_id)
SELECT 'usuario'||i||'@demostracion.technology',
       CASE WHEN i<=1000 THEN fn_rut_desde_numero(CASE WHEN i<=100 THEN 20000000+i ELSE 10000000+i END) END,
       CASE WHEN i BETWEEN 1001 AND 2000 THEN fn_rut_desde_numero(20000000+(i-1000)) END,
       CASE WHEN i>2000 THEN fn_rut_desde_numero(76000000+i-2000) END
FROM generate_series(1,3000) g(i);

INSERT INTO Categoría(ID,Nombre,Categoria_id) VALUES
(1,'Tecnología',NULL),(2,'Vestuario',NULL),(3,'Alimentacion',NULL),(4,'Educacion',NULL),
(5,'Servicios profesionales',NULL),(6,'Categoria vacia A',NULL),(7,'Categoria vacia B',NULL),
(11,'Computacion',1),(12,'Ropa y calzado',2),(13,'Alimentos',3),(14,'Libros y material educativo',4),
(15,'Educativo presencial',4),(16,'Profesional presencial',5),(17,'Profesional remoto',5),
(21,'Accesorios informaticos',11),(22,'Ropa de invierno',12);

INSERT INTO Producto(ID,Nombre,Restriccion,EdadMinima,Descripción,Categoria_id,FechaRegistro)
SELECT i,'Producto '||i,NULL,CASE WHEN i%50=0 THEN 18 ELSE 0 END,
       jsonb_build_object('Material principal',CASE WHEN i%4=2 THEN 'Algodon' ELSE 'Material mixto' END,
         'Peso',1.0+i%12,'Ancho',CASE WHEN i%8=0 THEN 60 ELSE 10 END,'Alto',40,'Fondo',30,
         'Variantes',jsonb_build_array(jsonb_build_object('Color','Rojo','Talla','S'),
            jsonb_build_object('Color','Azul','Talla','M'),jsonb_build_object('Color','Verde','Talla','L'),
            jsonb_build_object('Color','Amarillo','Talla','XL')))
         ||CASE WHEN i%3=0 THEN jsonb_build_object('Garantía','12 meses') ELSE '{}'::JSONB END,
       CASE i%4 WHEN 1 THEN 21 WHEN 2 THEN 22 WHEN 3 THEN 13 ELSE 14 END,CURRENT_DATE-900
FROM generate_series(1,1004) g(i);

INSERT INTO Servicio(ID,Nombre,Restriccion,EdadMinima,Duracion,Precio,Descripcion,Categoria_id)
SELECT i,'Servicio '||i,NULL,CASE WHEN i%4=0 THEN 18 ELSE 12 END,INTERVAL '2 hours',15000+i*3,
       jsonb_build_object('Modalidad',CASE WHEN i%3=2 THEN 'Remoto' ELSE 'Presencial' END),
       CASE i%3 WHEN 1 THEN 15 WHEN 2 THEN 17 ELSE 16 END
FROM generate_series(1,1000) g(i);

INSERT INTO Caracteristicas(ID,Peso,Color,Marca,Material,Medidas,Talla)
SELECT i,1.0+i%12,(ARRAY['Rojo','Azul','Verde','Amarillo'])[(i-1)%4+1],
       'Marca Demo','Algodon','40x30x10',(ARRAY['S','M','L','XL'])[(i-1)%4+1]
FROM generate_series(1,4016) g(i);

INSERT INTO Poseer(Caracteristicas_id,Producto_id,Precio)
SELECT i,(i-1)/4+1,10000+((i-1)/4+1)*5+((i-1)%4+1)*50
FROM generate_series(1,4016) g(i);

INSERT INTO OfrecerP(Producto_id,Emprendedor_id,Caracteristicas_id,FechaInicio,Stock,Precio)
SELECT p.Producto_id,fn_rut_desde_numero(20000000+((p.Producto_id-1)%1000+1)),p.Caracteristicas_id,CURRENT_DATE-900,500,p.Precio FROM Poseer p
UNION ALL
SELECT i,fn_rut_desde_numero(20000000+(i%1000+1)),(i-1)*4+1,CURRENT_DATE-900,500,10550+i*5
FROM generate_series(1,1000) g(i);

INSERT INTO OfrecerS(Servicio_id,Emprendedor_id,FechaInicio)
SELECT i,fn_rut_desde_numero(20000000+i),CURRENT_DATE-900 FROM generate_series(1,1000) g(i);

INSERT INTO Oferta(ID,Precio)
SELECT i,CASE WHEN i<=1000 THEN 8000+i*2 ELSE 12000+(i-1000)*2 END
FROM generate_series(1,2000) g(i);

INSERT INTO OfertarP(Producto_id,Oferta_id,Emprendedor_id,Caracteristicas_id,Finicio,Ffin)
SELECT i,i,fn_rut_desde_numero(20000000+i),(i-1)*4+1,
       CASE WHEN i%5=0 THEN CURRENT_DATE-50 WHEN i%3=0 THEN CURRENT_DATE+1 ELSE CURRENT_DATE-5 END,
       CASE WHEN i%5=0 THEN CURRENT_DATE-35 WHEN i%3=0 THEN CURRENT_DATE+3 WHEN i%3=1 THEN CURRENT_DATE ELSE CURRENT_DATE+7 END
FROM generate_series(1,1000) g(i);

INSERT INTO OfertarS(Servicio_id,Oferta_id,Emprendedor_id,Finicio,Ffin)
SELECT i,1000+i,fn_rut_desde_numero(20000000+i),
       CASE WHEN i%5=0 THEN CURRENT_DATE-50 WHEN i%3=0 THEN CURRENT_DATE+1 ELSE CURRENT_DATE-5 END,
       CASE WHEN i%5=0 THEN CURRENT_DATE-35 WHEN i%3=0 THEN CURRENT_DATE+3 WHEN i%3=1 THEN CURRENT_DATE ELSE CURRENT_DATE+7 END
FROM generate_series(1,1000) g(i);

INSERT INTO MedioPago(ID,Cliente_id,Tipo,Marca,Digitos,CodigoTransferencia)
SELECT i,fn_rut_desde_numero(CASE WHEN i<=100 THEN 20000000+i ELSE 10000000+i END),CASE i%3 WHEN 0 THEN 'Transferencia' WHEN 1 THEN 'Tarjeta' ELSE 'Efectivo' END,
       CASE WHEN i%3=1 THEN CASE WHEN i%2=0 THEN 'Visa' ELSE 'MasterCard' END END,
       CASE WHEN i%3=1 THEN lpad((i%10000)::TEXT,4,'0') END,
       CASE WHEN i%3=0 THEN 'TRX-DEMO-'||i END
FROM generate_series(1,1000) g(i);

WITH semilla AS (
 SELECT n,(n-1)%1000+1 AS producto,((n-1+(n-1)/1000*17)%850)+1 AS candidato,
 CASE (n-1)/1000 WHEN 0 THEN CURRENT_DATE-n%11 WHEN 1 THEN CURRENT_DATE-30-n%9
      WHEN 2 THEN CURRENT_DATE-70-n%15 WHEN 3 THEN CURRENT_DATE-210-n%10
      WHEN 4 THEN GREATEST(date_trunc('month',CURRENT_DATE)::DATE,CURRENT_DATE-6)
      WHEN 5 THEN GREATEST(date_trunc('month',CURRENT_DATE)::DATE,CURRENT_DATE-5)
      WHEN 6 THEN GREATEST(date_trunc('month',CURRENT_DATE)::DATE,CURRENT_DATE-4)
      WHEN 7 THEN GREATEST(date_trunc('month',CURRENT_DATE)::DATE,CURRENT_DATE-3)
      WHEN 8 THEN GREATEST(date_trunc('month',CURRENT_DATE)::DATE,CURRENT_DATE-2)
      WHEN 9 THEN GREATEST(date_trunc('month',CURRENT_DATE)::DATE,CURRENT_DATE-1) ELSE CURRENT_DATE END AS fecha
 FROM generate_series(1,12000) g(n)
), datos AS (
 SELECT n,producto,CASE WHEN candidato>100 AND candidato%25=0 THEN CASE WHEN candidato=850 THEN 849 ELSE candidato+1 END ELSE candidato END AS cliente,fecha FROM semilla
)
INSERT INTO Envio(Seguimiento,Cliente_id,Direccion_id,FechaSalida,FechaLlegada,Empresa,Peso,Altura,Ancho,Fondo,Estado)
SELECT n,fn_rut_desde_numero(CASE WHEN cliente<=100 THEN 20000000+cliente ELSE 10000000+cliente END),cliente,fecha,
       CASE WHEN n%10<>0 AND n%37<>0 THEN LEAST(CURRENT_DATE,fecha+2) END,
       CASE WHEN n%2=0 THEN 'Transporte A' ELSE 'Transporte B' END,
       CASE WHEN n%3=0 THEN 15 ELSE 5 END,10+n%15,10,10,
       CASE WHEN n%10<>0 AND n%37<>0 THEN 'Entregado' ELSE 'En Preparación' END
FROM datos WHERE n<=1000;

WITH semilla AS (
 SELECT n,(n-1)%1000+1 AS producto,((n-1+(n-1)/1000*17)%850)+1 AS candidato,
 CASE (n-1)/1000 WHEN 0 THEN CURRENT_DATE-n%11 WHEN 1 THEN CURRENT_DATE-30-n%9
      WHEN 2 THEN CURRENT_DATE-70-n%15 WHEN 3 THEN CURRENT_DATE-210-n%10
      WHEN 4 THEN GREATEST(date_trunc('month',CURRENT_DATE)::DATE,CURRENT_DATE-6)
      WHEN 5 THEN GREATEST(date_trunc('month',CURRENT_DATE)::DATE,CURRENT_DATE-5)
      WHEN 6 THEN GREATEST(date_trunc('month',CURRENT_DATE)::DATE,CURRENT_DATE-4)
      WHEN 7 THEN GREATEST(date_trunc('month',CURRENT_DATE)::DATE,CURRENT_DATE-3)
      WHEN 8 THEN GREATEST(date_trunc('month',CURRENT_DATE)::DATE,CURRENT_DATE-2)
      WHEN 9 THEN GREATEST(date_trunc('month',CURRENT_DATE)::DATE,CURRENT_DATE-1) ELSE CURRENT_DATE END AS fecha
 FROM generate_series(1,12000) g(n)
), datos AS (
 SELECT n,producto,CASE WHEN candidato>100 AND candidato%25=0 THEN CASE WHEN candidato=850 THEN 849 ELSE candidato+1 END ELSE candidato END AS cliente,fecha FROM semilla
)
-- Algunas ventas incluyen una promocion de campana explicita para probar descuentos historicos.
INSERT INTO Venta(ID,Cliente_id,Emprendedor_id,Fecha,PorcentajeDescuento,Descripcion,Despacho)
SELECT n,fn_rut_desde_numero(CASE WHEN cliente<=100 THEN 20000000+cliente ELSE 10000000+cliente END),fn_rut_desde_numero(20000000+producto),fecha,CASE WHEN n%9=0 THEN 10 ELSE 0 END,'Venta de demostracion '||n,
       CASE WHEN n<=1000 THEN n END
FROM datos ORDER BY n;

INSERT INTO Comprar(Producto_id,Caracteristicas_id,Venta_id,Cantidad)
SELECT (v.ID-1)%1000+1,((v.ID-1)%1000)*4+1,v.ID,1+v.ID%3 FROM Venta v
UNION ALL
SELECT ((v.ID-2+1000)%1000)+1,((v.ID-2+1000)%1000)*4+1,v.ID,1 FROM Venta v WHERE v.ID%5=0
UNION ALL
SELECT (v.ID-1)%1000+1,((v.ID-1)%1000)*4+2,v.ID,1 FROM Venta v WHERE v.ID%7=0;

INSERT INTO Contratar(Servicio_id,Venta_id,Cantidad,Direccion_id)
SELECT (v.ID-1)%1000+1,v.ID,1,
       CASE WHEN split_part(v.Cliente_id,'-',1)::INT>=20000000 THEN split_part(v.Cliente_id,'-',1)::INT-20000000
            ELSE split_part(v.Cliente_id,'-',1)::INT-10000000 END FROM Venta v;

INSERT INTO Vender(Venta_id,MedioPago_id,Fecha)
SELECT v.ID,CASE WHEN split_part(v.Cliente_id,'-',1)::INT>=20000000 THEN split_part(v.Cliente_id,'-',1)::INT-20000000
                ELSE split_part(v.Cliente_id,'-',1)::INT-10000000 END,v.Fecha FROM Venta v;

-- Estados finales despues de cargar detalle y abonos.
UPDATE Venta SET Estado='Cancelada' WHERE ID%37=0;
UPDATE Venta SET Estado='Entregado' WHERE ID%37<>0 AND ID%10<>0;
-- Las facturas entregadas permanecen inmutables.
UPDATE Venta SET Estado='Despachado' WHERE ID<=1000 AND Estado='En Preparación' AND ID%20=10;
UPDATE Venta SET Estado='En reparto' WHERE Estado='Despachado' AND ID%40=10;
UPDATE Envio e SET Estado=v.Estado FROM Venta v WHERE v.Despacho=e.Seguimiento AND v.Estado IN ('Despachado','En reparto');

WITH productos AS (SELECT v.ID,v.Cliente_id,v.Emprendedor_id,v.Fecha,row_number() OVER(ORDER BY v.ID) AS rn FROM Venta v WHERE v.Estado IN ('Entregado','Recibido')), servicios AS (SELECT v.ID,v.Cliente_id,v.Emprendedor_id,v.Fecha,row_number() OVER(ORDER BY v.ID) AS rn FROM Venta v WHERE v.Estado IN ('Entregado','Recibido') AND split_part(v.Emprendedor_id,'-',1)::INT<=20000800)
INSERT INTO Calificacion(ID,Puntaje,Comentario)
SELECT rn,CASE split_part(Emprendedor_id,'-',1)::INT%5 WHEN 0 THEN 2 WHEN 1 THEN 5 ELSE 4 END,
       CASE split_part(Emprendedor_id,'-',1)::INT%5 WHEN 0 THEN 'Calidad deficiente' WHEN 1 THEN 'Excelente, recomendado' ELSE 'Producto recomendado' END
FROM productos WHERE rn<=5000
UNION ALL
SELECT 5000+rn,CASE split_part(Emprendedor_id,'-',1)::INT%5 WHEN 0 THEN 2 WHEN 1 THEN 5 ELSE 4 END,'Servicio recomendado'
FROM servicios WHERE rn<=5000;

WITH productos AS (SELECT v.ID,v.Cliente_id,v.Emprendedor_id,v.Fecha,row_number() OVER(ORDER BY v.ID) AS rn FROM Venta v WHERE v.Estado IN ('Entregado','Recibido'))
INSERT INTO CalificarP(Producto_id,Caracteristicas_id,Calificacion_id,Venta_id,Cliente_id,Emprendedor_id,Fecha)
SELECT (ID-1)%1000+1,((ID-1)%1000)*4+1,rn,ID,Cliente_id,Emprendedor_id,
       LEAST(LOCALTIMESTAMP,Fecha::TIMESTAMP+INTERVAL '3 days') FROM productos WHERE rn<=5000;

WITH servicios AS (SELECT v.ID,v.Cliente_id,v.Emprendedor_id,v.Fecha,row_number() OVER(ORDER BY v.ID) AS rn FROM Venta v WHERE v.Estado IN ('Entregado','Recibido') AND split_part(v.Emprendedor_id,'-',1)::INT<=20000800)
INSERT INTO CalificarS(Servicio_id,Cliente_id,Calificacion_id,Venta_id,Emprendedor_id,Fecha)
SELECT (ID-1)%1000+1,Cliente_id,5000+rn,ID,Emprendedor_id,
       LEAST(LOCALTIMESTAMP,Fecha::TIMESTAMP+INTERVAL '3 days') FROM servicios WHERE rn<=5000;

WITH candidatos AS (
 SELECT c.*,v.Fecha,v.IVA,v.Descuento,v.ValorBruto,row_number() OVER(ORDER BY c.Venta_id) AS rn
 FROM Comprar c JOIN Venta v ON v.ID=c.Venta_id
 WHERE v.Estado IN ('Entregado','Recibido') AND c.Caracteristicas_id=(c.Producto_id-1)*4+1
   AND c.Producto_id=(c.Venta_id-1)%1000+1
)
INSERT INTO Devolucion(ID,Valor,Medio,Motivo)
SELECT rn,ROUND(PrecioUnitario::NUMERIC*(1-Descuento::NUMERIC/NULLIF(ValorBruto,0))*(1+IVA/100.0))::INT,
       'Transferencia','Producto no corresponde a lo solicitado' FROM candidatos WHERE rn<=1000;

WITH candidatos AS (
 SELECT c.*,v.Fecha,v.IVA,v.Descuento,v.ValorBruto,row_number() OVER(ORDER BY c.Venta_id) AS rn
 FROM Comprar c JOIN Venta v ON v.ID=c.Venta_id
 WHERE v.Estado IN ('Entregado','Recibido') AND c.Caracteristicas_id=(c.Producto_id-1)*4+1
   AND c.Producto_id=(c.Venta_id-1)%1000+1
)
UPDATE Comprar c SET Devolucion_id=x.rn,
       EstadoDevolucion=CASE x.rn%3 WHEN 0 THEN 'Aprobada' WHEN 1 THEN 'Solicitada' ELSE 'Rechazada' END,
       FechaDevolucion=LEAST(CURRENT_DATE,x.Fecha+4),CantidadDevuelta=CASE WHEN x.rn%3=0 THEN 1 ELSE 0 END
FROM candidatos x WHERE x.rn<=1000 AND (c.Producto_id,c.Caracteristicas_id,c.Venta_id)=(x.Producto_id,x.Caracteristicas_id,x.Venta_id);

INSERT INTO Pregunta(ID,Texto,Tiempo)
SELECT i,'Consulta de demostracion '||i,LOCALTIMESTAMP-INTERVAL '5 days'+(i%24)*INTERVAL '1 hour'
FROM generate_series(1,2000) g(i);

INSERT INTO PreguntarP(Pregunta_id,Producto_id,Emprendedor_id,Cliente_id)
SELECT i,i,fn_rut_desde_numero(20000000+i),fn_rut_desde_numero(CASE WHEN i<=100 THEN 20000000+i ELSE 10000000+i END) FROM generate_series(1,1000) g(i);

INSERT INTO PreguntarS(Pregunta_id,Servicio_id,Emprendedor_id,Cliente_id)
SELECT 1000+i,i,fn_rut_desde_numero(20000000+i),fn_rut_desde_numero(CASE WHEN i<=100 THEN 20000000+i ELSE 10000000+i END) FROM generate_series(1,1000) g(i);

INSERT INTO Mensajeria(ID,Texto,Tiempo,Emisor,RespuestaA)
SELECT p.ID,'Respuesta publica '||p.ID,p.Tiempo+INTERVAL '2 hours','Emprendedor',NULL::INT FROM Pregunta p WHERE p.ID%3<>0
UNION ALL SELECT 2000+i,'Mensaje interno P '||i,LOCALTIMESTAMP-INTERVAL '72 hours','Cliente',NULL FROM generate_series(1,1000) g(i)
UNION ALL SELECT 4000+i,'Replica interna P '||i,LOCALTIMESTAMP-INTERVAL '70 hours','Emprendedor',2000+i FROM generate_series(1,1000) g(i) WHERE i%2=0
UNION ALL SELECT 6000+i,'Mensaje interno S '||i,LOCALTIMESTAMP-INTERVAL '72 hours','Cliente',NULL FROM generate_series(1,1000) g(i)
UNION ALL SELECT 8000+i,'Replica interna S '||i,LOCALTIMESTAMP-INTERVAL '70 hours','Emprendedor',6000+i FROM generate_series(1,1000) g(i) WHERE i%2=0;

INSERT INTO ComunicarP(Producto_id,Mensajeria_id,Cliente_id,Emprendedor_id,Pregunta_id)
SELECT * FROM (
 SELECT i,i+0,fn_rut_desde_numero(CASE WHEN i<=100 THEN 20000000+i ELSE 10000000+i END),fn_rut_desde_numero(20000000+i),i+0 FROM generate_series(1,1000) g(i) WHERE (i+0)%3<>0
 UNION ALL SELECT i,2000+i,fn_rut_desde_numero(CASE WHEN i<=100 THEN 20000000+i ELSE 10000000+i END),fn_rut_desde_numero(20000000+i),NULL::INT FROM generate_series(1,1000) g(i)
 UNION ALL SELECT i,4000+i,fn_rut_desde_numero(CASE WHEN i<=100 THEN 20000000+i ELSE 10000000+i END),fn_rut_desde_numero(20000000+i),NULL::INT FROM generate_series(1,1000) g(i) WHERE i%2=0
) datos(item,mensaje,cliente,vendedor,pregunta) ORDER BY mensaje;

INSERT INTO ComunicarS(Servicio_id,Mensajeria_id,Cliente_id,Emprendedor_id,Pregunta_id)
SELECT * FROM (
 SELECT i,i+1000,fn_rut_desde_numero(CASE WHEN i<=100 THEN 20000000+i ELSE 10000000+i END),fn_rut_desde_numero(20000000+i),i+1000 FROM generate_series(1,1000) g(i) WHERE (i+1000)%3<>0
 UNION ALL SELECT i,6000+i,fn_rut_desde_numero(CASE WHEN i<=100 THEN 20000000+i ELSE 10000000+i END),fn_rut_desde_numero(20000000+i),NULL::INT FROM generate_series(1,1000) g(i)
 UNION ALL SELECT i,8000+i,fn_rut_desde_numero(CASE WHEN i<=100 THEN 20000000+i ELSE 10000000+i END),fn_rut_desde_numero(20000000+i),NULL::INT FROM generate_series(1,1000) g(i) WHERE i%2=0
) datos(item,mensaje,cliente,vendedor,pregunta) ORDER BY mensaje;

INSERT INTO DesearP(Producto_id,Cliente_id,Lista,Fecha)
SELECT i,fn_rut_desde_numero(CASE WHEN i<=100 THEN 20000000+i ELSE 10000000+i END),'Favoritos',GREATEST(CURRENT_DATE-400,c.FechaRegistro)
FROM generate_series(1,1000) g(i) JOIN Cliente c ON c.RUN=fn_rut_desde_numero(CASE WHEN i<=100 THEN 20000000+i ELSE 10000000+i END)
UNION ALL SELECT i,fn_rut_desde_numero(CASE WHEN (i+500)<=100 THEN 20000000+(i+500) ELSE 10000000+(i+500) END),'Para despues',GREATEST(CURRENT_DATE-100,c.FechaRegistro)
FROM generate_series(1,500) g(i) JOIN Cliente c ON c.RUN=fn_rut_desde_numero(CASE WHEN (i+500)<=100 THEN 20000000+(i+500) ELSE 10000000+(i+500) END);

INSERT INTO DesearS(Servicio_id,Cliente_id,Lista,Fecha)
SELECT i,fn_rut_desde_numero(CASE WHEN i<=100 THEN 20000000+i ELSE 10000000+i END),'Favoritos',GREATEST(CURRENT_DATE-400,c.FechaRegistro)
FROM generate_series(1,1000) g(i) JOIN Cliente c ON c.RUN=fn_rut_desde_numero(CASE WHEN i<=100 THEN 20000000+i ELSE 10000000+i END)
UNION ALL SELECT i,fn_rut_desde_numero(CASE WHEN (i+500)<=100 THEN 20000000+(i+500) ELSE 10000000+(i+500) END),'Para despues',GREATEST(CURRENT_DATE-100,c.FechaRegistro)
FROM generate_series(1,500) g(i) JOIN Cliente c ON c.RUN=fn_rut_desde_numero(CASE WHEN (i+500)<=100 THEN 20000000+(i+500) ELSE 10000000+(i+500) END);

INSERT INTO Cotizacion(ID,Cliente_id,Emprendedor_id,Fecha,Detalle,Estado)
SELECT i,fn_rut_desde_numero(CASE WHEN i<=100 THEN 20000000+i ELSE 10000000+i END),fn_rut_desde_numero(20000000+i),GREATEST(CURRENT_DATE-i%45,c.FechaRegistro),
       jsonb_build_array(jsonb_build_object('producto_id',i,'caracteristicas_id',(i-1)*4+1,'cantidad',2)),
       CASE i%4 WHEN 0 THEN 'Aceptada por el cliente' WHEN 1 THEN 'Respondida' ELSE 'Solicitada' END
FROM generate_series(1,1000) g(i) JOIN Cliente c ON c.RUN=fn_rut_desde_numero(CASE WHEN i<=100 THEN 20000000+i ELSE 10000000+i END);

-- Casos de inventario critico y productos sin venta reciente.
UPDATE OfrecerP SET Stock=5 WHERE Producto_id>1000 AND (Caracteristicas_id-1)%4=0;
SELECT * FROM fn_mantenimiento();
ANALYZE;
COMMIT;
