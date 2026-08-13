namespace AcademicManagementSystem.DTOs.Class
{
    public class EnrolledSubjectDto
    {
        public Guid Id { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public int ActiveAssignments { get; set; }
    }
}
