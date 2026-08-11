using AcademicManagementSystem.DTOs;
using AcademicManagementSystem.DTOs.QueryDtos;
using AcademicManagementSystem.DTOs.UserDtos;
using AcademicManagementSystem.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleDto dto)
        {
            var res = await _adminService.UpdateUserRoleAsync(id, dto.Role);
            if (!res) return NotFound("User Not Found!");
            return Ok(new { message = "User role updated successfully." });
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> SoftDeleteUser(Guid id)
        {
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                                     ?? User.FindFirst("sub")?.Value;

            if (!Guid.TryParse(currentUserIdClaim, out Guid currentUserId))
            {
                return Unauthorized();
            }

            try
            {
                var res = await _adminService.SoftDeleteUserAsync(id, currentUserId);
                if (!res) return NotFound("User Not Found!");
                return Ok(new { message = "User soft-deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("classes")]
        public async Task<IActionResult> CreateClass([FromBody] CreateClassDto dto)
        {
            try
            {
                var res = await _adminService.CreateClassAsync(dto);
                return Ok(res);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
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
            try
            {
                var res = await _adminService.CreateSubjectAsync(dto);
                return Ok(res);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("subjects/{id}")]
        public async Task<IActionResult> UpdateSubject(Guid id, [FromBody] CreateSubjectDto dto)
        {
            var res = await _adminService.UpdateSubjectAsync(id, dto);
            if (res == null) return NotFound("Subject Not Found!");
            return Ok(res);
        }

        [HttpDelete("subjects/{id}")]
        public async Task<IActionResult> DeleteSubject(Guid id)
        {
            var res = await _adminService.DeleteSubjectAsync(id);
            if (!res) return NotFound("Subject Not Found!");
            return Ok(new { message = "Subject deleted successfully" });
        }

        [HttpPost("assign-student-to-class")]
        public async Task<IActionResult> AssignStudent([FromQuery] Guid studentId, [FromQuery] Guid classId)
        {
            var res = await _adminService.AssignStudentToClassAsync(studentId, classId);
            if (!res)
            {
                return BadRequest(new { message = "Unable to assign student to the class." });
            }
            return Ok(new { message = "Student assigned successfully." });
        }

        [HttpPost("assign-teacher-class")]
        public async Task<IActionResult> AssignTeacher([FromBody] AssignTeacherDto dto)
        {
            var res = await _adminService.AssignTeacherToClassAsync(dto.TeacherId, dto.ClassDetailsIds);
            if (!res) return BadRequest(new { message = "Unable to assign teacher to the class." });
            return Ok(new { message = "Teacher assigned successfully." });
        }

        [HttpGet("assignments")]
        public async Task<IActionResult> GetAllAssignments()
            => Ok(await _adminService.GetAllAssignmentsAsync());

        [HttpGet("submissions")]
        public async Task<IActionResult> GetAllSubmission()
            => Ok(await _adminService.GetAllSubmissionsAsync());
    }
}