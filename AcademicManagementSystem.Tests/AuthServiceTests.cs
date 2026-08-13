using AcademicManagementSystem.Data;
using AcademicManagementSystem.DTOs.AuthDtos;
using AcademicManagementSystem.Models;
using AcademicManagementSystem.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace AcademicManagementSystem.Tests
{
    public class AuthServiceTests
    {
        private async Task<AppDbContext> GetDbContextAsync(string dbName)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            var context = new AppDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }

        private IConfiguration GetConfiguration()
        {
            var inMemorySettings = new Dictionary<string, string> {
                {"Jwt:SecretKey", "SuperSecretKeyThatIsAtLeast32CharactersLong!"},
                {"Jwt:Issuer", "TestIssuer"},
                {"Jwt:Audience", "TestAudience"}
            };

            return new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings!)
                .Build();
        }

        // ==========================================
        // Test 1: Successful Login (Happy Path)
        // ==========================================
        [Fact]
        public async Task LoginAsync_WithValidCredentials_ShouldReturnTokens()
        {
            // Arrange
            var dbName = Guid.NewGuid().ToString();
            var dbContext = await GetDbContextAsync(dbName);
            var configuration = GetConfiguration();

            var testUserId = Guid.NewGuid();
            var plainPassword = "Password@123";
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(plainPassword);

            dbContext.Users.Add(new User
            {
                Id = testUserId,
                FirstName = "Test",
                LastName = "User",
                Email = "test@user.com",
                Password = hashedPassword,
                Role = Models.Role.Student
            });
            await dbContext.SaveChangesAsync();
            dbContext.ChangeTracker.Clear();

            var service = new AuthService(dbContext, configuration);
            var loginDto = new LoginDto { Email = "test@user.com", Password = plainPassword };

            // Act
            var result = await service.LoginAsync(loginDto);

            // Assert
            Assert.NotNull(result);
            Assert.NotEmpty(result.AccessToken);
            Assert.NotEmpty(result.RefreshToken);

            var userInDb = await dbContext.Users.FindAsync(testUserId);
            Assert.NotNull(userInDb?.RefreshToken);
        }

        // ==========================================
        // Test 2: Invalid Password Check
        // ==========================================
        [Fact]
        public async Task LoginAsync_WithInvalidPassword_ShouldThrowException()
        {
            // Arrange
            var dbName = Guid.NewGuid().ToString();
            var dbContext = await GetDbContextAsync(dbName);
            var configuration = GetConfiguration();

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword("CorrectPassword@123");

            dbContext.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Test",
                LastName = "User",
                Email = "test@user.com",
                Password = hashedPassword
            });
            await dbContext.SaveChangesAsync();
            dbContext.ChangeTracker.Clear();

            var service = new AuthService(dbContext, configuration);
            var loginDto = new LoginDto { Email = "test@user.com", Password = "WrongPassword!999" };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => service.LoginAsync(loginDto));
            Assert.Equal("Invalid password", exception.Message);
        }

        // ==========================================
        // Test 3: User Not Found Check
        // ==========================================
        [Fact]
        public async Task LoginAsync_WithUnregisteredEmail_ShouldThrowException()
        {
            // Arrange
            var dbName = Guid.NewGuid().ToString();
            var dbContext = await GetDbContextAsync(dbName);
            var configuration = GetConfiguration();

            var service = new AuthService(dbContext, configuration);
            var loginDto = new LoginDto { Email = "notfound@user.com", Password = "AnyPassword123" };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => service.LoginAsync(loginDto));
            Assert.Equal("User not found", exception.Message);
        }
    }
}