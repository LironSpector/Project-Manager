using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ProjectManager.Api.Auth;
using ProjectManager.Api.Data;
using ProjectManager.Api.Domain.Entities;
using ProjectManager.Api.Dtos.Auth;
using ProjectManager.Api.Infrastructure;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ProjectManager.Api.Services
{
    public class AuthService : Interfaces.IAuthService
    {
        private readonly AppDbContext _db;
        private readonly JwtOptions _opts;
        private readonly JwtTokenGenerator _tokens;

        public AuthService(AppDbContext db, IOptions<JwtOptions> opts, JwtTokenGenerator tokens)
        {
            _db = db;
            _opts = opts.Value;
            _tokens = tokens;
        }

        public async Task<AuthResponse?> RegisterAsync(string email, string password, string? ip = null, string? device = null)
        {
            var exists = await _db.Users.AnyAsync(u => u.Email == email);
            if (exists) return null;

            var salt = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(16));
            var hash = HashPassword(password, salt);

            var user = new User { Email = email, PasswordHash = hash, PasswordSalt = salt };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return await IssueTokensAsync(user, ip, device);
        }

        public async Task<AuthResponse?> LoginAsync(string email, string password, string? ip = null, string? device = null)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user is null) return null;
            if (!VerifyPassword(password, user.PasswordSalt, user.PasswordHash)) return null;

            return await IssueTokensAsync(user, ip, device);
        }

        public async Task<AuthResponse?> RefreshAsync(string refreshToken, string? ip = null, string? device = null)
        {
            var hash = Crypto.Sha256Base64Url(refreshToken);
            var record = await _db.RefreshTokens
                .FirstOrDefaultAsync(r => r.TokenHash == hash);

            if (record is null) return null; // invalid
            if (record.RevokedAtUtc is not null) return null; // reused or revoked
            if (record.ExpiresAtUtc < DateTime.UtcNow)
            {
                _db.RefreshTokens.Remove(record);
                await _db.SaveChangesAsync();
                return null;
            }

            var user = await _db.Users.FindAsync(record.UserId);
            if (user is null) return null;

            // rotate
            record.RevokedAtUtc = DateTime.UtcNow;
            var (newToken, newRec) = NewRefresh(user.Id, ip, device);
            record.ReplacedByTokenId = newRec.Id;
            _db.RefreshTokens.Add(newRec);

            // access token
            var (access, exp) = IssueAccess(user);

            await _db.SaveChangesAsync();

            return new AuthResponse
            {
                Token = access,
                ExpiresAtUtc = exp,
                Email = user.Email,
                UserId = user.Id.ToString(),
                // for my development convenience: return also the refresh token in the body
                RefreshToken = _opts.AllowBodyRefreshTokenInDev ? newToken : null,
                RefreshTokenExpiresAtUtc = _opts.AllowBodyRefreshTokenInDev ? newRec.ExpiresAtUtc : null
            };
        }

        public async Task LogoutAsync(string refreshToken)
        {
            var hash = Crypto.Sha256Base64Url(refreshToken);
            var rec = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.TokenHash == hash);
            if (rec is null) return;
            rec.RevokedAtUtc = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        public async Task LogoutAllAsync(Guid userId)
        {
            var rows = await _db.RefreshTokens.Where(r => r.UserId == userId && r.RevokedAtUtc == null).ToListAsync();
            foreach (var r in rows) r.RevokedAtUtc = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        // ---- helpers ----
        private (string token, DateTime expiry) IssueAccess(User user)
        {
            var lifetime = TimeSpan.FromMinutes(_opts.AccessTokenMinutes);
            var token = _tokens.Generate(user.Id, user.Email, lifetime);

            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);
            var exp = jwt.ValidTo; // UTC
            return (token, exp);
        }

        private (string token, RefreshToken rec) NewRefresh(Guid userId, string? ip, string? device)
        {
            var token = Crypto.NewOpaqueToken();
            var rec = new RefreshToken
            {
                UserId = userId,
                TokenHash = Crypto.Sha256Base64Url(token),
                CreatedAtUtc = DateTime.UtcNow,
                ExpiresAtUtc = DateTime.UtcNow.AddDays(_opts.RefreshTokenDays),
                CreatedByIp = ip,
                Device = device
            };
            return (token, rec);
        }

        private async Task<AuthResponse> IssueTokensAsync(User user, string? ip, string? device)
        {
            var (access, exp) = IssueAccess(user);
            var (refresh, rec) = NewRefresh(user.Id, ip, device);
            _db.RefreshTokens.Add(rec);
            await _db.SaveChangesAsync();

            return new AuthResponse
            {
                Token = access,
                ExpiresAtUtc = exp,
                Email = user.Email,
                UserId = user.Id.ToString(),
                RefreshToken = _opts.AllowBodyRefreshTokenInDev ? refresh : null,
                RefreshTokenExpiresAtUtc = _opts.AllowBodyRefreshTokenInDev ? rec.ExpiresAtUtc : null
            };
        }

        private static string HashPassword(string password, string base64Salt)
        {
            var saltBytes = Convert.FromBase64String(base64Salt);
            var key = System.Security.Cryptography.Rfc2898DeriveBytes.Pbkdf2(
                password, saltBytes, 100_000,
                System.Security.Cryptography.HashAlgorithmName.SHA256, 32);
            return Convert.ToBase64String(key);
        }
        private static bool VerifyPassword(string password, string base64Salt, string expectedBase64Hash)
        {
            var hash = HashPassword(password, base64Salt);
            return System.Security.Cryptography.CryptographicOperations.FixedTimeEquals(
                Convert.FromBase64String(hash),
                Convert.FromBase64String(expectedBase64Hash));
        }
    }
}
