using ProjectManager.Api.Dtos.Tasks;

namespace ProjectManager.Api.Services.Interfaces
{
    public interface ITaskService
    {
        Task<TaskResponse?> CreateAsync(Guid userId, Guid projectId, CreateTaskRequest req);
        Task<TaskResponse?> UpdateAsync(Guid userId, Guid taskId, UpdateTaskRequest req);
        Task<bool> DeleteAsync(Guid userId, Guid taskId);

        Task<IReadOnlyList<TaskResponse>?> ListByProjectAsync(Guid userId, Guid projectId);
    }
}
