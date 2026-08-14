using AcademicManagementSystem.Data;
using AcademicManagementSystem.DTOs.AssignmentDtos;
using AcademicManagementSystem.DTOs.Subject;
using AcademicManagementSystem.DTOs.SubmissionDtos;
using AcademicManagementSystem.DTOs.Teacher;
using AcademicManagementSystem.Interfaces;
using AcademicManagementSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace AcademicManagementSystem.Services
{
    public class TeacherService : ITeacherService
    {
        private readonly AppDbContext _context;

        public TeacherService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Teacher?> GetTeacherByUserIdAsync(Guid userId)
        {
            return await _context.Teachers
                .Include(t => t.Classes)
                .Include(t => t.Subjects)
                .FirstOrDefaultAsync(t => t.UserId == userId);
        }



        public async Task<TeacherProfileResponseDto?> GetMyProfileAsync(Guid userId)
        {
            var teacher = await _context.Teachers
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.UserId == userId);

            if (teacher == null || teacher.User == null) return null;

            return new TeacherProfileResponseDto
            {
                Id = teacher.Id,
                FirstName = teacher.User.FirstName,
                LastName = teacher.User.LastName,
                Email = teacher.User.Email,
                PhoneNumber = teacher.PhoneNumber ?? string.Empty,
                Address = teacher.Address ?? string.Empty,
                DateOfBirth = teacher.DateOfBirth,
                Qualification = teacher.Qualification ?? string.Empty,
                Experience = teacher.Experience ?? string.Empty,
                TeacherCode = teacher.TeacherCode ?? string.Empty,
                Specialization = teacher.Specialization ?? string.Empty
            };
        }

        public async Task<bool> UpdateMyProfileAsync(Guid userId, UpdateTeacherProfileDto dto)
        {
            var teacher = await _context.Teachers
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.UserId == userId);

            if (teacher == null || teacher.User == null) return false;

            teacher.User.FirstName = dto.FirstName;
            teacher.User.LastName = dto.LastName;

            teacher.PhoneNumber = dto.PhoneNumber;
            teacher.Address = dto.Address;
            teacher.DateOfBirth = dto.DateOfBirth;
            teacher.Qualification = dto.Qualification;
            teacher.Experience = dto.Experience;
            teacher.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<IEnumerable<TeacherClassDetailsDto>> GetMyClassesAsync(Guid userId)
        {
            var teacherExists = await _context.Teachers.AnyAsync(t => t.UserId == userId);
            if (!teacherExists) return Enumerable.Empty<TeacherClassDetailsDto>();

            return await _context.Teachers
                .Where(t => t.UserId == userId)
                .SelectMany(t => t.Classes.Select(c => new TeacherClassDetailsDto
                {
                    Id = c.Id,
                    ClassName = string.IsNullOrWhiteSpace(c.Section) ? c.ClassName : $"{c.ClassName} ({c.Section})",
                    RoomNumber = c.RoomNumber,
                    StudentCount = _context.Students.Count(s => s.ClassDetailsId == c.Id),
                    Subjects = c.Subjects
                        .Where(s => t.Subjects.Contains(s))
                        .Select(s => new TeacherSubjectDto
                        {
                            Id = s.Id,
                            SubjectName = s.SubjectName,
                            SubjectCode = s.SubjectCode
                        }).ToList(),

                    Students = _context.Students
                        .Where(s => s.ClassDetailsId == c.Id)
                        .Select(s => new TeacherStudentDto
                        {
                            Id = s.Id,
                            FullName = s.User != null ? s.User.FirstName + " " + s.User.LastName : "Unknown Student",
                            RollNo = s.RollNo,
                            Email = s.User != null ? s.User.Email : string.Empty,
                            Section = s.Section
                        }).ToList()
                }))
                .ToListAsync();
        }

        public async Task<IEnumerable<SubjectResponseDto>> GetMySubjectsAsync(Guid userId)
        {
            var teacher = await GetTeacherByUserIdAsync(userId);

            if (teacher == null || teacher.Subjects == null || !teacher.Subjects.Any())
            {
                return Enumerable.Empty<SubjectResponseDto>();
            }

            return teacher.Subjects.Select(s => new SubjectResponseDto
            {
                Id = s.Id,
                SubjectName = s.SubjectName,
                SubjectCode = s.SubjectCode,
                SubjectDescription = s.SubjectDescription
            }).ToList();
        }

        public async Task<IEnumerable<AssignmentResponseDto>> GetTeacherAssignmentsAsync(Guid userId)
        {
            var teacher = await GetTeacherByUserIdAsync(userId);
            if (teacher == null) return Enumerable.Empty<AssignmentResponseDto>();

            return await _context.Assignments
                .Include(a => a.ClassDetails)
                .Include(a => a.Subject)
                .Where(a => a.TeacherId == teacher.Id)
                .Select(a => new AssignmentResponseDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Description = a.Description,
                    Marks = a.Marks,
                    DueDate = a.DueDate,
                    IsDraft = a.IsDraft,
                    ClassName = a.ClassDetails != null ? a.ClassDetails.ClassName : string.Empty,
                    SubjectName = a.Subject != null ? a.Subject.SubjectName : string.Empty
                })
                .ToListAsync();
        }

        public async Task<AssignmentResponseDto> CreateAssignmentAsync(Guid userId, CreateAssignmentDto dto)
        {
            var teacher = await GetTeacherByUserIdAsync(userId);

            if (teacher == null)
            {
                throw new Exception("Teacher record not found!");
            }

            var assignment = new Assignment
            {
                Title = dto.Title,
                Description = dto.Description,
                Marks = dto.Marks,
                DueDate = dto.DueDate,
                ClassDetailsId = dto.ClassDetailsId,
                SubjectId = dto.SubjectId,
                TeacherId = teacher.Id,
                IsDraft = dto.IsDraft,
            };

            await _context.Assignments.AddAsync(assignment);
            await _context.SaveChangesAsync();

            return new AssignmentResponseDto
            {
                Id = assignment.Id,
                Title = assignment.Title,
                Description = assignment.Description,
                Marks = assignment.Marks,
                DueDate = assignment.DueDate,
                IsDraft = assignment.IsDraft,
            };
        }

        public async Task<bool> UpdateAssignmentAsync(Guid userId, Guid assignmentId, UpdateAssignmentDto dto)
        {
            var teacher = await GetTeacherByUserIdAsync(userId);
            if (teacher == null) return false;

            var assignment = await _context.Assignments
                .FirstOrDefaultAsync(a => a.Id == assignmentId && a.TeacherId == teacher.Id);

            if (assignment == null)
            {
                return false;
            }

            assignment.Title = dto.Title;
            assignment.Description = dto.Description;
            assignment.Marks = dto.Marks;
            assignment.DueDate = dto.DueDate;
            assignment.IsDraft = dto.IsDraft;
            assignment.ClassDetailsId = dto.ClassDetailsId;
            assignment.SubjectId = dto.SubjectId;
            assignment.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAssignmentAsync(Guid userId, Guid assignmentId)
        {
            var teacher = await GetTeacherByUserIdAsync(userId);
            if (teacher == null) return false;

            var assignment = await _context.Assignments
                .FirstOrDefaultAsync(a => a.Id == assignmentId && a.TeacherId == teacher.Id);

            if (assignment == null)
            {
                return false;
            }

            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> TogglePublishStatusAsync(Guid userId, Guid assignmentId, bool isDraft)
        {
            var teacher = await GetTeacherByUserIdAsync(userId);
            if (teacher == null) return false;

            var assignment = await _context.Assignments
                .FirstOrDefaultAsync(a => a.Id == assignmentId && a.TeacherId == teacher.Id);

            if (assignment == null)
            {
                return false;
            }

            assignment.IsDraft = isDraft;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<SubmissionResponseDto>> GetAllSubmissionsForTeacherAsync(Guid userId)
        {
            var teacher = await GetTeacherByUserIdAsync(userId);
            if (teacher == null) return Enumerable.Empty<SubmissionResponseDto>();

            return await _context.Submissions
                .Include(s => s.Student).ThenInclude(st => st!.User)
                .Include(s => s.Assignment)
                .Where(s => s.Assignment != null && s.Assignment.TeacherId == teacher.Id)
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
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<SubmissionResponseDto>> GetSubmissionsForAssignmentAsync(Guid userId, Guid assignmentId)
        {
            var teacher = await GetTeacherByUserIdAsync(userId);
            if (teacher == null)
            {
                return Enumerable.Empty<SubmissionResponseDto>();
            }

            var assignment = await _context.Assignments
                .FirstOrDefaultAsync(a => a.Id == assignmentId && a.TeacherId == teacher.Id);

            if (assignment == null)
            {
                return Enumerable.Empty<SubmissionResponseDto>();
            }

            var submittedAssignments = await _context.Submissions
                .Include(s => s.Student).ThenInclude(st => st!.User)
                .Include(s => s.Assignment)
                .Where(s => s.AssignmentId == assignmentId)
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

            return submittedAssignments;
        }

        public async Task<bool> GradeSubmissionAsync(Guid userId, Guid submissionId, GradeSubmissionDto dto)
        {
            var teacher = await GetTeacherByUserIdAsync(userId);
            if (teacher == null) return false;

            var submission = await _context.Submissions
                .Include(s => s.Assignment)
                .FirstOrDefaultAsync(s => s.Id == submissionId);

            if (submission == null || submission.Assignment == null || submission.Assignment.TeacherId != teacher.Id)
            {
                return false;
            }

            if (dto.MarksAssigned > submission.Assignment.Marks)
            {
                throw new Exception($"Marks assigned ({dto.MarksAssigned}) cannot be greater than the maximum assignment marks ({submission.Assignment.Marks}).");
            }

            submission.MarkAssigned = dto.MarksAssigned;
            submission.TeacherFeedback = dto.Feedback;
            submission.Status = dto.Status;
            submission.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}