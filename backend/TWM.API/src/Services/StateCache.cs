using System.Text.Json.Nodes;
using Npgsql;

namespace TWM.API.Services;

/// <summary>
/// Conserva en memoria el último estado armado desde PostgreSQL para no reconstruirlo en cada petición.
/// La copia solo se reutiliza mientras coincidan tres marcas:
///  - la revisión de shopping_ui.state_version, que aumenta con cada escritura hecha por la aplicación;
///  - la fecha del servidor de base de datos, porque ofertas y vigencias dependen del día;
///  - el contador de filas modificadas de PostgreSQL, que detecta cambios hechos fuera de la aplicación (por ejemplo con psql).
/// Además caduca a los dos minutos, de modo que cualquier diferencia no detectada se corrige sola.
/// Todo acceso al estado guardado debe hacerse con <see cref="Gate"/> tomado: los JsonNode no admiten lecturas concurrentes.
/// </summary>
public sealed class StateCache
{
    static readonly TimeSpan Lifetime = TimeSpan.FromMinutes(2);

    // Tras una escritura propia, las estadísticas de PostgreSQL tardan unos segundos en reflejarla.
    static readonly TimeSpan Settling = TimeSpan.FromSeconds(15);

    public readonly record struct Stamp(string Date, string Changes);

    public SemaphoreSlim Gate { get; } = new(1, 1);

    Dictionary<string, JsonNode?>? data;
    long revision;
    Stamp stamp;
    DateTime storedAt;
    DateTime settlingUntil;

    /// <summary>Fecha de la base y total de filas insertadas, actualizadas o eliminadas en los esquemas de la tienda.</summary>
    public static async Task<Stamp> ReadStamp(
        NpgsqlConnection connection,
        NpgsqlTransaction? transaction,
        CancellationToken ct
    )
    {
        const string sql = """
            SELECT CURRENT_DATE::text,
                   coalesce(sum(n_tup_ins + n_tup_upd + n_tup_del), 0)::text
            FROM pg_stat_user_tables
            WHERE schemaname IN ('public', 'shopping_ui')
            """;
        await using var command = new NpgsqlCommand(sql, connection, transaction);
        await using var reader = await command.ExecuteReaderAsync(ct);
        await reader.ReadAsync(ct);
        return new Stamp(reader.GetString(0), reader.GetString(1));
    }

    /// <summary>Devuelve el estado guardado si sigue vigente; en caso contrario, null.</summary>
    public Dictionary<string, JsonNode?>? Get(long currentRevision, Stamp current)
    {
        var now = DateTime.UtcNow;
        if (
            data == null
            || revision != currentRevision
            || stamp.Date != current.Date
            || now - storedAt > Lifetime
        )
            return null;
        if (stamp.Changes != current.Changes)
        {
            if (now > settlingUntil)
                return null;
            stamp = current;
        }
        return data;
    }

    /// <summary>Guarda un estado recién leído. <paramref name="afterOwnWrite"/> indica que la aplicación acaba de escribir.</summary>
    public void Store(
        long currentRevision,
        Stamp current,
        Dictionary<string, JsonNode?> fresh,
        bool afterOwnWrite
    )
    {
        data = fresh;
        revision = currentRevision;
        stamp = current;
        storedAt = DateTime.UtcNow;
        settlingUntil = afterOwnWrite ? storedAt + Settling : DateTime.MinValue;
    }

    /// <summary>Aplica un guardado rápido (carrito, favoritos…) sobre el estado guardado y avanza su revisión.</summary>
    public void Patch(
        long previousRevision,
        long newRevision,
        IEnumerable<KeyValuePair<string, JsonNode?>> entries
    )
    {
        if (data == null || revision != previousRevision)
        {
            data = null;
            return;
        }
        foreach (var (key, value) in entries)
            data[key] = value?.DeepClone();
        revision = newRevision;
        settlingUntil = DateTime.UtcNow + Settling;
    }

    public void Clear() => data = null;
}
