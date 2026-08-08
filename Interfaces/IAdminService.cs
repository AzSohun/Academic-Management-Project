using AcademicManagementSystem.DTOs;
using AcademicManagementSystem.DTOs.AssignmentDtos;
using AcademicManagementSystem.DTOs.SubmissionDtos;
using AcademicManagementSystem.Models;

namespace AcademicManagementSystem.Interfaces
{
    public interface IAdminService
    {
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<ClassDetails> CreateClassAsync(CreateClassDto dto);
        Task<Subject> CreateSubjectAsync(CreateSubjectDto dto);
        Task<bool> AssignStudentToClassAsync(Guid studentId, Guid classId);
        Task<IEnumerable<AssignmentResponseDto>> GetAllAssignmentsAsync();
        Task<IEnumerable<SubmissionResponseDto>> GetAllSubmissionsAsync();
    }
}
