namespace AcademicManagementSystem.DTOs.Class
{
    public class MyEnrolledClassDto
    {
        public Guid Id { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string RoomNumber { get; set; } = string.Empty;

        public List<ClassmateDto> Classmates { get; set; } = new List<ClassmateDto>();
        public List<EnrolledSubjectDto> Subjects { get; set; } = new List<EnrolledSubjectDto>();
    }
}
