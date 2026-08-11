using AcademicManagementSystem.DTOs;
using AcademicManagementSystem.DTOs.QueryDtos;
using AcademicManagementSystem.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AcademicManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {

        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }


        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers([FromQuery] UserQueryParameterDto queryParams)
        {
            var pagedUsers = await _adminService.GetAllUsersAsync(queryParams);
            return Ok(pagedUsers);
        }

        [HttpGet("classes")]
        public async Task<IActionResult> GetClasses()
            => Ok(await _adminService.GetClassesAsync());

        [HttpGet("students")]
        public async Task<IActionResult> GetStudents()
            => Ok(await _adminService.GetStudentsAsync());

        [HttpGet("teachers")]
        public async Task<IActionResult> GetTeachers()
            => Ok(await _adminService.GetTeachersAsync());


        [HttpGet("subjects")]
        public async Task<IActionResult> GetSubjects()
            => Ok(await _adminService.GetSubjectsAsync());


        [HttpDelete("users/{id}")]
        public async Task<IActionResult> SoftDeleteUser(Guid id)
        {
            var res = await _adminService.SoftDeleteUserAsync(id);
            if (!res) return NotFound("User Not Found!");
            return Ok(new { message = "User deleted successfully" });
        }

        [HttpPost("classes")]
        public async Task<IActionResult> CreateClass([FromBody] CreateClassDto dto)
        {
            var res = await _adminService.CreateClassAsync(dto);

            if(res == null)
            {
                return NotFound("Class Not Found!");
            }

            return Ok(res);
        }


        [HttpPut("classes/{id}")]
        public async Task<IActionResult> UpdateClass(Guid id, [FromBody] CreateClassDto dto)
        {
            var res = await _adminService.UpdateClassAsync(id, dto);
            if (res == null) return NotFound("Class Not Found!");
            return Ok(res);
        }

        [HttpDelete("classes/{id}")]
        public async Task<IActionResult> DeleteClass(Guid id)
        {
            var res = await _adminService.DeleteClassAsync(id);
            if (!res) return NotFound("Class Not Found!");
            return Ok(new { message = "Class deleted successfully" });
        }


        [HttpPost("subjects")]
        public async Task<IActionResult> CreateSubject([FromBody] CreateSubjectDto dto)
        {

            var res = await _adminService.CreateSubjectAsync(dto);

            if(res == null)
            {
                return NotFound("Subject Not Found");
            }

            return Ok(res);

        }


        [HttpPost("assign-student-to-class")]
        public async Task<IActionResult> AssignStudent([FromQuery] Guid studentId, [FromQuery] Guid classId)
        {
            var res = await _adminService.AssignStudentToClassAsync(studentId, classId);

            if (!res)
            {
                return BadRequest("Unable to assign a student to the class");
            }

            return Ok(res);
        }


        [HttpPost("assign-teacher-class")]
        public async Task<IActionResult> AssignTeacher([FromBody] AssignTeacherDto dto)
        {
            var res = await _adminService.AssignTeacherToClassAsync(dto.TeacherId, dto.ClassDetailsId);
            if (!res) return BadRequest("Unable to assign teacher to the class");
            return Ok(res);
        }


        [HttpGet("assignments")]
        public async Task<IActionResult> GetAllAssignments()=> Ok(await _adminService.GetAllAssignmentsAsync());


        [HttpGet("submissions")]
        public async Task<IActionResult> GetAllSubmission() => Ok(await _adminService.GetAllSubmissionsAsync());
    }
}
