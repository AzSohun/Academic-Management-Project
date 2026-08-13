namespace AcademicManagementSystem.DTOs.Teacher
{
    public class TeacherProfileResponseDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public DateOnly? DateOfBirth { get; set; }
        public string Qualification { get; set; } = string.Empty;
        public string Experience { get; set; } = string.Empty;

        public string TeacherCode { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
    }
}
