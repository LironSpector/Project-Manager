using System.ComponentModel.DataAnnotations;

namespace ProjectManager.Api.Dtos.Tasks
{
    public class CreateTaskRequest
    {
        [Required, MinLength(1), MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public DateTime? DueDateUtc { get; set; }
    }
}
