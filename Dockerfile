# ─── Build Stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files first (layer cache)
COPY backend/PlacementAnalytics.Domain/PlacementAnalytics.Domain.csproj             backend/PlacementAnalytics.Domain/
COPY backend/PlacementAnalytics.Application/PlacementAnalytics.Application.csproj   backend/PlacementAnalytics.Application/
COPY backend/PlacementAnalytics.Infrastructure/PlacementAnalytics.Infrastructure.csproj backend/PlacementAnalytics.Infrastructure/
COPY backend/PlacementAnalytics.API/PlacementAnalytics.API.csproj                   backend/PlacementAnalytics.API/

RUN dotnet restore backend/PlacementAnalytics.API/PlacementAnalytics.API.csproj

# Copy all backend source
COPY backend/ backend/

# Publish
RUN dotnet publish backend/PlacementAnalytics.API/PlacementAnalytics.API.csproj \
    -c Release \
    -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

# ─── Runtime Stage ────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

RUN mkdir -p uploads/resumes logs

COPY --from=build /app/publish .

# Railway sets PORT automatically
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "PlacementAnalytics.API.dll"]
