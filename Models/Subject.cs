namespace AcademicManagementSystem.Models
{
    public class Subject
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public String SubjectName { get; set; } = String.Empty;
        public String SubjectDescription { get; set; } = String.Empty;
        public String SubjectCode { get; set; } = String.Empty;

        public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
        public ICollection<Teacher> Teachers { get; set; } = new List<Teacher>();
        public ICollection<ClassDetails> Classes { get; set; } = new List<ClassDetails>();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }

    }

}
