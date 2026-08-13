namespace AcademicManagementSystem.DTOs.QueryDtos
{
    public class UserQueryParameterDto
    {
        public string? Search { get; set; }
        public int? Role { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;

    }
}
