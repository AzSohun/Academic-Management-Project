using AcademicManagementSystem.Data;
using AcademicManagementSystem.DTOs.AuthDtos;
using AcademicManagementSystem.Interfaces;
using AcademicManagementSystem.Models;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace AcademicManagementSystem.Services
{
    public class AuthService: IAuthService
    {
        private readonly AppDbContext _appDbContext;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext appDbContext, IConfiguration configuration)
        {
            _appDbContext = appDbContext;
            _configuration = configuration;
        }

        public async Task<string> LoginAsnc(LoginDto loginDto)
        {
            var isUserExist = await _appDbContext.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if(isUserExist == null)
            {
                throw new Exception("User not found");
            }

            bool isPasswordMatched = BCrypt.Net.BCrypt.Verify(loginDto.Password, isUserExist.Password);

            if (!isPasswordMatched)
            {
                throw new Exception("Invalid password");
            }

            return "User Login Successful";

        }

        public Task<string> LoginAsync(LoginDto loginDto)
        {
            throw new NotImplementedException();
        }

        public async Task<string> SignUpAsync(SignUpDto signUpDto)
        {
            var userExist = await _appDbContext.Users.FirstOrDefaultAsync(u => u.Email == signUpDto.Email);
            
            if(userExist != null)
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

            if(newUser.Role == Models.Role.Student)
            {
                _appDbContext.Students.Add(new Student { UserId = newUser.Id });
            }
            else if(newUser.Role == Models.Role.Teacher)
            {
                _appDbContext.Teachers.Add(new Teacher { UserId = newUser.Id });
            }


            await _appDbContext.SaveChangesAsync();

            return "User Created Successfully"; 

        }

    }
}
