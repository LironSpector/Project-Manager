namespace ProjectManager.Api.Dtos.Tasks
{
    public class UpdateTaskRequest
    {
        public string? Title { get; set; } // optional
        public DateTime? DueDateUtc { get; set; } // optional
        public bool? IsCompleted { get; set; } // optional
    }
}
