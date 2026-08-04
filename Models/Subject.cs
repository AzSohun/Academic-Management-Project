namespace AcademicManagementSystem.Models
{
    public class Subject
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public String SubjectName { get; set; } = String.Empty;
        public String SubjectDescription { get; set; } = String.Empty;
        public String SubjectCode { get; set; } = String.Empty;

        public IEnumerable<Assignment> Assignments { get; set; } = new List<Assignment>();

        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? UpdatedDate { get; set; }

    }

}
