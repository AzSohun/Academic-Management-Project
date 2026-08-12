using AcademicManagementSystem.DTOs.AssignmentDtos;
using AcademicManagementSystem.DTOs.Class;
using AcademicManagementSystem.DTOs.QueryDtos;
using AcademicManagementSystem.DTOs.Subject;
using AcademicManagementSystem.DTOs.SubmissionDtos;
using AcademicManagementSystem.DTOs.UserDtos;
using AcademicManagementSystem.Models;

namespace AcademicManagementSystem.Interfaces
{
    public interface IAdminService
    {
        Task<IEnumerable<object>> GetClassesAsync();
        Task<QueryResultDto<UserDto>> GetAllUsersAsync(UserQueryParameterDto queryParams);
        Task<IEnumerable<object>> GetStudentsAsync();
        Task<IEnumerable<object>> GetTeachersAsync();
        Task<IEnumerable<object>> GetSubjectsAsync();
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

        Task<IEnumerable<AssignmentResponseDto>> GetAllAssignmentsAsync();
        Task<IEnumerable<SubmissionResponseDto>> GetAllSubmissionsAsync();
    }
}