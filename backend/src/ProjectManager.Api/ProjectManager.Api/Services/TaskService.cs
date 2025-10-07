using Microsoft.EntityFrameworkCore;
using ProjectManager.Api.Data;
using ProjectManager.Api.Domain.Entities;
using ProjectManager.Api.Dtos.Tasks;
using ProjectManager.Api.Services.Interfaces;

namespace ProjectManager.Api.Services
{
    public class TaskService : ITaskService
    {
        private readonly AppDbContext _db;
        public TaskService(AppDbContext db) => _db = db;

        public async Task<TaskResponse?> CreateAsync(Guid userId, Guid projectId, CreateTaskRequest req)
        {
            // Ensure the project belongs to the current user
            var owned = await _db.Projects.AnyAsync(p => p.Id == projectId && p.UserId == userId);
            if (!owned) return null;

            var t = new TaskItem
            {
                Title = req.Title.Trim(),
                DueDateUtc = req.DueDateUtc,
                ProjectId = projectId
            };

            _db.Tasks.Add(t);
            await _db.SaveChangesAsync();

            return new TaskResponse
            {
                Id = t.Id.ToString(),
                Title = t.Title,
                DueDateUtc = t.DueDateUtc,
                IsCompleted = t.IsCompleted,
                ProjectId = t.ProjectId.ToString()
            };
        }

        public async Task<IReadOnlyList<TaskResponse>?> ListByProjectAsync(Guid userId, Guid projectId)
        {
            // verify the project belongs to this user
            var owned = await _db.Projects.AsNoTracking()
                .AnyAsync(p => p.Id == projectId && p.UserId == userId);
            if (!owned) return null;

            var items = await _db.Tasks.AsNoTracking()
                .Where(t => t.ProjectId == projectId)
                .OrderBy(t => t.IsCompleted)
                .ThenBy(t => t.DueDateUtc == null) // non-null due dates first
                .ThenBy(t => t.DueDateUtc) // then by the actual due date
                .Select(t => new TaskResponse
                {
                    Id = t.Id.ToString(),
                    Title = t.Title,
                    DueDateUtc = t.DueDateUtc,
                    IsCompleted = t.IsCompleted,
                    ProjectId = t.ProjectId.ToString()
                })
                .ToListAsync();

            return items;
        }

        public async Task<TaskResponse?> UpdateAsync(Guid userId, Guid taskId, UpdateTaskRequest req)
        {
            // Load task + project to assert ownership
            var t = await _db.Tasks
                .Include(x => x.Project)
                .FirstOrDefaultAsync(x => x.Id == taskId && x.Project!.UserId == userId);

            if (t is null) return null;

            if (req.Title is not null)
                t.Title = req.Title.Trim();

            // Accept explicit null to clear due date
            if (req.DueDateUtc != null || req.DueDateUtc == null)
                t.DueDateUtc = req.DueDateUtc;

            if (req.IsCompleted.HasValue)
                t.IsCompleted = req.IsCompleted.Value;

            await _db.SaveChangesAsync();

            return new TaskResponse
            {
                Id = t.Id.ToString(),
                Title = t.Title,
                DueDateUtc = t.DueDateUtc,
                IsCompleted = t.IsCompleted,
                ProjectId = t.ProjectId.ToString()
            };
        }

        public async Task<bool> DeleteAsync(Guid userId, Guid taskId)
        {
            var t = await _db.Tasks
                .Include(x => x.Project)
                .FirstOrDefaultAsync(x => x.Id == taskId && x.Project!.UserId == userId);

            if (t is null) return false;

            _db.Tasks.Remove(t);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
