namespace AcademicManagementSystem.Models
{
    public class ClassDetails
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string ClassName { get; set; } = string.Empty;
        public string RoomNumber { get; set; } = string.Empty;

        public ICollection<Student> Students { get; set; } = new List<Student>();
        public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();

        public ICollection<Teacher> Teachers { get; set; } = new List<Teacher>();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }
    }
}