using AcademicManagementSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace AcademicManagementSystem.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }

        public DbSet<User> Users { get; set; }
        public DbSet<ClassDetails> ClassDetails { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<Teacher> Teachers { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Assignment> Assignments { get; set; }
        public DbSet<Submission> Submissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // --- Indexes ---
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Subject>()
                .HasIndex(s => s.SubjectCode)
                .IsUnique();

            // --- User Relationships ---
            modelBuilder.Entity<Student>()
                .HasOne(s => s.User)
                .WithOne()
                .HasForeignKey<Student>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Teacher>()
                .HasOne(t => t.User)
                .WithOne()
                .HasForeignKey<Teacher>(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Student>()
                .HasOne(s => s.ClassDetails)
                .WithMany(c => c.Students)
                .HasForeignKey(s => s.ClassDetailsId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Teacher>()
                .HasMany(t => t.Classes)
                .WithMany(c => c.Teachers)
                .UsingEntity(j => j.ToTable("TeacherClasses")); 

            // --- Global Query Filters ---
            modelBuilder.Entity<User>()
                .HasQueryFilter(u => !u.IsDeleted);

            modelBuilder.Entity<Student>()
                .HasQueryFilter(s => s.User != null && !s.User.IsDeleted);

            modelBuilder.Entity<Teacher>()
                .HasQueryFilter(t => t.User != null && !t.User.IsDeleted);

            // --- Assignment Relationships ---
            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.Teacher)
                .WithMany(t => t.Assignments)
                .HasForeignKey(a => a.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.Subject)
                .WithMany(s => s.Assignments)
                .HasForeignKey(a => a.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.ClassDetails)
                .WithMany(c => c.Assignments)
                .HasForeignKey(a => a.ClassDetailsId)
                .OnDelete(DeleteBehavior.Cascade);

            // --- Submission Relationships ---
            modelBuilder.Entity<Submission>()
                .HasOne(s => s.Student)
                .WithMany(st => st.Submissions)
                .HasForeignKey(s => s.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Submission>()
                .HasOne(s => s.Assignment)
                .WithMany(a => a.Submissions)
                .HasForeignKey(s => s.AssignmentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}