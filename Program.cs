using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();
app.MapRazorPages()
   .WithStaticAssets();
app.MapPost("/upload", async ([FromForm]IFormFile file) =>
{
    var filePath = Path.GetTempPath();

    using (var stream = System.IO.File.Create(Path.Join(filePath, file.FileName)))
    {
        await file.CopyToAsync(stream);
    }

    Console.WriteLine(file.FileName);
})
.DisableAntiforgery();

app.Run();
