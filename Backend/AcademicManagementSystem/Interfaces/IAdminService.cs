using AcademicManagementSystem.DTOs.Assign;
using AcademicManagementSystem.DTOs.AssignmentDtos;
using AcademicManagementSystem.DTOs.Class;
using AcademicManagementSystem.DTOs.QueryDtos;
using AcademicManagementSystem.DTOs.Student;
using AcademicManagementSystem.DTOs.Subject;
using AcademicManagementSystem.DTOs.SubmissionDtos;
using AcademicManagementSystem.DTOs.Teacher;
using AcademicManagementSystem.DTOs.UserDtos;
using AcademicManagementSystem.Models;

namespace AcademicManagementSystem.Interfaces
{
    public interface IAdminService
    {
        Task<IEnumerable<ClassResponseDto>> GetClassesAsync();
        Task<QueryResultDto<UserDto>> GetAllUsersAsync(UserQueryParameterDto queryParams);
        Task<IEnumerable<StudentDto>> GetStudentsAsync(string? search = null, string? className = null, string? section = null);
        Task<IEnumerable<TeacherDto>> GetTeachersAsync(string? search = null, string? specialization = null);
        Task<bool> UpdateTeacherAsync(Guid id, UpdateTeacherDto dto);
        Task<IEnumerable<SubjectResponseDto>> GetSubjectsAsync();
        Task<bool> UpdateStudentAsync(Guid id, UpdateStudentDto dto);
        Task<bool> UpdateUserRoleAsync(Guid id, DTOs.UserDtos.Role newRole);
        Task<bool> SoftDeleteUserAsync(Guid targetUserId, Guid currentUserId);
        Task<ClassDetails> CreateClassAsync(CreateClassDto dto);
        Task<ClassDetails?> UpdateClassAsync(Guid id, CreateClassDto dto);
        Task<bool> DeleteClassAsync(Guid id);
        Task<Subject> CreateSubjectAsync(CreateSubjectDto dto);
        Task<Subject?> UpdateSubjectAsync(Guid id, CreateSubjectDto dto);
        Task<bool> DeleteSubjectAsync(Guid id);
        Task<bool> AssignStudentToClassAsync(Guid studentId, Guid classId);
        Task<bool> AssignTeacherToClassAsync(Guid teacherId, List<Guid> classDetailsIds);
        Task<bool> AssignSubjectToTeacherAsync(Guid teacherId, Guid subjectId);
        Task<bool> RemoveSubjectFromTeacherAsync(Guid teacherId, Guid subjectId);
        Task<bool> AssignSubjectToClassAsync(Guid classId, Guid subjectId);
        Task<bool> RemoveSubjectFromClassAsync(Guid classId, Guid subjectId);

        Task<IEnumerable<TeacherDto>> GetAllTeachersDetailedAsync();
        Task<IEnumerable<StudentDto>> GetAllStudentsDetailedAsync();

        Task<bool> AssignTeacherAllocationAsync(AssignTeacherAllocationDto dto);
        Task<bool> RemoveTeacherAllocationAsync(AssignTeacherAllocationDto dto);

        Task<IEnumerable<AssignmentResponseDto>> GetAllAssignmentsAsync();
        Task<IEnumerable<SubmissionResponseDto>> GetAllSubmissionsAsync();
    }
}