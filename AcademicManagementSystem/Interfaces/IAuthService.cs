using AcademicManagementSystem.DTOs.AuthDtos;

namespace AcademicManagementSystem.Interfaces
{
    public interface IAuthService
    {

        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<string> SignUpAsync(SignUpDto signUpDto);
        Task<AuthResponseDto> RefreshTokenAsync(string RefreshToken);
        Task LogoutAsync(string refreshToken);

    }
}
