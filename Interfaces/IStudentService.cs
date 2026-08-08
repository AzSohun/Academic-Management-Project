using AcademicManagementSystem.DTOs.AssignmentDtos;
using AcademicManagementSystem.DTOs.SubmissionDtos;

namespace AcademicManagementSystem.Interfaces
{
    public interface IStudentService
    {
        Task<IEnumerable<AssignmentResponseDto>> GetMyClassAssignmentsAsync(Guid studentUserId);
        Task<AssignmentResponseDto?> GetAssignmentDetailsAsync(Guid assignmentId);
        Task<SubmissionResponseDto> SubmitAssignmentAsync(Guid studentUserId, CreateSubmissionDto dto);
        Task<bool> UpdateSubmissionAsync(Guid studentUserId, Guid submissionId, string newFilePath);
        Task<IEnumerable<SubmissionResponseDto>> GetMySubmissionsAsync(Guid studentUserId);
    }
}
