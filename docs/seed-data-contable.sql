-- =============================================================================
-- SEED: Datos contables de prueba para Software Contabilidad
-- Ejecutar en PostgreSQL (SoftwareContableDB)
-- CUIDADO: Elimina datos existentes de CuentasContables, AsientosContables y MovimientosContables
-- =============================================================================

-- 1. Limpiar tablas (orden por FKs)
DELETE FROM "MovimientosContables";
DELETE FROM "AsientosContables";
DELETE FROM "CuentasContables";

-- Resetear secuencias
ALTER SEQUENCE "CuentasContables_Id_seq" RESTART WITH 1;
ALTER SEQUENCE "AsientosContables_Id_seq" RESTART WITH 1;
ALTER SEQUENCE "MovimientosContables_Id_seq" RESTART WITH 1;

-- =============================================================================
-- 2. PLAN DE CUENTAS
-- Tipo: 1=Activo, 2=Pasivo, 3=Patrimonio, 4=Ingreso, 5=Gasto
-- =============================================================================
INSERT INTO "CuentasContables" ("Id", "Codigo", "Nombre", "Tipo", "Descripcion", "Activa") VALUES
-- ACTIVO
(1, '1101', 'Caja General', 1, 'Efectivo en caja', true),
(2, '1102', 'Bancos', 1, 'Cuentas bancarias', true),
(3, '1105', 'Clientes', 1, 'Cuentas por cobrar a clientes', true),
(4, '1106', 'Deudores diversos', 1, 'Otras cuentas por cobrar', true),
(5, '1201', 'Inventario de mercadería', 1, 'Mercadería en almacén', true),
(6, '1301', 'Mobiliario y equipo', 1, 'Muebles y equipo de oficina', true),
(7, '1302', 'Equipo de transporte', 1, 'Vehículos', true),
-- PASIVO
(8, '2101', 'Proveedores', 2, 'Cuentas por pagar a proveedores', true),
(9, '2102', 'Acreedores diversos', 2, 'Otras cuentas por pagar', true),
(10, '2105', 'Impuestos por pagar', 2, 'IVA y otros impuestos por pagar', true),
-- PATRIMONIO
(11, '3101', 'Capital social', 3, 'Aportes de los socios', true),
(12, '3201', 'Utilidades acumuladas', 3, 'Ganancias retenidas', true),
-- INGRESO
(13, '4101', 'Ventas', 4, 'Ingresos por ventas', true),
(14, '4201', 'Ingresos diversos', 4, 'Otros ingresos', true),
-- GASTO
(15, '5101', 'Costo de ventas', 5, 'Costo de la mercadería vendida', true),
(16, '5102', 'Gastos de operación', 5, 'Sueldos, alquiler, servicios', true),
(17, '5103', 'Gastos financieros', 5, 'Intereses y comisiones', true);

SELECT setval('"CuentasContables_Id_seq"', 17);

-- =============================================================================
-- 3. ASIENTOS CONTABLES (Libro Diario)
-- Fecha en UTC: usar formato timestamp with time zone
-- =============================================================================
INSERT INTO "AsientosContables" ("Id", "Fecha", "Descripcion") VALUES
(1, '2025-01-02 00:00:00+00', 'Constitución de la empresa. Aporte de capital depositado en banco.'),
(2, '2025-01-05 00:00:00+00', 'Compra de mercadería a proveedor. Factura 001.'),
(3, '2025-01-08 00:00:00+00', 'Compra de mobiliario de oficina a crédito.'),
(4, '2025-01-12 00:00:00+00', 'Venta de mercadería a cliente. Factura 101.'),
(5, '2025-01-15 00:00:00+00', 'Cobro parcial de factura 101 en efectivo.'),
(6, '2025-01-18 00:00:00+00', 'Pago parcial a proveedor.'),
(7, '2025-01-20 00:00:00+00', 'Pago de gastos de oficina (servicios, papelería).'),
(8, '2025-01-25 00:00:00+00', 'Venta de mercadería a cliente. Factura 102.'),
(9, '2025-01-28 00:00:00+00', 'Cobro de factura 102 depositado en banco.'),
(10, '2025-01-31 00:00:00+00', 'Cierre del mes. Reconocimiento de utilidad del período.');

