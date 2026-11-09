using Npgsql;
namespace TWM.API.Services;
public sealed class DatabaseService(IConfiguration config){
 public async Task<NpgsqlConnection> Open(CancellationToken ct=default){var c=new NpgsqlConnection(config.GetConnectionString("PostgreConnection")??throw new InvalidOperationException("Configura PostgreSQL en .env."));try{await c.OpenAsync(ct);return c;}catch{await c.DisposeAsync();throw;}}
 public async Task Initialize(){await using var c=await Open();
 var ready=await RelationalStore.Query(c,null,"SELECT jsonb_build_object('ok',to_regclass('public.categoría') IS NOT NULL AND EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='servicio' AND column_name='ocultoporinactividad'))::text",CancellationToken.None);
 if(ready[0]?["ok"]?.GetValue<bool>()!=true)throw new InvalidOperationException("Importa los cuatro SQL actuales en una base vacía con UTF-8 antes de iniciar la API.");
 await RelationalStore.Exec(c,null,"""
 CREATE SCHEMA IF NOT EXISTS shopping_ui;
 CREATE TABLE IF NOT EXISTS shopping_ui.state_version(id int PRIMARY KEY,revision bigint NOT NULL);
 INSERT INTO shopping_ui.state_version VALUES(1,0) ON CONFLICT DO NOTHING;
 CREATE TABLE IF NOT EXISTS shopping_ui.documents(resource text NOT NULL,id text NOT NULL,owner text NOT NULL,payload jsonb NOT NULL,updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(resource,id));
 CREATE TABLE IF NOT EXISTS shopping_ui.principals(rut text PRIMARY KEY,admin boolean NOT NULL DEFAULT false,active boolean NOT NULL DEFAULT true,auth_version text NOT NULL DEFAULT '');
 ALTER TABLE shopping_ui.principals ADD COLUMN IF NOT EXISTS allowed_roles jsonb;
 CREATE TABLE IF NOT EXISTS shopping_ui.listing_state(id text PRIMARY KEY,active boolean NOT NULL DEFAULT true);
 CREATE TABLE IF NOT EXISTS shopping_ui.shipment_tracking(shipment_id int PRIMARY KEY REFERENCES public.envio(seguimiento),external_code text NOT NULL);
 CREATE TABLE IF NOT EXISTS shopping_ui.address_preferences(rut text PRIMARY KEY,address_id int NOT NULL REFERENCES public.direccion(id));
 CREATE TABLE IF NOT EXISTS shopping_ui.order_events(order_id int NOT NULL REFERENCES public.venta(id),changed_at timestamptz NOT NULL DEFAULT now(),status text NOT NULL);
 CREATE TABLE IF NOT EXISTS shopping_ui.return_requests(return_id int PRIMARY KEY REFERENCES public.devolucion(id),quantity int NOT NULL CHECK(quantity>0),images jsonb NOT NULL DEFAULT '[]'::jsonb);
 CREATE TABLE IF NOT EXISTS shopping_ui.used_quotes(quote_id int PRIMARY KEY REFERENCES public.cotizacion(id) ON DELETE CASCADE,order_id int NOT NULL REFERENCES public.venta(id));
 CREATE TABLE IF NOT EXISTS shopping_ui.checkout_requests(owner text NOT NULL,request_id text NOT NULL,order_id text NOT NULL,PRIMARY KEY(owner,request_id));
 """,CancellationToken.None);
 var migration=Path.Combine(AppContext.BaseDirectory,"database","web_compatibility.sql");
 await using var tx=await c.BeginTransactionAsync();
 await RelationalStore.Exec(c,tx,await File.ReadAllTextAsync(migration),CancellationToken.None);
 await tx.CommitAsync(); }
}
