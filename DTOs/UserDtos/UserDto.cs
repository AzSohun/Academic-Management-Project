namespace AcademicManagementSystem.DTOs.UserDtos
{
    public class UserDto
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public String FirstName { get; set; } = String.Empty;
        public String LastName { get; set; } = String.Empty;
        public String Email { get; set; } = String.Empty;
        public Role? Role { get; set; }
        public Gender? Gender { get; set; }
    }

    public enum Role
    {
        Admin,
        Teacher,
        Student
    }

    public enum Gender
    {
        Male,
        Female
    }
}
