using AcademicManagementSystem.DTOs.Subject;

namespace AcademicManagementSystem.DTOs.Class
{
    public class ClassResponseDto
    {
        public Guid Id { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string RoomNumber { get; set; } = string.Empty;
        public List<SubjectResponseDto> Subjects { get; set; } = new List<SubjectResponseDto>();
    }
}
