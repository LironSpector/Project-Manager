namespace ProjectManager.Api.Dtos.Tasks
{
    public class TaskResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public DateTime? DueDateUtc { get; set; }
        public bool IsCompleted { get; set; }
        public string ProjectId { get; set; } = string.Empty;
    }
}
