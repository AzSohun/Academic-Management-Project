namespace AcademicManagementSystem.DTOs.Assign
{
    public class AssignTeacherDto
    {
        public Guid TeacherId { get; set; }
        public List<Guid> ClassDetailsIds { get; set; } = new List<Guid>();
    }
}