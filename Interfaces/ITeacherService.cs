using AcademicManagementSystem.DTOs.AssignmentDtos;
using AcademicManagementSystem.DTOs.SubmissionDtos;

namespace AcademicManagementSystem.Interfaces
{
    public interface ITeacherService
    {
        Task<AssignmentResponseDto> CreateAssignmentAsync(Guid userId, CreateAssignmentDto dto);
        Task<bool> UpdateAssignmentAsync(Guid teacherUserId, Guid assignmentId, UpdateAssignmentDto dto);
        Task<bool> DeleteAssignmentAsync(Guid teacherUserId, Guid assignmentId);
        Task<bool> TogglePublishStatusAsync(Guid teacherUserId, Guid assignmentId, bool isDraft);
        Task<IEnumerable<SubmissionResponseDto>> GetSubmissionsForAssignmentAsync(Guid teacherUserId, Guid assignmentId);
        Task<bool> GradeSubmissionAsync(Guid teacherUserId, Guid submissionId, GradeSubmissionDto dto);
    }
}
