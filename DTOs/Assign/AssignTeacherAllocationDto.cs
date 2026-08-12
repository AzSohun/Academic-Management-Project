namespace AcademicManagementSystem.DTOs.Assign
{
    public class AssignTeacherAllocationDto
    {
        public Guid TeacherId { get; set; }
        public Guid ClassId { get; set; }
        public Guid SubjectId { get; set; }
    }
}