SELECT setval('"AsientosContables_Id_seq"', 10);

-- =============================================================================
-- 4. MOVIMIENTOS (cada asiento balanceado: suma Debe = suma Haber)
-- CuentaContableId, AsientoContableId, Debe, Haber
-- =============================================================================

-- Asiento 1: Constitución - Capital 50,000 en banco
INSERT INTO "MovimientosContables" ("AsientoContableId", "CuentaContableId", "Debe", "Haber") VALUES
(1, 2, 50000.00, 0),
(1, 11, 0, 50000.00);

-- Asiento 2: Compra mercadería 15,000 - pago 10,000, saldo a crédito 5,000
INSERT INTO "MovimientosContables" ("AsientoContableId", "CuentaContableId", "Debe", "Haber") VALUES
(2, 5, 15000.00, 0),
(2, 2, 0, 10000.00),
(2, 8, 0, 5000.00);

-- Asiento 3: Compra mobiliario 5,000 a crédito
INSERT INTO "MovimientosContables" ("AsientoContableId", "CuentaContableId", "Debe", "Haber") VALUES
(3, 6, 5000.00, 0),
(3, 8, 0, 5000.00);

-- Asiento 4: Venta 8,000 + costo 4,000
INSERT INTO "MovimientosContables" ("AsientoContableId", "CuentaContableId", "Debe", "Haber") VALUES
(4, 3, 8000.00, 0),
(4, 13, 0, 8000.00),
(4, 15, 4000.00, 0),
(4, 5, 0, 4000.00);

-- Asiento 5: Cobro 3,000 de cliente
INSERT INTO "MovimientosContables" ("AsientoContableId", "CuentaContableId", "Debe", "Haber") VALUES
(5, 1, 3000.00, 0),
(5, 3, 0, 3000.00);

-- Asiento 6: Pago a proveedor 3,000
INSERT INTO "MovimientosContables" ("AsientoContableId", "CuentaContableId", "Debe", "Haber") VALUES
(6, 8, 3000.00, 0),
(6, 2, 0, 3000.00);

-- Asiento 7: Gastos de operación 500
INSERT INTO "MovimientosContables" ("AsientoContableId", "CuentaContableId", "Debe", "Haber") VALUES
(7, 16, 500.00, 0),
(7, 1, 0, 500.00);

-- Asiento 8: Venta 12,000 + costo 6,000
INSERT INTO "MovimientosContables" ("AsientoContableId", "CuentaContableId", "Debe", "Haber") VALUES
(8, 3, 12000.00, 0),
(8, 13, 0, 12000.00),
(8, 15, 6000.00, 0),
(8, 5, 0, 6000.00);

-- Asiento 9: Cobro 8,000 de cliente a banco
INSERT INTO "MovimientosContables" ("AsientoContableId", "CuentaContableId", "Debe", "Haber") VALUES
(9, 2, 8000.00, 0),
(9, 3, 0, 8000.00);

-- Asiento 10: Cierre del período - Utilidad (Ventas 20000 - Costo 10000 - Gastos 500 = 9500)
-- Cierre de cuentas nominales: Debe Ventas (cierra saldo acreedor), Haber Costo y Gastos (cierran saldo deudor)
INSERT INTO "MovimientosContables" ("AsientoContableId", "CuentaContableId", "Debe", "Haber") VALUES
(10, 13, 20000.00, 0),
(10, 15, 0, 10000.00),
(10, 16, 0, 500.00),
(10, 12, 0, 9500.00);

-- =============================================================================
-- VERIFICACIÓN: Suma Debe = Suma Haber por asiento
-- =============================================================================
-- SELECT "AsientoContableId", 
--        SUM("Debe") as total_debe, 
--        SUM("Haber") as total_haber,
--        SUM("Debe") - SUM("Haber") as diferencia
-- FROM "MovimientosContables"
-- GROUP BY "AsientoContableId";
