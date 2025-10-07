using System.ComponentModel.DataAnnotations;

namespace ProjectManager.Api.Domain.Entities
{
    public class Project
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required, MinLength(3), MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public DateTime CreationDateUtc { get; set; } = DateTime.UtcNow;

        [Required]
        public Guid UserId { get; set; }
        public User? User { get; set; }

        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    }
}
