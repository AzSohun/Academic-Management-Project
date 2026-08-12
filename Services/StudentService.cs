using AcademicManagementSystem.Data;
using AcademicManagementSystem.DTOs.AssignmentDtos;
using AcademicManagementSystem.DTOs.SubmissionDtos;
using AcademicManagementSystem.Interfaces;
using AcademicManagementSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace AcademicManagementSystem.Services
{
    public class StudentService : IStudentService
    {
        private readonly AppDbContext _context;

        public StudentService(AppDbContext context)
        {
            _context = context;
        }

        private async Task<Student?> GetStudentByUserIdAsync(Guid userId)
        {
            return await _context.Students
                .Include(s => s.ClassDetails)
                .FirstOrDefaultAsync(s => s.UserId == userId);
        }

        public async Task<object?> GetMyClassAsync(Guid userId)
        {
            var student = await _context.Students
                .Include(s => s.ClassDetails)
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null || student.ClassDetails == null)
            {
                return null;
            }

            return new
            {
                id = student.ClassDetails.Id,
                className = student.ClassDetails.ClassName,
                roomNumber = student.ClassDetails.RoomNumber
            };
        }

        public async Task<IEnumerable<AssignmentResponseDto>> GetMyClassAssignmentsAsync(Guid studentId)
        {
            var student = await GetStudentByUserIdAsync(studentId);

            if (student == null || student.ClassDetails == null)
            {
                return Enumerable.Empty<AssignmentResponseDto>();
            }

            var assignments = await _context.Assignments
                .Where(a => a.ClassDetailsId == student.ClassDetailsId && !a.IsDraft)
                .Where(a => !_context.Submissions.Any(s => s.AssignmentId == a.Id && s.StudentId == student.Id))
                .Include(a => a.Subject)
                .Include(a => a.ClassDetails)
                .Include(a => a.Teacher).ThenInclude(t => t!.User)
                .Select(a => new AssignmentResponseDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Description = a.Description,
                    Marks = a.Marks,
                    DueDate = a.DueDate,
                    IsDraft = a.IsDraft,
                    ClassName = a.ClassDetails != null && a.ClassDetails.ClassName != null ? $"{a.ClassDetails.ClassName}" : string.Empty,
                    SubjectName = a.Subject != null && a.Subject.SubjectName != null ? $"{a.Subject.SubjectName}" : string.Empty,
                    TeacherName = a.Teacher != null && a.Teacher.User != null ? $"{a.Teacher.User.FirstName} {a.Teacher.User.LastName}" : string.Empty
                }).ToListAsync();

            return assignments;
        }

        public async Task<AssignmentResponseDto?> GetAssignmentDetailsAsync(Guid assignmentId)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Subject)
                .Include(a => a.ClassDetails)
                .Include(a => a.Teacher).ThenInclude(t => t!.User)
                .FirstOrDefaultAsync(a => a.Id == assignmentId && !a.IsDraft);

            if (assignment == null)
            {
                return null;
            }

            var assignmentDetails = new AssignmentResponseDto
            {
                Id = assignment.Id,
                Title = assignment.Title,
                Description = assignment.Description,
                Marks = assignment.Marks,
                DueDate = assignment.DueDate,
                SubjectName = assignment.Subject?.SubjectName ?? string.Empty,
                ClassName = assignment.ClassDetails?.ClassName ?? string.Empty,
                TeacherName = assignment.Teacher != null && assignment.Teacher.User != null ? $"{assignment.Teacher.User.FirstName} {assignment.Teacher.User.LastName}" : string.Empty
            };

            return assignmentDetails;
        }

        public async Task<SubmissionResponseDto?> SubmitAssignmentAsync(Guid studentId, CreateSubmissionDto dto)
        {
            var student = await GetStudentByUserIdAsync(studentId);
            if (student == null)
            {
                throw new Exception("Student Not Found");
            }

            var assignment = await _context.Assignments.FindAsync(dto.AssignmentId);
            if (assignment == null)
            {
                throw new Exception("Assignment Not Found");
            }

            var submission = new Submission
            {
                AssignmentId = dto.AssignmentId,
                FilePath = dto.FilePath ?? string.Empty,
                StudentId = student.Id,
                SubmissionDate = DateTime.UtcNow,
                Status = DateOnly.FromDateTime(DateTime.UtcNow) > assignment.DueDate ? SubmissionStatus.Late : SubmissionStatus.Pending,
            };

            await _context.Submissions.AddAsync(submission);
            await _context.SaveChangesAsync();

            var submissionResponse = new SubmissionResponseDto
            {
                Id = submission.Id,
                AssignmentTitle = assignment.Title,
                FilePath = dto.FilePath ?? string.Empty,
                SubmissionDate = submission.SubmissionDate,
                Status = submission.Status.ToString()
            };

            return submissionResponse;
        }

        public async Task<bool> UpdateSubmissionAsync(Guid studentId, Guid submissionId, string newFilePath)
        {
            var student = await GetStudentByUserIdAsync(studentId);
            if (student == null)
            {
                throw new Exception("Student Not Found");
            }

            var submission = await _context.Submissions
                .Include(s => s.Assignment)
                .FirstOrDefaultAsync(s => s.Id == submissionId && s.StudentId == student.Id);

            if (submission == null)
            {
                throw new Exception("Submission Not Found");
            }

            submission.FilePath = newFilePath ?? string.Empty;
            submission.SubmissionDate = DateTime.UtcNow;
            submission.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<SubmissionResponseDto?>> GetMySubmissionsAsync(Guid studentId)
        {
            var student = await GetStudentByUserIdAsync(studentId);
            if (student == null)
            {
                return Enumerable.Empty<SubmissionResponseDto>();
            }

            var submission = await _context.Submissions
                .Where(s => s.StudentId == student.Id)
                .Include(s => s.Assignment)
                .Select(s => new SubmissionResponseDto
                {
                    Id = s.Id,
                    FilePath = s.FilePath,
                    SubmissionDate = s.SubmissionDate,
                    MarkAssigned = s.MarkAssigned,
                    TeacherFeedback = s.TeacherFeedback,
                    Status = s.Status.ToString(),
                    AssignmentTitle = s.Assignment != null ? s.Assignment.Title : string.Empty
                }).ToListAsync();

            return submission;
        }
    }
}