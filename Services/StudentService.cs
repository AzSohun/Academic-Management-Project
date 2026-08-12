using AcademicManagementSystem.Data;
using AcademicManagementSystem.DTOs.AssignmentDtos;
using AcademicManagementSystem.DTOs.Class;
using AcademicManagementSystem.DTOs.Student;
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

        public async Task<StudentProfileResponseDto?> GetMyProfileAsync(Guid userId)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null || student.User == null) return null;

            return new StudentProfileResponseDto
            {
                Id = student.Id,
                FirstName = student.User.FirstName,
                LastName = student.User.LastName,
                Email = student.User.Email,
                DateOfBirth = student.DateOfBirth,
                Address = student.Address ?? string.Empty,
                ParentContact = student.ParentContact ?? string.Empty,
                RollNo = student.RollNo ?? "N/A",
                Group = student.Group.HasValue ? student.Group.ToString()! : "N/A",
                Section = student.Section ?? "N/A"
            };
        }

        public async Task<bool> UpdateMyProfileAsync(Guid userId, UpdateStudentProfileDto dto)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null || student.User == null) return false;

            student.User.FirstName = dto.FirstName;
            student.User.LastName = dto.LastName;
            student.DateOfBirth = dto.DateOfBirth;
            student.Address = dto.Address;
            student.ParentContact = dto.ParentContact;
            student.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<MyEnrolledClassDto?> GetMyClassAsync(Guid userId)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null || student.ClassDetailsId == null) return null;

            var classId = student.ClassDetailsId;
            var classDetails = await _context.ClassDetails
                .Include(c => c.Subjects)
                .FirstOrDefaultAsync(c => c.Id == classId);

            if (classDetails == null) return null;

            var classmates = await _context.Students
                .Include(s => s.User)
                .Where(s => s.ClassDetailsId == classId && s.Id != student.Id)
                .Select(s => new ClassmateDto
                {
                    Id = s.Id,
                    FullName = s.User != null ? s.User.FirstName + " " + s.User.LastName : "Unknown",
                    RollNo = s.RollNo ?? string.Empty,
                    Email = s.User != null ? s.User.Email : string.Empty,
                    Section = s.Section ?? string.Empty
                })
                .ToListAsync();

            var activeAssignmentsCount = await _context.Assignments
                .Where(a => a.ClassDetailsId == classId && !a.IsDraft && !_context.Submissions.Any(s => s.AssignmentId == a.Id && s.StudentId == student.Id))
                .GroupBy(a => a.SubjectId)
                .Select(g => new { SubjectId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(k => k.SubjectId, v => v.Count);

            var subjects = classDetails.Subjects.Select(sub => new EnrolledSubjectDto
            {
                Id = sub.Id,
                SubjectName = sub.SubjectName,
                SubjectCode = sub.SubjectCode,
                ActiveAssignments = activeAssignmentsCount.ContainsKey(sub.Id) ? activeAssignmentsCount[sub.Id] : 0
            }).ToList();

            return new MyEnrolledClassDto
            {
                Id = classDetails.Id,
                ClassName = classDetails.ClassName,
                RoomNumber = classDetails.RoomNumber ?? string.Empty,
                Classmates = classmates,
                Subjects = subjects
            };
        }

        public async Task<IEnumerable<AssignmentResponseDto>> GetMyClassAssignmentsAsync(Guid studentId)
        {
            var student = await GetStudentByUserIdAsync(studentId);
            if (student == null || student.ClassDetails == null) return Enumerable.Empty<AssignmentResponseDto>();

            return await _context.Assignments
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
                    ClassName = a.ClassDetails != null ? a.ClassDetails.ClassName : string.Empty,
                    SubjectName = a.Subject != null ? a.Subject.SubjectName : string.Empty,
                    TeacherName = a.Teacher != null && a.Teacher.User != null ? $"{a.Teacher.User.FirstName} {a.Teacher.User.LastName}" : string.Empty
                }).ToListAsync();
        }

        public async Task<AssignmentResponseDto?> GetAssignmentDetailsAsync(Guid assignmentId)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Subject)
                .Include(a => a.ClassDetails)
                .Include(a => a.Teacher).ThenInclude(t => t!.User)
                .FirstOrDefaultAsync(a => a.Id == assignmentId && !a.IsDraft);

            if (assignment == null) return null;

            return new AssignmentResponseDto
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
        }

        public async Task<SubmissionResponseDto?> SubmitAssignmentAsync(Guid studentId, CreateSubmissionDto dto)
        {
            var student = await GetStudentByUserIdAsync(studentId);
            if (student == null) throw new Exception("Student Not Found");

            var assignment = await _context.Assignments.FindAsync(dto.AssignmentId);
            if (assignment == null) throw new Exception("Assignment Not Found");

            if (DateOnly.FromDateTime(DateTime.UtcNow) > assignment.DueDate)
            {
                throw new Exception("The deadline for this assignment has passed. Submissions are no longer accepted.");
            }

            var submission = new Submission
            {
                AssignmentId = dto.AssignmentId,
                FilePath = dto.FilePath ?? string.Empty,
                StudentId = student.Id,
                SubmissionDate = DateTime.UtcNow,
                Status = SubmissionStatus.Pending,
            };

            await _context.Submissions.AddAsync(submission);
            await _context.SaveChangesAsync();

            return new SubmissionResponseDto
            {
                Id = submission.Id,
                AssignmentTitle = assignment.Title,
                FilePath = dto.FilePath ?? string.Empty,
                SubmissionDate = submission.SubmissionDate,
                Status = submission.Status.ToString()
            };
        }

        public async Task<bool> UpdateSubmissionAsync(Guid studentId, Guid submissionId, string newFilePath)
        {
            var student = await GetStudentByUserIdAsync(studentId);
            if (student == null) throw new Exception("Student Not Found");

            var submission = await _context.Submissions
                .Include(s => s.Assignment)
                .FirstOrDefaultAsync(s => s.Id == submissionId && s.StudentId == student.Id);

            if (submission == null) throw new Exception("Submission Not Found");

            if (submission.Assignment != null && DateOnly.FromDateTime(DateTime.UtcNow) > submission.Assignment.DueDate)
            {
                throw new Exception("The deadline has passed. You cannot update your submission anymore.");
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
            if (student == null) return Enumerable.Empty<SubmissionResponseDto>();

            var submission = await _context.Submissions
                .Where(s => s.StudentId == student.Id)
                .Include(s => s.Assignment)
                    .ThenInclude(a => a!.Subject)
                .Select(s => new SubmissionResponseDto
                {
                    Id = s.Id,
                    FilePath = s.FilePath,
                    SubmissionDate = s.SubmissionDate,
                    MarkAssigned = s.MarkAssigned,
                    TeacherFeedback = s.TeacherFeedback,
                    Status = s.Status.ToString(),
                    AssignmentTitle = s.Assignment != null ? s.Assignment.Title : string.Empty,
                    SubjectName = s.Assignment != null && s.Assignment.Subject != null ? s.Assignment.Subject.SubjectName : string.Empty
                }).ToListAsync();

            return submission;
        }
    }
}