using ProjectManager.Api.Dtos.Auth;

namespace ProjectManager.Api.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse?> RegisterAsync(string email, string password, string? ip = null, string? device = null);
        Task<AuthResponse?> LoginAsync(string email, string password, string? ip = null, string? device = null);
        Task<AuthResponse?> RefreshAsync(string refreshToken, string? ip = null, string? device = null);
        Task LogoutAsync(string refreshToken);
        Task LogoutAllAsync(Guid userId);
    }
}
