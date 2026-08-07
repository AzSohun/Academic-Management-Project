namespace AcademicManagementSystem.Models
{
    public class ClassDetails
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public String ClassName { get; set; } = String.Empty;
        public String RoomNumber { get; set; } = String.Empty;

        public ICollection<Student> Students { get; set; } = new List<Student>();
        public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }

    }
}
