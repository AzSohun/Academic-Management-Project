using AcademicManagementSystem.Models;

namespace AcademicManagementSystem.DTOs.AssignmentDtos
{
    public class AssignmentResponseDto
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = String.Empty;
        public string Description { get; set; } = String.Empty;
        public int? Marks { get; set; }
        public DateOnly DueDate { get; set; }
        public bool IsDraft { get; set; } = true;

        public string SubjectName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public string TeacherName { get; set; } = string.Empty;
    }
}
