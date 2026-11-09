using System.Security.Cryptography;
using System.Text;
using static TWM.API.Services.StateService;
namespace TWM.API.Services;
// Convierte únicamente los hashes cuyo valor coincide con el generador de los TXT recibidos.
// No inventa cuentas ni cambia contraseñas desconocidas; conserva las claves originales de esa carga.
public sealed class ImportedCredentialMigration(DatabaseService database){
 public async Task Run(CancellationToken ct){await using var c=await database.Open(ct);var rows=await RelationalStore.Query(c,null,"SELECT jsonb_build_object('table','cliente','rut',run,'hash',passwd)::text FROM public.cliente WHERE length(passwd)=64 UNION ALL SELECT jsonb_build_object('table','emprendedor','rut',run,'hash',passwd)::text FROM public.emprendedor WHERE length(passwd)=64",ct);var migrated=0;var skipped=0;
  await Parallel.ForEachAsync(rows,new ParallelOptions{MaxDegreeOfParallelism=4,CancellationToken=ct},async(row,token)=>{
   var table=Text(row,"table");var rut=Text(row,"rut");if(!int.TryParse(rut.Split('-')[0],out var body)){Interlocked.Increment(ref skipped);return;}var i=body>=20000000?body-20000000:body-10000000;var password=$"hash-demo-{(table=="cliente"?"cliente":"emprendedor")}-{i}";var expected=Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(password)));var old=Text(row,"hash").ToLowerInvariant();if(!CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(expected),Encoding.UTF8.GetBytes(old))){Interlocked.Increment(ref skipped);return;}
   var hash=BCrypt.Net.BCrypt.HashPassword(password,12);await using var connection=await database.Open(token);var changed=await RelationalStore.Exec(connection,null,$"UPDATE public.{table} SET passwd=@hash WHERE run=@rut AND passwd=@old",token,("hash",hash),("rut",rut),("old",old));var done=Interlocked.Add(ref migrated,changed);if(done%100==0)Console.WriteLine($"Contraseñas migradas a bcrypt: {done}");
  });Console.WriteLine($"Migración terminada: {migrated} convertidas; {skipped} desconocidas conservadas; ninguna cuenta creada.");
 }
}
