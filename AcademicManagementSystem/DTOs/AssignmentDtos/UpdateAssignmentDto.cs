namespace AcademicManagementSystem.DTOs.AssignmentDtos
{
    public class UpdateAssignmentDto
    {
        public string Title { get; set; } = String.Empty;
        public string Description { get; set; } = String.Empty;
        public int? Marks { get; set; }
        public DateOnly DueDate { get; set; }
        public bool IsDraft { get; set; } = true;

        public Guid SubjectId { get; set; }
        public Guid ClassDetailsId { get; set; }
    }
}
