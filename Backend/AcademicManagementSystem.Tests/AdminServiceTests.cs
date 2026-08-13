using AcademicManagementSystem.Data;
using AcademicManagementSystem.DTOs.Class;
using AcademicManagementSystem.Models;
using AcademicManagementSystem.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AcademicManagementSystem.Tests
{
    public class AdminServiceTests
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

        // ==========================================
        // Test 1: Soft Delete User (Cannot delete self)
        // ==========================================
        [Fact]
        public async Task SoftDeleteUserAsync_WhenTargetIsSelf_ShouldThrowException()
        {
            // Arrange
            var dbName = Guid.NewGuid().ToString();
            var dbContext = await GetDbContextAsync(dbName);

            var adminId = Guid.NewGuid();
            dbContext.Users.Add(new User { Id = adminId, FirstName = "Admin", Email = "admin@test.com" });
            await dbContext.SaveChangesAsync();

            var service = new AdminService(dbContext);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => service.SoftDeleteUserAsync(adminId, adminId));
            Assert.Equal("You cannot delete your own account.", exception.Message);
        }

        // ==========================================
        // Test 2: Create Class (Duplicate Check)
        // ==========================================
        [Fact]
        public async Task CreateClassAsync_WhenClassExists_ShouldThrowException()
        {
            // Arrange
            var dbName = Guid.NewGuid().ToString();
            var dbContext = await GetDbContextAsync(dbName);

            dbContext.ClassDetails.Add(new ClassDetails { ClassName = "Class 10", RoomNumber = "101" });
            await dbContext.SaveChangesAsync();

            var service = new AdminService(dbContext);
            var dto = new CreateClassDto { ClassName = "Class 10", RoomNumber = "101" };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => service.CreateClassAsync(dto));
            Assert.Equal("Class with the same name or room number already exists.", exception.Message);
        }

        // ==========================================
        // Test 3: Create Class (Success Path)
        // ==========================================
        [Fact]
        public async Task CreateClassAsync_WithValidData_ShouldCreateSuccessfully()
        {
            // Arrange
            var dbName = Guid.NewGuid().ToString();
            var dbContext = await GetDbContextAsync(dbName);
            var service = new AdminService(dbContext);
            var dto = new CreateClassDto { ClassName = "Class 11", RoomNumber = "202" };

            // Act
            var result = await service.CreateClassAsync(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Class 11", result.ClassName);

            var classInDb = await dbContext.ClassDetails.FirstOrDefaultAsync(c => c.ClassName == "Class 11");
            Assert.NotNull(classInDb);
        }
    }
}