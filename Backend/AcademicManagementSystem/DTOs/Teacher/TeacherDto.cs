namespace AcademicManagementSystem.DTOs.Teacher
{
    public class TeacherDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        public string TeacherCode { get; set; } = string.Empty;
        public DateOnly? DateOfBirth { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Qualification { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public string Experience { get; set; } = string.Empty;

        public List<string> AssignedClasses { get; set; } = new List<string>();
        public List<string> AssignedSubjects { get; set; } = new List<string>();
    }
}
