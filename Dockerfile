FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project file - build context is AMS-Project root
COPY ["Backend/AcademicManagementSystem/AcademicManagementSystem.csproj", "Backend/AcademicManagementSystem/"]
RUN dotnet restore "Backend/AcademicManagementSystem/AcademicManagementSystem.csproj"

# Copy source code
COPY . .

# Publish
RUN dotnet publish "Backend/AcademicManagementSystem/AcademicManagementSystem.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Render uses PORT environment variable
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "AcademicManagementSystem.dll"]
