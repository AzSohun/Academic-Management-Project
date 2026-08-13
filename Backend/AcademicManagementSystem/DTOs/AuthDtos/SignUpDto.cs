namespace AcademicManagementSystem.DTOs.AuthDtos
{
    public class SignUpDto
    {

        public String FirstName { get; set; } = String.Empty;
        public String LastName { get; set; } = String.Empty;
        public String Email { get; set; } = String.Empty;
        public String Password { get; set; } = String.Empty;
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
