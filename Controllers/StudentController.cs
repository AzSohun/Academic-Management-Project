using AcademicManagementSystem.DTOs.SubmissionDtos;
using AcademicManagementSystem.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
            return Ok(await _studentService.SubmitAssignmentAsync(GetUserId(), dto));
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