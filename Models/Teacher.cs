namespace AcademicManagementSystem.Models
{
    public class Teacher
    {

        public Guid Id { get; set; } = Guid.NewGuid();
        public String TeacherCode { get; set; } = String.Empty;
        public DateOnly? DateOfBirth { get; set; }
        public String PhoneNumber { get; set; } = String.Empty;
        public String Address { get; set; } = String.Empty;
        public String Qualification { get; set; } = String.Empty;
        public String Specialization { get; set; } = String.Empty;
        public String Experience { get; set; } = String.Empty;

        public Guid UserId { get; set; }
        public User? User { get; set; }

        public Guid? ClassDetailsId { get; set; }
        public ClassDetails? ClassDetails { get; set; }

        public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }
    }
}
