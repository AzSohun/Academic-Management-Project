using AcademicManagementSystem.Data;
using AcademicManagementSystem.DTOs.SubmissionDtos;
using AcademicManagementSystem.Models;
using AcademicManagementSystem.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AcademicManagementSystem.Tests
{
    public class StudentServiceTests
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

        [Fact]
        public async Task SubmitAssignmentAsync_WhenBeforeDeadline_ShouldSucceed()
        {
            var dbName = Guid.NewGuid().ToString();
            var dbContext = await GetDbContextAsync(dbName);

            var testUserId = Guid.NewGuid();
            var testStudentId = Guid.NewGuid();
            var testAssignmentId = Guid.NewGuid();
            var testClassId = Guid.NewGuid();

            dbContext.Users.Add(new User
            {
                Id = testUserId,
                FirstName = "Test",
                LastName = "Student",
                Email = "student@test.com"
            });

            dbContext.ClassDetails.Add(new ClassDetails
            {
                Id = testClassId,
                ClassName = "Class 10"
            });

            dbContext.Students.Add(new Student
            {
                Id = testStudentId,
                UserId = testUserId,
                ClassDetailsId = testClassId
            });

            dbContext.Assignments.Add(new Assignment
            {
                Id = testAssignmentId,
                Title = "Math Homework",
                DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)), 
                ClassDetailsId = testClassId
            });

            await dbContext.SaveChangesAsync();
            dbContext.ChangeTracker.Clear();

            var service = new StudentService(dbContext);
            var dto = new CreateSubmissionDto
            {
                AssignmentId = testAssignmentId,
                FilePath = "https://github.com/my-submission"
            };

            var result = await service.SubmitAssignmentAsync(testUserId, dto);

            Assert.NotNull(result);
            Assert.Equal("Pending", result.Status.ToString());
            Assert.Equal("https://github.com/my-submission", result.FilePath);
        }

        [Fact]
        public async Task SubmitAssignmentAsync_WhenPastDeadline_ShouldThrowException()
        {
            // Arrange
            var dbName = Guid.NewGuid().ToString();
            var dbContext = await GetDbContextAsync(dbName);

            var testUserId = Guid.NewGuid();
            var testStudentId = Guid.NewGuid();
            var testAssignmentId = Guid.NewGuid();
            var testClassId = Guid.NewGuid();

            dbContext.Users.Add(new User
            {
                Id = testUserId,
                FirstName = "Test",
                LastName = "Student",
                Email = "student@test.com"
            });

            dbContext.ClassDetails.Add(new ClassDetails
            {
                Id = testClassId,
                ClassName = "Class 10"
            });

            dbContext.Students.Add(new Student
            {
                Id = testStudentId,
                UserId = testUserId,
                ClassDetailsId = testClassId
            });

            dbContext.Assignments.Add(new Assignment
            {
                Id = testAssignmentId,
                Title = "Late Homework",
                DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)),
                ClassDetailsId = testClassId
            });

            await dbContext.SaveChangesAsync();
            dbContext.ChangeTracker.Clear();

            var service = new StudentService(dbContext);
            var dto = new CreateSubmissionDto
            {
                AssignmentId = testAssignmentId,
                FilePath = "https://github.com/late-submission"
            };

            var exception = await Assert.ThrowsAsync<Exception>(() => service.SubmitAssignmentAsync(testUserId, dto));
            Assert.Contains("deadline for this assignment has passed", exception.Message);
        }
    }
}