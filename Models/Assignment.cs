namespace AcademicManagementSystem.Models
{
    public class Assignment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = String.Empty;
        public string Description { get; set; } = String.Empty;
        public int? Marks { get; set; }
        public DateOnly DueDate { get; set; }


        public Guid SubjectId { get; set; }
        public Subject? Subject { get; set; }

        public Guid TeacherId { get; set; }
        public Teacher? Teacher { get; set; }

        public Guid ClassDetailsId { get; set; }
        public ClassDetails? ClassDetails { get; set; }

        public IEnumerable<Submission> Submissions { get; set; } = new List<Submission>();

        public DateTime CreatedDate { get; set; }= DateTime.Now;
        public DateTime? UpdatedDate { get; set; }
    }
}
