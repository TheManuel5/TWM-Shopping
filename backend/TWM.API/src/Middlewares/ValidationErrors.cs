using Microsoft.AspNetCore.Mvc;
using TWM.API.Dtos;

namespace TWM.API.Middlewares;

/// <summary>
/// Convierte los errores de validación de un DTO en un <see cref="ErrorResponse"/>:
/// un mensaje legible en español y el detalle por campo, sin nombres de tipos internos.
/// </summary>
public static class ValidationErrors
{
    const string BadBody = "El cuerpo de la petición falta o no es un JSON válido.";

    public static IActionResult Create(ActionContext context)
    {
        var errors = new Dictionary<string, string[]>();
        foreach (var (key, entry) in context.ModelState)
        {
            if (entry.Errors.Count == 0)
                continue;
            var messages = entry
                .Errors.Select(error => Translate(key, error.ErrorMessage, error.Exception != null))
                .Distinct()
                .ToArray();
            var field = key.TrimStart('$', '.');
            field = field is "" or "request" ? "body" : field;
            errors[field] = errors.TryGetValue(field, out var previous)
                ? previous.Concat(messages).Distinct().ToArray()
                : messages;
        }
        var message = string.Join(" ", errors.Values.SelectMany(list => list).Distinct());
        return new BadRequestObjectResult(
            new ErrorResponse(message, context.HttpContext.TraceIdentifier, errors)
        );
    }

    static string Translate(string key, string message, bool fromException)
    {
        var field = key.TrimStart('$', '.');
        // Cuerpo ausente o JSON mal formado: el texto original menciona clases internas.
        if (
            field is "" or "request"
            || message.StartsWith("The request field", StringComparison.Ordinal)
        )
            return BadBody;
        if (fromException || message.Contains("could not be converted", StringComparison.Ordinal))
            return $"El valor de «{field}» no tiene el formato esperado.";
        if (
            message.StartsWith("The ", StringComparison.Ordinal)
            && message.EndsWith(" field is required.", StringComparison.Ordinal)
        )
            return $"Falta el dato «{field}».";
        return string.IsNullOrWhiteSpace(message) ? "El valor enviado no es válido." : message;
    }
}
