using AcademicManagementSystem.Data;
using AcademicManagementSystem.DTOs.AuthDtos;
using AcademicManagementSystem.Interfaces;
using AcademicManagementSystem.Models;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace AcademicManagementSystem.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _appDbContext;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext appDbContext, IConfiguration configuration)
        {
            _appDbContext = appDbContext;
            _configuration = configuration;
        }


        public async Task<string> SignUpAsync(SignUpDto signUpDto)
        {
            var userExist = await _appDbContext.Users.FirstOrDefaultAsync(u => u.Email == signUpDto.Email);

            if (userExist != null)
            {
                return "User already exists";
            }

            int length = await _appDbContext.Users.CountAsync();

            var PasswordHash = BCrypt.Net.BCrypt.HashPassword(signUpDto.Password);

            if (length == 0)
            {
                var admin = new User
                {
                    FirstName = signUpDto.FirstName,
                    LastName = signUpDto.LastName,
                    Email = signUpDto.Email.ToLower(),
                    Password = PasswordHash,
                    Gender = (Models.Gender?)signUpDto.Gender,
                    Role = (Models.Role?)Models.Role.Admin,
                };
                await _appDbContext.Users.AddAsync(admin);
                await _appDbContext.SaveChangesAsync();

                return "Admin User Created Successfully";
            }

            var newUser = new User
            {
                FirstName = signUpDto.FirstName,
                LastName = signUpDto.LastName,
                Email = signUpDto.Email.ToLower(),
                Password = PasswordHash,
                Gender = (Models.Gender?)signUpDto.Gender,
                Role = (Models.Role?)signUpDto.Role,

            };

            await _appDbContext.Users.AddAsync(newUser);

            if (newUser.Role == Models.Role.Student)
            {
                _appDbContext.Students.Add(new Student { UserId = newUser.Id });
            }
            else if (newUser.Role == Models.Role.Teacher)
            {
                _appDbContext.Teachers.Add(new Teacher { UserId = newUser.Id });
            }


            await _appDbContext.SaveChangesAsync();

            return "User Created Successfully";

        }



        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _appDbContext.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
            {
                throw new Exception("User not found");
            }

            bool isPasswordMatched = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password);

            if (!isPasswordMatched)
            {
                throw new Exception("Invalid password");
            }

            var accessToken = GenerateAccessToken(user);
            var refreshToken = GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            await _appDbContext.SaveChangesAsync();

            return new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
            };

        }




        public async Task<AuthResponseDto> RefreshTokenAsync(string RefreshToken)
        {
            var user = await _appDbContext.Users.FirstOrDefaultAsync(u => u.RefreshToken == RefreshToken);

            if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                throw new Exception("Invalid or expired refresh token");
            }

            var newAccessToke = GenerateAccessToken(user);
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            await _appDbContext.SaveChangesAsync();

            return new AuthResponseDto
            {
                AccessToken = newAccessToke,
                RefreshToken = newRefreshToken,
            };

        }


        public string GenerateAccessToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FirstName + " " + user.LastName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString() ?? "Student"),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: creds
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }


        private static string GenerateRefreshToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        }
    }
}
