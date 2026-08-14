using AcademicManagementSystem.DTOs.AssignmentDtos;
using AcademicManagementSystem.DTOs.Class;
using AcademicManagementSystem.DTOs.Subject;
using AcademicManagementSystem.DTOs.SubmissionDtos;
using AcademicManagementSystem.DTOs.Teacher;
using AcademicManagementSystem.Models;

namespace AcademicManagementSystem.Interfaces
{
    public interface ITeacherService
    {
        Task<Teacher?> GetTeacherByUserIdAsync(Guid userId);

        Task<TeacherProfileResponseDto?> GetMyProfileAsync(Guid userId);
        Task<bool> UpdateMyProfileAsync(Guid userId, UpdateTeacherProfileDto dto);

        Task<IEnumerable<TeacherClassDetailsDto>> GetMyClassesAsync(Guid userId);

        Task<IEnumerable<SubjectResponseDto>> GetMySubjectsAsync(Guid userId);

        Task<IEnumerable<AssignmentResponseDto>> GetTeacherAssignmentsAsync(Guid userId);

        Task<AssignmentResponseDto> CreateAssignmentAsync(Guid userId, CreateAssignmentDto dto);
        Task<bool> UpdateAssignmentAsync(Guid userId, Guid assignmentId, UpdateAssignmentDto dto);
        Task<bool> DeleteAssignmentAsync(Guid userId, Guid assignmentId);
        Task<bool> TogglePublishStatusAsync(Guid userId, Guid assignmentId, bool isDraft);

        Task<IEnumerable<SubmissionResponseDto>> GetAllSubmissionsForTeacherAsync(Guid userId);

        Task<IEnumerable<SubmissionResponseDto>> GetSubmissionsForAssignmentAsync(Guid userId, Guid assignmentId);
        Task<bool> GradeSubmissionAsync(Guid userId, Guid submissionId, GradeSubmissionDto dto);
    }
}