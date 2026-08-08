using AcademicManagementSystem.Data;
using AcademicManagementSystem.DTOs;
using AcademicManagementSystem.DTOs.AssignmentDtos;
using AcademicManagementSystem.DTOs.SubmissionDtos;
using AcademicManagementSystem.Interfaces;
using AcademicManagementSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace AcademicManagementSystem.Services
{
    public class AdminService: IAdminService
    {
        private readonly AppDbContext _context;

        public AdminService(AppDbContext context)
        {
            _context = context;
        }


        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<ClassDetails> CreateClassAsync(CreateClassDto dto)
        {

            var isClassExist = await _context.ClassDetails.FirstOrDefaultAsync(c => 
            c.ClassName == dto.ClassName || c.RoomNumber == dto.RoomNumber);

            if (isClassExist == null) 
            {
                throw new Exception("Class with the same name or room number already exists.");
            }

            var newClass = new ClassDetails
            {
                ClassName = dto.ClassName,
                RoomNumber = dto.RoomNumber,
            };

            await _context.ClassDetails.AddAsync(newClass);
            await _context.SaveChangesAsync();

            return newClass;

        }

        public async Task<Subject> CreateSubjectAsync(CreateSubjectDto dto)
        {

            var isSubjectExist = await _context.Subjects.FirstOrDefaultAsync(s =>
            s.SubjectName == dto.SubjectName || s.SubjectCode == dto.SubjectCode);

            if (isSubjectExist == null)
            {
                throw new Exception("Subject with the same name or code already exists.");
            }

            var newSubject = new Subject
            {
                SubjectName = dto.SubjectName,
                SubjectDescription = dto.SubjectDescription,
                SubjectCode = dto.SubjectCode,
            };

            await _context.Subjects.AddAsync(newSubject);
            await _context.SaveChangesAsync();

            return newSubject;

        }


        public async Task<bool> AssignStudentToClassAsync(Guid studentId, Guid classId)
        {

            var student = await _context.Students.FindAsync(studentId);

            if (student == null)
            {
                return false;
            }

            student.ClassDetailsId = classId;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<AssignmentResponseDto>> GetAllAssignmentsAsync()
        {
            var assignmentResponses = await _context.Assignments
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
                    SubjectName = a.Subject != null ? a.Subject.SubjectName : string.Empty,
                    ClassName = a.ClassDetails != null ? a.ClassDetails.ClassName : string.Empty,
                    TeacherName = a.Teacher != null && a.Teacher.User != null ? $"{a.Teacher.User.FirstName} {a.Teacher.User.LastName}" : string.Empty,
                }).ToListAsync();

            return assignmentResponses;
        }


        public async Task<IEnumerable<SubmissionResponseDto>> GetAllSubmissionsAsync()
        {

            var submissionResponses = await _context.Submissions
                .Include(s => s.Student).ThenInclude(st => st!.User)
                .Include(s => s.Assignment)
                .Select(s => new SubmissionResponseDto
                {
                    Id = s.Id,
                    FilePath = s.FilePath,
                    SubmissionDate = s.SubmissionDate,
                    MarkAssigned = s.MarkAssigned,
                    TeacherFeedback = s.TeacherFeedback,
                    Status = s.Status.ToString(),
                    StudentName = s.Student != null && s.Student.User != null ? $"{s.Student.User.FirstName} {s.Student.User.LastName}" : string.Empty,
                    AssignmentTitle = s.Assignment != null ? s.Assignment.Title : string.Empty,
                }).ToListAsync();

            return submissionResponses;
        }

    }
}
