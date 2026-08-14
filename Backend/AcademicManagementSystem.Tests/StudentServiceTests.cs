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


        // ==========================================
        // Test 1: Submit Assignment (Before Deadline)
        // ==========================================
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
                ClassDetailsId = testClassId,
                IsDraft = false // 🎯 ফিক্স: ড্রাফট ফলস করা হলো যাতে অ্যাসাইনমেন্ট পাওয়া যায়
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


        // ==========================================
        // Test 2: Submit Assignment (Past Deadline)
        // ==========================================
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
                ClassDetailsId = testClassId,
                IsDraft = false // 🎯 ফিক্স: ড্রাফট ফলস করা হলো
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


        // ==========================================
        // Test 3: Update Submission (Before Deadline)
        // ==========================================
        [Fact]
        public async Task UpdateSubmissionAsync_WhenBeforeDeadline_ShouldUpdateSuccessfully()
        {
            // Arrange
            var dbName = Guid.NewGuid().ToString();
            var dbContext = await GetDbContextAsync(dbName);

            var testUserId = Guid.NewGuid();
            var testStudentId = Guid.NewGuid();
            var testAssignmentId = Guid.NewGuid();
            var testSubmissionId = Guid.NewGuid();
            var testClassId = Guid.NewGuid();

            dbContext.Users.Add(new User { Id = testUserId, FirstName = "Test", LastName = "Student", Email = "student@test.com" });
            dbContext.ClassDetails.Add(new ClassDetails { Id = testClassId, ClassName = "Class 10" });
            dbContext.Students.Add(new Student { Id = testStudentId, UserId = testUserId, ClassDetailsId = testClassId });

            dbContext.Assignments.Add(new Assignment
            {
                Id = testAssignmentId,
                Title = "Update Test",
                DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)), // Deadline in future
                ClassDetailsId = testClassId,
                IsDraft = false // 🎯 ফিক্স: ড্রাফট ফলস করা হলো
            });

            dbContext.Submissions.Add(new Submission
            {
                Id = testSubmissionId,
                AssignmentId = testAssignmentId,
                StudentId = testStudentId,
                FilePath = "old-link.com"
            });

            await dbContext.SaveChangesAsync();
            dbContext.ChangeTracker.Clear();

            var service = new StudentService(dbContext);

            // Act
            var result = await service.UpdateSubmissionAsync(testUserId, testSubmissionId, "new-link.com");

            // Assert
            Assert.True(result);
            var updatedSub = await dbContext.Submissions.FindAsync(testSubmissionId);
            Assert.Equal("new-link.com", updatedSub!.FilePath);
        }

        // ==========================================
        // Test 4: Update Submission (Past Deadline)
        // ==========================================
        [Fact]
        public async Task UpdateSubmissionAsync_WhenPastDeadline_ShouldThrowException()
        {
            // Arrange
            var dbName = Guid.NewGuid().ToString();
            var dbContext = await GetDbContextAsync(dbName);

            var testUserId = Guid.NewGuid();
            var testStudentId = Guid.NewGuid();
            var testAssignmentId = Guid.NewGuid();
            var testSubmissionId = Guid.NewGuid();
            var testClassId = Guid.NewGuid();

            dbContext.Users.Add(new User { Id = testUserId, FirstName = "Test", LastName = "Student", Email = "student@test.com" });
            dbContext.ClassDetails.Add(new ClassDetails { Id = testClassId, ClassName = "Class 10" });
            dbContext.Students.Add(new Student { Id = testStudentId, UserId = testUserId, ClassDetailsId = testClassId });

            dbContext.Assignments.Add(new Assignment
            {
                Id = testAssignmentId,
                Title = "Late Update Test",
                DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)), // Deadline passed
                ClassDetailsId = testClassId,
                IsDraft = false // 🎯 ফিক্স: ড্রাফট ফলস করা হলো
            });

            dbContext.Submissions.Add(new Submission
            {
                Id = testSubmissionId,
                AssignmentId = testAssignmentId,
                StudentId = testStudentId,
                FilePath = "old-link.com"
            });

            await dbContext.SaveChangesAsync();
            dbContext.ChangeTracker.Clear();

            var service = new StudentService(dbContext);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => service.UpdateSubmissionAsync(testUserId, testSubmissionId, "new-link.com"));
            Assert.Contains("deadline has passed", exception.Message);
        }
    }
}