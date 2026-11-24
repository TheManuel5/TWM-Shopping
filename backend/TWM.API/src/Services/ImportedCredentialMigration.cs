using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using static TWM.API.Services.StateService;

namespace TWM.API.Services;

// Convierte únicamente los hashes cuyo valor coincide con el generador de los TXT recibidos.
// No inventa cuentas ni cambia contraseñas desconocidas; conserva las claves originales de esa carga.
public sealed class ImportedCredentialMigration(DatabaseService database)
{
    public async Task Run(CancellationToken ct)
    {
        await using var c = await database.Open(ct);
        var rows = await RelationalStore.Query(
            c,
            null,
            "SELECT jsonb_build_object('table','cliente','rut',run,'hash',passwd)::text FROM public.cliente WHERE length(passwd)=64 UNION ALL SELECT jsonb_build_object('table','emprendedor','rut',run,'hash',passwd)::text FROM public.emprendedor WHERE length(passwd)=64",
            ct
        );
        var migrated = 0;
        var skipped = 0;
        await Parallel.ForEachAsync(
            rows,
            new ParallelOptions { MaxDegreeOfParallelism = 4, CancellationToken = ct },
            async (row, token) =>
            {
                var table = Text(row, "table");
                var rut = Text(row, "rut");
                if (!int.TryParse(rut.Split('-')[0], out var body))
                {
                    Interlocked.Increment(ref skipped);
                    return;
                }
                var i = body >= 20000000 ? body - 20000000 : body - 10000000;
                var password = $"hash-demo-{(table == "cliente" ? "cliente" : "emprendedor")}-{i}";
                var expected = Convert.ToHexStringLower(
                    SHA256.HashData(Encoding.UTF8.GetBytes(password))
                );
                var old = Text(row, "hash").ToLowerInvariant();
                if (
                    !CryptographicOperations.FixedTimeEquals(
                        Encoding.UTF8.GetBytes(expected),
                        Encoding.UTF8.GetBytes(old)
                    )
                )
                {
                    Interlocked.Increment(ref skipped);
                    return;
                }
                var hash = BCrypt.Net.BCrypt.HashPassword(password, 12);
                await using var connection = await database.Open(token);
                var changed = await RelationalStore.Exec(
                    connection,
                    null,
                    $"UPDATE public.{table} SET passwd=@hash WHERE run=@rut AND passwd=@old",
                    token,
                    ("hash", hash),
                    ("rut", rut),
                    ("old", old)
                );
                Interlocked.Add(ref migrated, changed);
                // El avance cada 100 cuentas se dejó de mostrar en consola.
            }
        );
        //Console.WriteLine(
        //    $"Migración terminada: {migrated} convertidas; {skipped} desconocidas conservadas; ninguna cuenta creada."
        //);
    }

    /// <summary>
    /// Pasa al formato del navegador las cuentas cuya contraseña original se puede verificar con el generador
    /// de los TXT recibidos. Las demás no se tocan: su contraseña no es conocida por el servidor y se migran
    /// al entrar con ella. Con dryRun no escribe en la base.
    /// </summary>
    public async Task<(int Upgraded, int Current, IReadOnlyList<string> Unknown)> MigrateTransport(
        bool dryRun,
        CancellationToken ct
    )
    {
        await using var c = await database.Open(ct);
        var rows = await RelationalStore.Query(
            c,
            null,
            "SELECT jsonb_build_object('table','cliente','rut',run,'hash',passwd)::text FROM public.cliente WHERE left(passwd,2)='$2' UNION ALL SELECT jsonb_build_object('table','emprendedor','rut',run,'hash',passwd)::text FROM public.emprendedor WHERE left(passwd,2)='$2'",
            ct
        );
        var upgraded = 0;
        var current = 0;
        var unknown = new ConcurrentBag<string>();
        await Parallel.ForEachAsync(
            rows,
            new ParallelOptions { MaxDegreeOfParallelism = 4, CancellationToken = ct },
            async (row, token) =>
            {
                var table = Text(row, "table");
                var rut = Text(row, "rut");
                var hash = Text(row, "hash");
                var plain = GeneratorPassword(table, rut);
                if (plain == null || !BCrypt.Net.BCrypt.Verify(plain, hash))
                {
                    if (
                        plain != null
                        && BCrypt.Net.BCrypt.Verify(PasswordTransport.Canonical(plain), hash)
                    )
                        Interlocked.Increment(ref current);
                    else
                        unknown.Add(rut);
                    return;
                }
                if (!dryRun)
                {
                    var next = BCrypt.Net.BCrypt.HashPassword(
                        PasswordTransport.Canonical(plain),
                        12
                    );
                    await using var connection = await database.Open(token);
                    await RelationalStore.Exec(
                        connection,
                        null,
                        $"UPDATE public.{table} SET passwd=@hash WHERE run=@rut AND passwd=@old",
                        token,
                        ("hash", next),
                        ("rut", rut),
                        ("old", hash)
                    );
                }
                Interlocked.Increment(ref upgraded);
            }
        );
        return (upgraded, current, unknown.OrderBy(rut => rut, StringComparer.Ordinal).ToList());
    }

    // Misma regla con la que se generó la carga: contraseña conocida solo para cuentas del generador.
    static string? GeneratorPassword(string table, string rut)
    {
        if (!int.TryParse(rut.Split('-')[0], out var body))
            return null;
        var i = body >= 20000000 ? body - 20000000 : body - 10000000;
        return $"hash-demo-{(table == "cliente" ? "cliente" : "emprendedor")}-{i}";
    }
}
