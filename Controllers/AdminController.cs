using AcademicManagementSystem.DTOs;
using AcademicManagementSystem.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
        public async Task<IActionResult> GetAllUsers() => Ok(await _adminService.GetAllUsersAsync());


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
        public async Task<IActionResult> AssignStudent(Guid studentId, Guid classId)
        {

            var res = await _adminService.AssignStudentToClassAsync(studentId, classId);

            if (!res)
            {
                return BadRequest("Unable to assign a student to the class");
            }

            return Ok(res);

        }

        [HttpGet("assignments")]
        public async Task<IActionResult> GetAllAssignments()=> Ok(await _adminService.GetAllAssignmentsAsync());


        [HttpGet("submissions")]
        public async Task<IActionResult> GetAllSubmission() => Ok(await _adminService.GetAllSubmissionsAsync());
    }
}
