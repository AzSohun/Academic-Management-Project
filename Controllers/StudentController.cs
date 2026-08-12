using AcademicManagementSystem.DTOs.Student;
using AcademicManagementSystem.DTOs.SubmissionDtos;
using AcademicManagementSystem.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AcademicManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Student")]
    public class StudentController : ControllerBase
    {
        private readonly IStudentService _studentService;

        public StudentController(IStudentService studentService)
        {
            _studentService = studentService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet("profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            var profile = await _studentService.GetMyProfileAsync(GetUserId());
            if (profile == null) return NotFound(new { message = "Student profile not found." });

            return Ok(new { data = profile });
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateStudentProfileDto dto)
        {
            try
            {
                var result = await _studentService.UpdateMyProfileAsync(GetUserId(), dto);
                if (!result) return BadRequest(new { message = "Failed to update profile." });

                return Ok(new { message = "Profile updated successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("my-class")]
        public async Task<IActionResult> GetMyClass()
        {
            var myClass = await _studentService.GetMyClassAsync(GetUserId());
            return Ok(myClass);
        }

        [HttpGet("assignments")]
        public async Task<IActionResult> GetMyClassAssignments()
        {
            return Ok(await _studentService.GetMyClassAssignmentsAsync(GetUserId()));
        }

        [HttpGet("assignments/{id}")]
        public async Task<IActionResult> GetAssignmentDetails(Guid id)
        {
            var result = await _studentService.GetAssignmentDetailsAsync(id);
            if (result == null) return NotFound("Assignment not found or not published.");
            return Ok(result);
        }

        [HttpPost("submissions")]
        public async Task<IActionResult> SubmitAssignment([FromBody] CreateSubmissionDto dto)
        {
            try
            {
                return Ok(await _studentService.SubmitAssignmentAsync(GetUserId(), dto));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("submissions/{id}")]
        public async Task<IActionResult> UpdateSubmission(Guid id, [FromQuery] string newFilePath)
        {
            try
            {
                return Ok(await _studentService.UpdateSubmissionAsync(GetUserId(), id, newFilePath));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("my-submissions")]
        public async Task<IActionResult> GetMySubmissions()
        {
            return Ok(await _studentService.GetMySubmissionsAsync(GetUserId()));
        }
    }
}