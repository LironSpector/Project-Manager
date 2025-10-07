namespace ProjectManager.Api.Dtos.Projects
{
    public class ProjectResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreationDateUtc { get; set; }
    }
}
