namespace ProjectManager.Api.Dtos.Auth
{
    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty; // access token (JWT)
        public DateTime ExpiresAtUtc { get; set; } // AT expiry
        public string Email { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;

        // For development: to test over HTTP, include refresh token in body
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiresAtUtc { get; set; }
    }
}
