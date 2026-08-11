namespace AcademicManagementSystem.Models
{
    public class Teacher
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string TeacherCode { get; set; } = string.Empty;
        public DateOnly? DateOfBirth { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Qualification { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public string Experience { get; set; } = string.Empty;

        public Guid UserId { get; set; }
        public User? User { get; set; }

        public ICollection<ClassDetails> Classes { get; set; } = new List<ClassDetails>();

        public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }
    }
}