namespace AcademicManagementSystem.Models
{
    public class Admin
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string ProfileImage { get; set; } = string.Empty;

        public Guid UserId { get; set; }
        public User? User { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }


    }
}
