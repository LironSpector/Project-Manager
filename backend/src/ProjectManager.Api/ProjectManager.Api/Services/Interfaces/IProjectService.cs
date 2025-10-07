using ProjectManager.Api.Dtos.Projects;

namespace ProjectManager.Api.Services.Interfaces
{
    public interface IProjectService
    {
        Task<IEnumerable<ProjectResponse>> ListAsync(Guid userId);
        Task<ProjectResponse?> CreateAsync(Guid userId, CreateProjectRequest req);
        Task<ProjectResponse?> GetAsync(Guid userId, Guid projectId);
        Task<bool> DeleteAsync(Guid userId, Guid projectId);
    }
}
