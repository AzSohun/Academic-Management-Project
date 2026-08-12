namespace AcademicManagementSystem.DTOs.Student
{
    public class UpdateStudentProfileDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateOnly? DateOfBirth { get; set; }
        public string Address { get; set; } = string.Empty;
        public string ParentContact { get; set; } = string.Empty;
    }
}
