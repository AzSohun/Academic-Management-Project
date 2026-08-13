namespace AcademicManagementSystem.DTOs.Teacher
{
    public class UpdateTeacherDto
    {
        public string TeacherCode { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;

        public List<Guid> ClassIds { get; set; } = new List<Guid>();
        public List<Guid> SubjectIds { get; set; } = new List<Guid>();
    }
}
