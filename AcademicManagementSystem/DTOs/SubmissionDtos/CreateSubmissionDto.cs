namespace AcademicManagementSystem.DTOs.SubmissionDtos
{
    public class CreateSubmissionDto
    {
        public Guid AssignmentId { get; set; }
        public string FilePath { get; set; } = string.Empty;
    }
}
