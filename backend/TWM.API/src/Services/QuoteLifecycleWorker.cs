namespace TWM.API.Services;
public sealed class QuoteLifecycleWorker(IServiceScopeFactory scopes,ILogger<QuoteLifecycleWorker> logger):BackgroundService {
 protected override async Task ExecuteAsync(CancellationToken ct) {
  using var timer=new PeriodicTimer(TimeSpan.FromMinutes(1));
  while(await timer.WaitForNextTickAsync(ct))try{using var scope=scopes.CreateScope();await scope.ServiceProvider.GetRequiredService<StateService>().Maintain(new System.Security.Claims.ClaimsPrincipal(),ct);}catch(OperationCanceledException)when(ct.IsCancellationRequested){return;}catch(Exception error){logger.LogWarning("Quote lifecycle failed: {Type}",error.GetType().Name);}
 }
}
