using Microsoft.EntityFrameworkCore;
using ProjectManager.Api.Data;
using ProjectManager.Api.Domain.Entities;
using ProjectManager.Api.Dtos.Projects;
using ProjectManager.Api.Services.Interfaces;

namespace ProjectManager.Api.Services
{
    public class ProjectService : IProjectService
    {
        private readonly AppDbContext _db;
        public ProjectService(AppDbContext db) => _db = db;

        public async Task<IEnumerable<ProjectResponse>> ListAsync(Guid userId)
        {
            return await _db.Projects.AsNoTracking()
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreationDateUtc)
                .Select(p => new ProjectResponse
                {
                    Id = p.Id.ToString(),
                    Title = p.Title,
                    Description = p.Description,
                    CreationDateUtc = p.CreationDateUtc
                })
                .ToListAsync();
        }

        public async Task<ProjectResponse?> CreateAsync(Guid userId, CreateProjectRequest req)
        {
            var project = new Project
            {
                Title = req.Title.Trim(),
                Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description!.Trim(),
                UserId = userId,
                CreationDateUtc = DateTime.UtcNow
            };

            _db.Projects.Add(project);
            await _db.SaveChangesAsync();

            return new ProjectResponse
            {
                Id = project.Id.ToString(),
                Title = project.Title,
                Description = project.Description,
                CreationDateUtc = project.CreationDateUtc
            };
        }

        public async Task<ProjectResponse?> GetAsync(Guid userId, Guid projectId)
        {
            return await _db.Projects.AsNoTracking()
                .Where(p => p.UserId == userId && p.Id == projectId)
                .Select(p => new ProjectResponse
                {
                    Id = p.Id.ToString(),
                    Title = p.Title,
                    Description = p.Description,
                    CreationDateUtc = p.CreationDateUtc
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> DeleteAsync(Guid userId, Guid projectId)
        {
            var proj = await _db.Projects
                .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);
            if (proj is null) return false;

            _db.Projects.Remove(proj);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
