using AcademicManagementSystem.DTOs.AssignmentDtos;
using AcademicManagementSystem.DTOs.SubmissionDtos;
using AcademicManagementSystem.Interfaces;
using AcademicManagementSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AcademicManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Teacher")]
    public class TeacherController : ControllerBase
    {
        private readonly ITeacherService _teacherService;

        public TeacherController(ITeacherService teacherService)
        {
            _teacherService = teacherService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet("classes")]
        public async Task<IActionResult> GetMyClasses()
        {
            return Ok(await _teacherService.GetMyClassesAsync(GetUserId()));
        }

        [HttpGet("subjects")]
        public async Task<IActionResult> GetMySubjects()
        {
            return Ok(await _teacherService.GetMySubjectsAsync(GetUserId()));
        }

        [HttpGet("assignments")]
        public async Task<IActionResult> GetMyAssignments()
        {
            return Ok(await _teacherService.GetTeacherAssignmentsAsync(GetUserId()));
        }

        [HttpGet("submissions")]
        public async Task<IActionResult> GetAllSubmissions()
        {
            return Ok(await _teacherService.GetAllSubmissionsForTeacherAsync(GetUserId()));
        }

        [HttpPost("assignments")]
        public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentDto dto)
        {
            return Ok(await _teacherService.CreateAssignmentAsync(GetUserId(), dto));
        }

        [HttpPut("assignments/{id}")]
        public async Task<IActionResult> UpdateAssignment(Guid id, [FromBody] UpdateAssignmentDto dto)
        {
            return Ok(await _teacherService.UpdateAssignmentAsync(GetUserId(), id, dto));
        }

        [HttpDelete("assignments/{id}")]
        public async Task<IActionResult> DeleteAssignment(Guid id)
        {
            return Ok(await _teacherService.DeleteAssignmentAsync(GetUserId(), id));
        }

        [HttpPatch("assignments/{id}/publish")]
        public async Task<IActionResult> TogglePublish(Guid id, [FromQuery] bool isDraft)
        {
            return Ok(await _teacherService.TogglePublishStatusAsync(GetUserId(), id, isDraft));
        }

        [HttpGet("assignments/{id}/submissions")]
        public async Task<IActionResult> GetSubmissions(Guid id)
        {
            return Ok(await _teacherService.GetSubmissionsForAssignmentAsync(GetUserId(), id));
        }

        [HttpPost("submissions/{id}/grade")]
        public async Task<IActionResult> GradeSubmission(Guid id, [FromBody] GradeSubmissionDto dto)
        {
            return Ok(await _teacherService.GradeSubmissionAsync(GetUserId(), id, dto));
        }
    }
}