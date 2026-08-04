namespace AcademicManagementSystem.Models
{
    public class ClassDetails
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public String ClassName { get; set; } = String.Empty;
        public String RoomNumber { get; set; } = String.Empty;

        public IEnumerable<Student> Students { get; set; } = new List<Student>();
        public IEnumerable<Assignment> Assignments { get; set; } = new List<Assignment>();

        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? UpdatedDate { get; set; }

    }
}
