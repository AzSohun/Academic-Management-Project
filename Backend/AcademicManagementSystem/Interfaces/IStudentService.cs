using AcademicManagementSystem.DTOs.AssignmentDtos;
using AcademicManagementSystem.DTOs.Class;
using AcademicManagementSystem.DTOs.Student;
using AcademicManagementSystem.DTOs.SubmissionDtos;

namespace AcademicManagementSystem.Interfaces
{
    public interface IStudentService
    {
        Task<IEnumerable<AssignmentResponseDto>> GetMyClassAssignmentsAsync(Guid studentId);
        Task<MyEnrolledClassDto?> GetMyClassAsync(Guid userId);
        Task<StudentProfileResponseDto?> GetMyProfileAsync(Guid userId);
        Task<bool> UpdateMyProfileAsync(Guid userId, UpdateStudentProfileDto dto);
        Task<AssignmentResponseDto?> GetAssignmentDetailsAsync(Guid assignmentId);
        Task<SubmissionResponseDto?> SubmitAssignmentAsync(Guid studentId, CreateSubmissionDto dto);
        Task<bool> UpdateSubmissionAsync(Guid studentId, Guid submissionId, string newFilePath);
        Task<IEnumerable<SubmissionResponseDto?>> GetMySubmissionsAsync(Guid studentId);
    }
}
