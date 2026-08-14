namespace AcademicManagementSystem.DTOs.Teacher
{
    public class TeacherClassDetailsDto
    {
        public Guid Id { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string RoomNumber { get; set; } = string.Empty;
        public int StudentCount { get; set; }
        public List<TeacherSubjectDto> Subjects { get; set; } = new List<TeacherSubjectDto>();
        public List<TeacherStudentDto> Students { get; set; } = new List<TeacherStudentDto>();
    }

    public class TeacherSubjectDto
    {
        public Guid Id { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
    }

    public class TeacherStudentDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string RollNo { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Section { get; set; } = string.Empty;
    }
}
