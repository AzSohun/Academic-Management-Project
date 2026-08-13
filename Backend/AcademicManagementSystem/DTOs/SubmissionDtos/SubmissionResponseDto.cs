namespace AcademicManagementSystem.DTOs.SubmissionDtos
{
    public class SubmissionResponseDto
    {
        public Guid Id { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public DateTime SubmissionDate { get; set; }
        public int? MarkAssigned { get; set; }
        public string TeacherFeedback { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string AssignmentTitle { get; set; } = string.Empty;
    }
}
