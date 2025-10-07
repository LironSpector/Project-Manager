using System.ComponentModel.DataAnnotations;

namespace ProjectManager.Api.Dtos.Auth
{
    public class RegisterRequest
    {
        [Required, EmailAddress, MaxLength(254)]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(6), MaxLength(128)]
        public string Password { get; set; } = string.Empty;
    }
}
