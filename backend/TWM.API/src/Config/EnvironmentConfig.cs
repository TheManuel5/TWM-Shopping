namespace TWM.API.Config;
public static class EnvironmentConfig {
 public static void Load(string root) {
  var path = Path.Combine(root, ".env"); if (!File.Exists(path)) return;
  foreach(var line in File.ReadLines(path)) { var text=line.Trim(); if(text.Length==0 || text.StartsWith('#')) continue; var index=text.IndexOf('='); if(index<1) continue; var key=text[..index].Trim(); if(Environment.GetEnvironmentVariable(key)==null) Environment.SetEnvironmentVariable(key,text[(index+1)..].Trim().Trim('"')); }
 }
}
