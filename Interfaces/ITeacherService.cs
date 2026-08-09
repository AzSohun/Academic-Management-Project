using AcademicManagementSystem.DTOs.AssignmentDtos;
using AcademicManagementSystem.DTOs.SubmissionDtos;
using AcademicManagementSystem.Models;

namespace AcademicManagementSystem.Interfaces
{
    public interface ITeacherService
    {
        Task<AssignmentResponseDto> CreateAssignmentAsync(Guid teacherId, CreateAssignmentDto dto);
        Task<bool> UpdateAssignmentAsync(Guid teacherId, Guid assignmentId, UpdateAssignmentDto dto);
        Task<bool> DeleteAssignmentAsync(Guid teacherId, Guid assignmentId);
        Task<bool> TogglePublishStatusAsync(Guid teacherId, Guid assignmentId, bool isDraft);
        Task<IEnumerable<SubmissionResponseDto>> GetSubmissionsForAssignmentAsync(Guid teacherUserId, Guid assignmentId);
        Task<bool> GradeSubmissionAsync(Guid teacherId, Guid submissionId, GradeSubmissionDto dto);
    }
}
