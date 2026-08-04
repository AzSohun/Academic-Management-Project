namespace AcademicManagementSystem.Models
{
    public class ClassDetails
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public String ClassName { get; set; } = String.Empty;
        public String RoomNumber { get; set; } = String.Empty;

        public IEnumerable<Student> Students { get; set; } = new List<Student>();
        public IEnumerable<Subject> Subjects { get; set; } = new List<Subject>();

        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? UpdatedDate { get; set; }

    }
}
