namespace AcademicManagementSystem.DTOs.Student
{
    public class StudentDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        public string RollNo { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;
        public string Section { get; set; } = string.Empty;
        public DateOnly? DateOfBirth { get; set; }
        public string Address { get; set; } = string.Empty;
        public string ParentContact { get; set; } = string.Empty;

        public Guid? ClassDetailsId { get; set; }
        public string ClassName { get; set; } = string.Empty;
    }
}
