using System.ComponentModel.DataAnnotations;

namespace ProjectManager.Api.Domain.Entities
{
    public class TaskItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required, MinLength(1), MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public DateTime? DueDateUtc { get; set; }

        public bool IsCompleted { get; set; } = false;

        [Required]
        public Guid ProjectId { get; set; }
        public Project? Project { get; set; }
    }
}
