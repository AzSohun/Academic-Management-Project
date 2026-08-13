namespace AcademicManagementSystem.DTOs.Teacher
{
    public class UpdateTeacherProfileDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public DateOnly? DateOfBirth { get; set; }
        public string Qualification { get; set; } = string.Empty;
        public string Experience { get; set; } = string.Empty;
    }
}
