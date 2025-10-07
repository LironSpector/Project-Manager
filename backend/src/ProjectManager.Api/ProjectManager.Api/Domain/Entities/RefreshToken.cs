using System.ComponentModel.DataAnnotations;

namespace ProjectManager.Api.Domain.Entities
{
    public class RefreshToken
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required] public Guid UserId { get; set; }
        public User? User { get; set; }

        [Required, MaxLength(128)]
        public string TokenHash { get; set; } = string.Empty;

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime ExpiresAtUtc { get; set; }

        public DateTime? RevokedAtUtc { get; set; }
        public Guid? ReplacedByTokenId { get; set; }

        [MaxLength(64)] public string? CreatedByIp { get; set; }
        [MaxLength(128)] public string? Device { get; set; }
    }
}
