using AcademicManagementSystem.DTOs.AuthDtos;

namespace AcademicManagementSystem.Interfaces
{
    public interface IAuthService
    {

        Task<string> LoginAsync(LoginDto loginDto);
        Task<string> SignUpAsync(SignUpDto signUpDto);

    }
}
