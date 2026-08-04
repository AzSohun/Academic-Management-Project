namespace AcademicManagementSystem.Models
{
    public class Submission
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public String FilePath { get; set; } = String.Empty;
        public DateTime SubmissionDate { get; set; } = DateTime.Now;

        public int? MarkAssigned { get; set;  }
        public string TeacherFeedback { get; set; } = string.Empty;
        public SubmissionStatus Status { get; set; } = SubmissionStatus.Pending;


        public Guid AssignmentId { get; set; }
        public Assignment? Assignment { get; set; }
        public Guid StudentId { get; set; }
        public Student? Student { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? UpdatedDate { get; set; }

    }

    public enum SubmissionStatus
    {
        Pending,
        Graded,
        Late
    }

}
