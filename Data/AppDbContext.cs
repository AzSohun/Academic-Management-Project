using Microsoft.EntityFrameworkCore;

namespace AcademicManagementSystem.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options): base(options)
        {

        }

        
    }
}
