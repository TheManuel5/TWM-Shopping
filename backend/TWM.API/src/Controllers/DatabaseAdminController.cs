using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using TWM.API.Dtos;
using TWM.API.Models;
using TWM.API.Services;

namespace TWM.API.Controllers;

/// <summary>Administración de tablas y consultas analíticas de PostgreSQL. Solo administrador general.</summary>
[
    ApiController,
    Authorize(Roles = Roles.Admin),
    Route("api/admin/database"),
    Produces("application/json")
]
public sealed class DatabaseAdminController(
    DatabaseService database,
    StateService state,
    AccountService accounts
) : ControllerBase
{
    static readonly JsonSerializerOptions Web = new(JsonSerializerDefaults.Web);

    [HttpPut("accounts/{rut}/password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Password(
        string rut,
        AdminPasswordRequest request,
        CancellationToken ct
    )
    {
        await accounts.ResetPassword(rut, request.Next, ct);
        return NoContent();
    }

    [HttpGet("tables")]
    [ProducesResponseType<IReadOnlyList<TableInfoResponse>>(StatusCodes.Status200OK)]
    public async Task<IReadOnlyList<TableInfoResponse>> Tables(CancellationToken ct)
    {
        await using var c = await database.Open(ct);
        var rows = await RelationalStore.Query(
            c,
            null,
            "SELECT jsonb_build_object('name',table_name)::text FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name",
            ct
        );
        return rows.Select(row => new TableInfoResponse(StateService.Text(row, "name"))).ToList();
    }

    /// <summary>Lee hasta 500 filas. Las columnas dependen de la tabla, por eso las filas viajan como JSON; nunca incluye passwd.</summary>
    [HttpGet("tables/{table}")]
    [ProducesResponseType<JsonArray>(StatusCodes.Status200OK)]
    public async Task<JsonArray> Read(string table, int limit = 100, CancellationToken ct = default)
    {
        await using var c = await database.Open(ct);
        var rows = await RelationalStore.Query(
            c,
            null,
            "SELECT (value-'passwd')::text FROM public.fn_crud_select(@table,'{}'::jsonb,@limit) AS t(value)",
            ct,
            ("table", table),
            ("limit", Math.Clamp(limit, 1, 500))
        );
        return rows;
    }

    [HttpPost("tables/{table}")]
    [ProducesResponseType<StatusResponse>(StatusCodes.Status200OK)]
    public Task<StatusResponse> Create(
        string table,
        TableMutationRequest request,
        CancellationToken ct
    ) => Mutate(table, "insert", request, ct);

    [HttpPut("tables/{table}")]
    [ProducesResponseType<StatusResponse>(StatusCodes.Status200OK)]
    public Task<StatusResponse> Update(
        string table,
        TableMutationRequest request,
        CancellationToken ct
    ) => Mutate(table, "update", request, ct);

    [HttpDelete("tables/{table}")]
    [ProducesResponseType<StatusResponse>(StatusCodes.Status200OK)]
    public Task<StatusResponse> Delete(
        string table,
        [FromBody] TableMutationRequest request,
        CancellationToken ct
    ) => Mutate(table, "delete", request, ct);

    async Task<StatusResponse> Mutate(
        string table,
        string action,
        TableMutationRequest request,
        CancellationToken ct
    )
    {
        if (request.Fields["passwd"] is JsonNode password)
        {
            var raw = password.ToString();
            if (System.Text.Encoding.UTF8.GetByteCount(raw) is < 8 or > 72)
                throw new ArgumentException("La contraseña debe tener entre 8 y 72 bytes.");
            request.Fields["passwd"] = BCrypt.Net.BCrypt.HashPassword(raw, 12);
        }
        await using var c = await database.Open(ct);
        await using var tx = await c.BeginTransactionAsync(ct);
        await state.Lock(c, tx, ct);
        var sql =
            action == "insert" ? "SELECT public.fn_crud_insert(@table,@fields::jsonb)::text"
            : action == "update"
                ? "SELECT public.fn_crud_update(@table,@key::jsonb,@fields::jsonb)::text"
            : "SELECT public.fn_crud_delete(@table,@key::jsonb)::text";
        await RelationalStore.Exec(
            c,
            tx,
            sql,
            ct,
            ("table", table),
            ("key", request.Key?.ToJsonString() ?? "{}"),
            ("fields", request.Fields.ToJsonString())
        );
        await state.Bump(c, tx, ct);
        await tx.CommitAsync(ct);
        return new StatusResponse("ok");
    }

    [HttpGet("queries")]
    [ProducesResponseType<IReadOnlyList<QueryInfoResponse>>(StatusCodes.Status200OK)]
    public async Task<IReadOnlyList<QueryInfoResponse>> Queries(CancellationToken ct)
    {
        await using var c = await database.Open(ct);
        var rows = await RelationalStore.Query(
            c,
            null,
            "SELECT jsonb_build_object('id',p.oid::text,'name',p.proname,'arguments',pg_get_function_arguments(p.oid),'returns',pg_get_function_result(p.oid),'parameters',(SELECT coalesce(jsonb_agg(jsonb_build_object('name',coalesce(p.proargnames[a.n], 'parametro_'||a.n),'type',format_type(a.t,NULL),'optional',a.n>p.pronargs-p.pronargdefaults)),'[]'::jsonb) FROM unnest(p.proargtypes::oid[]) WITH ORDINALITY a(t,n)))::text FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname LIKE 'fn_%' AND p.provolatile='s' AND p.proname NOT LIKE 'fn_crud_%' ORDER BY p.proname",
            ct
        );
        return rows.Deserialize<List<QueryInfoResponse>>(Web) ?? [];
    }

    /// <summary>Ejecuta una función analítica. Recibe los parámetros en orden; las columnas del resultado dependen de la función.</summary>
    [HttpPost("queries/{id}")]
    [ProducesResponseType<JsonArray>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    public async Task<JsonArray> Query(
        string id,
        [FromBody] JsonArray arguments,
        CancellationToken ct
    )
    {
        if (!uint.TryParse(id, out var oid))
            throw new ArgumentException("Consulta desconocida.");
        await using var c = await database.Open(ct);
        var functions = await RelationalStore.Query(
            c,
            null,
            "SELECT jsonb_build_object('name',p.proname,'types',oidvectortypes(p.proargtypes),'count',p.pronargs,'defaults',p.pronargdefaults,'names',to_jsonb(p.proargnames))::text FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.oid=@oid::oid AND p.provolatile='s' AND p.proname NOT LIKE 'fn_crud_%'",
            ct,
            ("oid", (long)oid)
        );
        var f = functions.FirstOrDefault() ?? throw new ArgumentException("Consulta no permitida.");
        var count = (int)StateService.Number(f, "count");
        var required = count - (int)StateService.Number(f, "defaults");
        if (arguments.Count < required || arguments.Count > count)
            throw new ArgumentException("Completa los parámetros requeridos.");
        var types = StateService
            .Text(f, "types")
            .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
        var allowed = new HashSet<string>
        {
            "integer",
            "text",
            "character varying",
            "date",
            "numeric",
            "bigint",
            "boolean",
            "jsonb",
            "text[]",
            "integer[]",
            "character varying[]",
        };
        if (types.Any(t => !allowed.Contains(t)))
            throw new ArgumentException("Firma no soportada por este formulario.");
        var calls = new List<string>();
        var values = new List<(string, object)>();
        for (var i = 0; i < arguments.Count; i++)
        {
            var arg = arguments[i];
            if (arg == null || arg is JsonValue && arg.ToString() == "")
            {
                if (i < required)
                    throw new ArgumentException(
                        "Completa el parámetro requerido: " + StateService.Rows(f["names"])[i]
                    );
                continue;
            }
            var name = StateService.Rows(f["names"])[i]!.ToString().Replace("\"", "\"\"");
            var type = types[i];
            string expression;
            if (type.EndsWith("[]"))
            {
                if (arg is not JsonArray)
                    throw new ArgumentException("Los parámetros de lista deben ser arreglos JSON.");
                expression =
                    $"ARRAY(SELECT jsonb_array_elements_text(CAST(@a{i} AS jsonb)))::{type}";
            }
            else
                expression = $"CAST(@a{i} AS {type})";
            calls.Add($"\"{name}\" => {expression}");
            values.Add(
                ("a" + i, arg is JsonObject or JsonArray ? arg.ToJsonString() : arg.ToString())
            );
        }
        var function = StateService.Text(f, "name").Replace("\"", "\"\"");
        var sql =
            $"SELECT (CASE WHEN jsonb_typeof(to_jsonb(result))='object' THEN to_jsonb(result)-'passwd' ELSE jsonb_build_object('resultado',to_jsonb(result)) END)::text FROM public.\"{function}\"({string.Join(',', calls)}) AS result";
        return await RelationalStore.Query(c, null, sql, ct, values.ToArray());
    }
}
