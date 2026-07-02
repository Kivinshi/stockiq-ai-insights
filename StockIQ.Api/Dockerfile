FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy csproj first
COPY StockIQ.Api/StockIQ.Api.csproj StockIQ.Api/
RUN dotnet restore StockIQ.Api/StockIQ.Api.csproj

# copy rest
COPY StockIQ.Api/. StockIQ.Api/
WORKDIR /src/StockIQ.Api
RUN dotnet publish -c Release -o /app/out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 10000
ENTRYPOINT ["dotnet", "StockIQ.Api.dll"]