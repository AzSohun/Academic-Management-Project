namespace AcademicManagementSystem.DTOs.Student
{
    public class StudentProfileResponseDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateOnly? DateOfBirth { get; set; }
        public string Address { get; set; } = string.Empty;
        public string ParentContact { get; set; } = string.Empty;

        public string RollNo { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;
        public string Section { get; set; } = string.Empty;
    }
}
