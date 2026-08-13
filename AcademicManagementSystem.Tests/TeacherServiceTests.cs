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

            // ডামি টিচার এবং অ্যাসাইনমেন্ট তৈরি
            dbContext.Users.Add(new User { Id = testUserId, FirstName = "Valid", LastName = "Teacher", Email = "teacher@test.com" });
            dbContext.Teachers.Add(new Teacher { Id = testTeacherId, UserId = testUserId });

            dbContext.Assignments.Add(new Assignment
            {
                Id = testAssignmentId,
                Title = "Final Project",
                TeacherId = testTeacherId, // এই টিচারই অ্যাসাইনমেন্টের মালিক
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

            // আসল টিচার (যিনি অ্যাসাইনমেন্ট দিয়েছেন)
            dbContext.Users.Add(new User { Id = actualTeacherUserId, FirstName = "Actual", LastName = "Teacher" });
            dbContext.Teachers.Add(new Teacher { Id = actualTeacherId, UserId = actualTeacherUserId });

            // অন্য টিচার (যিনি গ্রেড দেওয়ার চেষ্টা করবেন)
            dbContext.Users.Add(new User { Id = unauthorizedTeacherUserId, FirstName = "Hacker", LastName = "Teacher" });
            dbContext.Teachers.Add(new Teacher { Id = unauthorizedTeacherId, UserId = unauthorizedTeacherUserId });

            dbContext.Assignments.Add(new Assignment
            {
                Id = testAssignmentId,
                Title = "Math Test",
                TeacherId = actualTeacherId, // মালিক আসল টিচার
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

            // Act: অন্য টিচার (unauthorizedTeacherUserId) গ্রেড দেওয়ার চেষ্টা করছে
            var result = await service.GradeSubmissionAsync(unauthorizedTeacherUserId, testSubmissionId, gradeDto);

            // Assert: ফলস রিটার্ন করতে হবে কারণ সে এই অ্যাসাইনমেন্টের মালিক নয়
            Assert.False(result);

            var unchangedSub = await dbContext.Submissions.FindAsync(testSubmissionId);
            Assert.Null(unchangedSub!.MarkAssigned); // মার্কস আপডেট হওয়া উচিত না
        }
    }
}