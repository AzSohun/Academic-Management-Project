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
        public bool IsDeleted { get; set; } = false;

        public string AllocatedClass { get; set; } = string.Empty;
        public List<string> TeacherClasses { get; set; } = new List<string>();
        public List<string> TeacherSubjects { get; set; } = new List<string>();
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
