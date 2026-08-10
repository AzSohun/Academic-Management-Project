using AcademicManagementSystem.DTOs;
using AcademicManagementSystem.DTOs.AssignmentDtos;
using AcademicManagementSystem.DTOs.SubmissionDtos;
using AcademicManagementSystem.Models;

namespace AcademicManagementSystem.Interfaces
{
    public interface IAdminService
    {

        Task<IEnumerable<object>> GetClassesAsync();
        Task<IEnumerable<object>> GetStudentsAsync();
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<IEnumerable<object>> GetTeachersAsync();
        Task<ClassDetails> CreateClassAsync(CreateClassDto dto);
        Task<ClassDetails?> UpdateClassAsync(Guid id, CreateClassDto dto);
        Task<bool> DeleteClassAsync(Guid id);
        Task<Subject> CreateSubjectAsync(CreateSubjectDto dto);
        Task<bool> AssignStudentToClassAsync(Guid studentId, Guid classId);
        Task<bool> AssignTeacherToClassAsync(Guid teacherId, Guid classDetailsId);
        Task<IEnumerable<AssignmentResponseDto>> GetAllAssignmentsAsync();
        Task<IEnumerable<SubmissionResponseDto>> GetAllSubmissionsAsync();
    }
}
