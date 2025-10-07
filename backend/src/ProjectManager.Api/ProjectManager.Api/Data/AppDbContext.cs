using Microsoft.EntityFrameworkCore;
using ProjectManager.Api.Domain.Entities;

namespace ProjectManager.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<TaskItem> Tasks => Set<TaskItem>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

        protected override void OnModelCreating(ModelBuilder b)
        {
            base.OnModelCreating(b);

            b.Entity<User>().HasIndex(u => u.Email).IsUnique();

            b.Entity<Project>()
             .HasOne(p => p.User)
             .WithMany(u => u.Projects)
             .HasForeignKey(p => p.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            b.Entity<TaskItem>()
             .HasOne(t => t.Project)
             .WithMany(p => p.Tasks)
             .HasForeignKey(t => t.ProjectId)
             .OnDelete(DeleteBehavior.Cascade);

            b.Entity<RefreshToken>()
             .HasIndex(rt => rt.TokenHash)
             .IsUnique();

            b.Entity<RefreshToken>()
             .HasOne(rt => rt.User)
             .WithMany()
             .HasForeignKey(rt => rt.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
