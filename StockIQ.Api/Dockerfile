FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY StockIQ.Api/StockIQ.Api.csproj ./StockIQ.Api/
RUN dotnet restore ./StockIQ.Api/StockIQ.Api.csproj

COPY StockIQ.Api/. ./StockIQ.Api/
WORKDIR /app/StockIQ.Api
RUN dotnet publish -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /out .
EXPOSE 10000
ENTRYPOINT ["dotnet", "StockIQ.Api.dll"]