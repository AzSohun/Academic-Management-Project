namespace AcademicManagementSystem.DTOs.Student
{
    public class UpdateStudentDto
    {
        public string RollNo { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;
        public string Section { get; set; } = string.Empty;
        public Guid? ClassDetailsId { get; set; }
    }
}
