namespace AcademicManagementSystem.Models
{
    public class User
    {

        public Guid Id { get; set; } = Guid.NewGuid();
        public String FirstName { get; set; } = String.Empty;
        public String LastName { get; set; } = String.Empty;
        public String Email { get; set; } = String.Empty;
        public String Password { get; set; } = String.Empty;
        public  Role? Role { get; set; }
        public Gender? Gender { get; set; }


        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
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
