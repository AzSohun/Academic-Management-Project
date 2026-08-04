namespace AcademicManagementSystem.Models
{
    public class Student
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public String RoleNo { get; set; } = String.Empty;
        public Group? Group { get; set; }
        public string Section { get; set; } = String.Empty;
        public DateOnly? DateOfBirth { get; set; }
        public String ProfileImage { get; set; } = String.Empty;
        public string Address { get; set; } = String.Empty;
        public string ParentContact { get; set; } = String.Empty;
     

        public Guid UserId { get; set; }
        public User? User { get; set; }

        public Guid ClassDetailsId { get; set; }
        public ClassDetails? ClassDetails { get; set; }

        public IEnumerable<Submission> Submissions { get; set; } = new List<Submission>();

        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? UpdatedDate { get; set; }

    }


    public enum Group
    {
        Science,
        Commerce,
        Arts
    }

}
