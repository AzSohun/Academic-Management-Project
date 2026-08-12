namespace AcademicManagementSystem.DTOs.Class
{
    public class ClassmateDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string RollNo { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Section { get; set; } = string.Empty;
    }
}
