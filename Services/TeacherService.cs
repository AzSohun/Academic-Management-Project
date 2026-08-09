using AcademicManagementSystem.Data;
using AcademicManagementSystem.DTOs.AssignmentDtos;
using AcademicManagementSystem.DTOs.SubmissionDtos;
using AcademicManagementSystem.Interfaces;
using AcademicManagementSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace AcademicManagementSystem.Services
{
    public class TeacherService: ITeacherService
    {

        private readonly AppDbContext _context;

        public TeacherService(AppDbContext context)
        {
            _context = context;
        }


        public async Task<Teacher?> GetTeacherByUserIdAsync(Guid teacherId)
        {
            return await _context.Teachers.FirstOrDefaultAsync(t => t.UserId == teacherId);
        }


        public async Task<AssignmentResponseDto> CreateAssignmentAsync(Guid teacherId, CreateAssignmentDto dto)
        {
            var teacher = await GetTeacherByUserIdAsync(teacherId);

            if(teacher == null)
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
                Title = assignment.Title,
                Description = assignment.Description,
                Marks = assignment.Marks,
                DueDate = assignment.DueDate,
                IsDraft = assignment.IsDraft,
            };
        }


        public async Task<bool> UpdateAssignmentAsync(Guid teacherId, Guid assignmentId, UpdateAssignmentDto dto)
        {
            var teacher = await GetTeacherByUserIdAsync(teacherId);
            var assignment = await _context.Assignments.FirstOrDefaultAsync(a => a.Id == assignmentId && a.TeacherId == teacherId);


            if(assignment == null)
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

        public async Task<bool> DeleteAssignmentAsync(Guid teacherId, Guid assignmentId)
        {
            var teacher = await GetTeacherByUserIdAsync(teacherId);
            var assignment = await _context.Assignments.FirstOrDefaultAsync(a => a.Id == assignmentId && a.TeacherId == teacherId);

            if(assignment == null)
            {
                return false;
            }

            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();

            return true;
        }


        public async Task<bool> TogglePublishStatusAsync(Guid teacherId, Guid assignmentId, bool isDraft)
        {

            var teacher = await GetTeacherByUserIdAsync(teacherId);
            var assignment = await _context.Assignments.FirstOrDefaultAsync(a => a.Id == assignmentId && a.TeacherId == teacherId);

            if(assignment == null)
            {
                return false;
            }

            assignment.IsDraft = isDraft;
            await _context.SaveChangesAsync();

            return true;

        }


        public async Task<IEnumerable<SubmissionResponseDto>> GetSubmissionsForAssignmentAsync(Guid teacherId, Guid assignmentId)
        {

            var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.Id == teacherId);

            if(teacher == null)
            {
                return Enumerable.Empty<SubmissionResponseDto>();
            }


            var submittedAssignment = await _context.Submissions
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

            return submittedAssignment;

        }


        public async Task<bool> GradeSubmissionAsync(Guid teacherId, Guid submissionId, GradeSubmissionDto dto)
        {

            var submission = await _context.Submissions
                .Include(s => s.Assignment)
                .FirstOrDefaultAsync(s => s.Id == submissionId);

            if(submission == null)
            {
                return false;
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
