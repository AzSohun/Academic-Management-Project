using AcademicManagementSystem.Data;
using AcademicManagementSystem.DTOs.SubmissionDtos;
using AcademicManagementSystem.Models;
using AcademicManagementSystem.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AcademicManagementSystem.Tests
{
    public class TeacherServiceTests
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
        // Test 1: Successful Grading (Happy Path)
        // ==========================================
        [Fact]
        public async Task GradeSubmissionAsync_WithValidTeacher_ShouldSucceed()
        {
            // Arrange
            var dbName = Guid.NewGuid().ToString();
            var dbContext = await GetDbContextAsync(dbName);

            var testUserId = Guid.NewGuid();
            var testTeacherId = Guid.NewGuid();
            var testAssignmentId = Guid.NewGuid();
            var testSubmissionId = Guid.NewGuid();

            dbContext.Users.Add(new User { Id = testUserId, FirstName = "Valid", LastName = "Teacher", Email = "teacher@test.com" });
            dbContext.Teachers.Add(new Teacher { Id = testTeacherId, UserId = testUserId });

            dbContext.Assignments.Add(new Assignment
            {
                Id = testAssignmentId,
                Title = "Final Project",
                TeacherId = testTeacherId,
                Marks = 100
            });

            dbContext.Submissions.Add(new Submission
            {
                Id = testSubmissionId,
                AssignmentId = testAssignmentId,
                FilePath = "student-file.pdf"
            });

            await dbContext.SaveChangesAsync();
            dbContext.ChangeTracker.Clear();

            var service = new TeacherService(dbContext);
            var gradeDto = new GradeSubmissionDto
            {
                MarksAssigned = 85,
                Feedback = "Good job!",
                Status = SubmissionStatus.Graded
            };

            // Act
            var result = await service.GradeSubmissionAsync(testUserId, testSubmissionId, gradeDto);

            // Assert
            Assert.True(result);
            var updatedSub = await dbContext.Submissions.FindAsync(testSubmissionId);
            Assert.Equal(85, updatedSub!.MarkAssigned);
            Assert.Equal("Good job!", updatedSub.TeacherFeedback);
        }

        // ==========================================
        // Test 2: Authorization Check (Unauthorized Teacher)
        // ==========================================
        [Fact]
        public async Task GradeSubmissionAsync_WithUnauthorizedTeacher_ShouldReturnFalse()
        {
            // Arrange
            var dbName = Guid.NewGuid().ToString();
            var dbContext = await GetDbContextAsync(dbName);

            var actualTeacherUserId = Guid.NewGuid();
            var actualTeacherId = Guid.NewGuid();

            var unauthorizedTeacherUserId = Guid.NewGuid();
            var unauthorizedTeacherId = Guid.NewGuid();

            var testAssignmentId = Guid.NewGuid();
            var testSubmissionId = Guid.NewGuid();

            dbContext.Users.Add(new User { Id = actualTeacherUserId, FirstName = "Actual", LastName = "Teacher" });
            dbContext.Teachers.Add(new Teacher { Id = actualTeacherId, UserId = actualTeacherUserId });

            dbContext.Users.Add(new User { Id = unauthorizedTeacherUserId, FirstName = "Hacker", LastName = "Teacher" });
            dbContext.Teachers.Add(new Teacher { Id = unauthorizedTeacherId, UserId = unauthorizedTeacherUserId });

            dbContext.Assignments.Add(new Assignment
            {
                Id = testAssignmentId,
                Title = "Math Test",
                TeacherId = actualTeacherId,
                Marks = 50
            });

            dbContext.Submissions.Add(new Submission
            {
                Id = testSubmissionId,
                AssignmentId = testAssignmentId
            });

            await dbContext.SaveChangesAsync();
            dbContext.ChangeTracker.Clear();

            var service = new TeacherService(dbContext);
            var gradeDto = new GradeSubmissionDto { MarksAssigned = 40 };

            var result = await service.GradeSubmissionAsync(unauthorizedTeacherUserId, testSubmissionId, gradeDto);

            
            Assert.False(result);

            var unchangedSub = await dbContext.Submissions.FindAsync(testSubmissionId);
            Assert.Null(unchangedSub!.MarkAssigned);
        }


        // ==========================================
        // Test 3: Business Rule (Marks Exceeding Max Marks)
        // ==========================================
        [Fact]
        public async Task GradeSubmissionAsync_WhenMarksExceedMax_ShouldThrowException()
        {
            // Arrange
            var dbName = Guid.NewGuid().ToString();
            var dbContext = await GetDbContextAsync(dbName);

            var testUserId = Guid.NewGuid();
            var testTeacherId = Guid.NewGuid();
            var testAssignmentId = Guid.NewGuid();
            var testSubmissionId = Guid.NewGuid();

            dbContext.Users.Add(new User { Id = testUserId, FirstName = "Valid", LastName = "Teacher" });
            dbContext.Teachers.Add(new Teacher { Id = testTeacherId, UserId = testUserId });

            dbContext.Assignments.Add(new Assignment
            {
                Id = testAssignmentId,
                TeacherId = testTeacherId,
                Marks = 50
            });

            dbContext.Submissions.Add(new Submission
            {
                Id = testSubmissionId,
                AssignmentId = testAssignmentId
            });

            await dbContext.SaveChangesAsync();
            dbContext.ChangeTracker.Clear();

            var service = new TeacherService(dbContext);
            var gradeDto = new GradeSubmissionDto
            {
                MarksAssigned = 60,
                Feedback = "Over marked!"
            };


            var exception = await Assert.ThrowsAsync<Exception>(() => service.GradeSubmissionAsync(testUserId, testSubmissionId, gradeDto));
            Assert.Contains("cannot be greater than the maximum assignment marks", exception.Message);
        }
    }
}