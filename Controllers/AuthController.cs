using AcademicManagementSystem.DTOs.AuthDtos;
using AcademicManagementSystem.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AcademicManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {

        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }



        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] SignUpDto signUpDto)
        {
            try
            {
                var result = await _authService.SignUpAsync(signUpDto);
                if (result == "User already exists")
                {
                    return BadRequest(new { message = result });
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

        }




        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            try
            {
                var response = await _authService.LoginAsync(loginDto);
                
                SetRefreshTokenCookie(response.RefreshToken);

                return Ok(new
                {
                    accessToken = response.AccessToken,
                    message = "Login successful"
                });

            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }


        }




        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            try
            {
                var refreshToken= Request.Cookies["refreshToken"];

                if (String.IsNullOrWhiteSpace(refreshToken))
                {
                    return BadRequest(new { message = "Refresh token is missing" });
                }

                var response = await _authService.RefreshTokenAsync(refreshToken);

                SetRefreshTokenCookie(response.RefreshToken);

                return Ok(new
                {
                    accessToken = response.AccessToken,
                    message = "Token refreshed successfully"
                });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }



        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("refreshToken");
            return Ok(new { message = "Logged out successfully" });
        }


        private void SetRefreshTokenCookie(string refreshToken)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7),
                Secure = true,
                SameSite = SameSiteMode.Strict
            };
            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
        }
    }
}
