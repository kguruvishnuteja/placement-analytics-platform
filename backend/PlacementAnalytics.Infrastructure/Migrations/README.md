# EF Core Migrations

## How to generate the Initial Migration

Run these commands from the `backend/` directory after installing .NET 8 SDK:

```bash
# Install EF Core tools (once per machine)
dotnet tool install --global dotnet-ef

# Add the initial migration
dotnet ef migrations add InitialCreate \
  --project PlacementAnalytics.Infrastructure \
  --startup-project PlacementAnalytics.API

# Apply to database (also runs seeder automatically)
dotnet ef database update \
  --project PlacementAnalytics.Infrastructure \
  --startup-project PlacementAnalytics.API
```

## Alternative: Use the raw SQL scripts

If you prefer raw SQL (no EF CLI needed), run these scripts in order:

1. `database/01_create_tables.sql`  — Creates all tables, indexes, foreign keys
2. `database/02_seed_data.sql`      — Seeds skills, companies, and demo accounts

## Notes

- The `AppDbContext` uses `MigrationsAssembly("PlacementAnalytics.Infrastructure")`
- Soft-delete global filters are applied for Users, Students, Companies, and Skills
- Database is also auto-seeded on first run via `DbSeeder.SeedAsync()` in `Program.cs`
