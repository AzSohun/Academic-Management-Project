namespace AcademicManagementSystem.DTOs.Subject
{
    public class SubjectResponseDto
    {
        public Guid Id { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectDescription { get; set; } = string.Empty;
    }
}
