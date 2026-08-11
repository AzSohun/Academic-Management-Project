using AcademicManagementSystem.Data;
using AcademicManagementSystem.DTOs;
using AcademicManagementSystem.DTOs.AssignmentDtos;
using AcademicManagementSystem.DTOs.QueryDtos;
using AcademicManagementSystem.DTOs.SubmissionDtos;
using AcademicManagementSystem.DTOs.UserDtos;
using AcademicManagementSystem.Interfaces;
using AcademicManagementSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace AcademicManagementSystem.Services
{
    public class AdminService : IAdminService
    {
        private readonly AppDbContext _context;

        public AdminService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<QueryResultDto<UserDto>> GetAllUsersAsync(UserQueryParameterDto queryParams)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(queryParams.Search))
            {
                var searchTerm = queryParams.Search.Trim().ToLower();
                query = query.Where(u =>
                    u.FirstName.ToLower().Contains(searchTerm) ||
                    u.LastName.ToLower().Contains(searchTerm) ||
                    u.Email.ToLower().Contains(searchTerm)
                );
            }

            if (queryParams.Role.HasValue)
            {
                query = query.Where(u => (int)u.Role! == queryParams.Role.Value);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(u => u.Id)
                .Skip((queryParams.PageNumber - 1) * queryParams.PageSize)
                .Take(queryParams.PageSize)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    Role = (DTOs.UserDtos.Role?)u.Role,
                    Gender = (DTOs.UserDtos.Gender?)u.Gender,
                    IsDeleted = u.IsDeleted
                })
                .ToListAsync();

            var queryResult = new QueryResultDto<UserDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = queryParams.PageNumber,
                PageSize = queryParams.PageSize
            };

            return queryResult;
        }

        public async Task<IEnumerable<object>> GetClassesAsync()
        {
            return await _context.ClassDetails
                .Select(c => new
                {
                    c.Id,
                    c.ClassName,
                    c.RoomNumber
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<object>> GetStudentsAsync()
        {
            return await _context.Students
                .Include(s => s.User)
                .Where(s => s.ClassDetailsId == null)
                .Select(s => new
                {
                    s.Id,
                    FullName = s.User != null ? $"{s.User.FirstName} {s.User.LastName}" : "Unknown Student",
                    Email = s.User != null ? s.User.Email : string.Empty
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<object>> GetTeachersAsync()
        {
            return await _context.Teachers
                .Include(t => t.User)
                .Select(t => new
                {
                    t.Id,
                    FullName = t.User != null ? $"{t.User.FirstName} {t.User.LastName}" : "Unknown Teacher",
                    Specialization = t.Specialization ?? "Teacher"
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<object>> GetSubjectsAsync()
        {
            return await _context.Subjects
                .Select(s => new
                {
                    s.Id,
                    s.SubjectName,
                    s.SubjectCode,
                    s.SubjectDescription
                })
                .ToListAsync();
        }

        public async Task<bool> UpdateUserRoleAsync(Guid id, DTOs.UserDtos.Role newRole)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            user.Role = (Models.Role)newRole;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SoftDeleteUserAsync(Guid targetUserId, Guid currentUserId)
        {
            if (targetUserId == currentUserId)
            {
                throw new Exception("You cannot delete your own account.");
            }

            var user = await _context.Users.FindAsync(targetUserId);
            if (user == null) return false;

            user.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ClassDetails> CreateClassAsync(CreateClassDto dto)
        {
            var isClassExist = await _context.ClassDetails.FirstOrDefaultAsync(c =>
                c.ClassName == dto.ClassName && c.RoomNumber == dto.RoomNumber);

            if (isClassExist != null)
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

        public async Task<ClassDetails?> UpdateClassAsync(Guid id, CreateClassDto dto)
        {
            var existingClass = await _context.ClassDetails.FindAsync(id);
            if (existingClass == null) return null;

            existingClass.ClassName = dto.ClassName;
            existingClass.RoomNumber = dto.RoomNumber;

            await _context.SaveChangesAsync();
            return existingClass;
        }

        public async Task<bool> DeleteClassAsync(Guid id)
        {
            var existingClass = await _context.ClassDetails.FindAsync(id);
            if (existingClass == null) return false;

            _context.ClassDetails.Remove(existingClass);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Subject> CreateSubjectAsync(CreateSubjectDto dto)
        {
            var isSubjectExist = await _context.Subjects.FirstOrDefaultAsync(s =>
                s.SubjectName == dto.SubjectName && s.SubjectCode == dto.SubjectCode);

            if (isSubjectExist != null)
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

        public async Task<Subject?> UpdateSubjectAsync(Guid id, CreateSubjectDto dto)
        {
            var subject = await _context.Subjects.FindAsync(id);
            if (subject == null) return null;

            subject.SubjectName = dto.SubjectName;
            subject.SubjectCode = dto.SubjectCode;
            subject.SubjectDescription = dto.SubjectDescription;

            await _context.SaveChangesAsync();
            return subject;
        }

        public async Task<bool> DeleteSubjectAsync(Guid id)
        {
            var subject = await _context.Subjects.FindAsync(id);
            if (subject == null) return false;

            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AssignStudentToClassAsync(Guid studentId, Guid classId)
        {
            var student = await _context.Students.FindAsync(studentId);

            if (student == null)
            {
                return false;
            }

            var classDetails = await _context.ClassDetails.FindAsync(classId);
            if (classDetails == null) return false;

            student.ClassDetailsId = classId;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> AssignTeacherToClassAsync(Guid teacherId, List<Guid> classDetailsIds)
        {
            var teacher = await _context.Teachers
                .Include(t => t.Classes)
                .FirstOrDefaultAsync(t => t.Id == teacherId);

            if (teacher == null) return false;

            var classes = await _context.ClassDetails
                .Where(c => classDetailsIds.Contains(c.Id))
                .ToListAsync();

            if (!classes.Any()) return false;

            foreach (var cls in classes)
            {
                if (!teacher.Classes.Any(c => c.Id == cls.Id))
                {
                    teacher.Classes.Add(cls);
                }
            }

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