using AcademicManagementSystem.Models;

namespace AcademicManagementSystem.DTOs.SubmissionDtos
{
    public class GradeSubmissionDto
    {
        public int MarksAssigned { get; set; }
        public string Feedback { get; set; } = string.Empty;
        public SubmissionStatus Status { get; set; } = SubmissionStatus.Graded;
    }
}
