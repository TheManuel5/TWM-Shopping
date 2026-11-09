using System.ComponentModel.DataAnnotations;
using System.Text.Json.Nodes;
namespace TWM.API.Models;
public sealed record StateRequest(long Revision,[Required] Dictionary<string,JsonNode?> Changes,bool Delta=false,Dictionary<string,string[]>? Deleted=null);
public sealed record CheckoutRequest([Required] JsonArray Items,[Required] string Vendor,JsonObject? Address,string Payment,string CardLast4,string TransferCode,string DeliveryMode,[Required] string RequestId);
