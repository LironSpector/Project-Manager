using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ProjectManager.Api.Auth
{
    public class JwtTokenGenerator
    {
        private readonly JwtOptions _opts;
        private readonly SymmetricSecurityKey _key;

        public JwtTokenGenerator(IOptions<JwtOptions> opts)
        {
            _opts = opts.Value;
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opts.Secret));
        }

        public string Generate(Guid userId, string email, TimeSpan? lifetime = null)
        {
            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);
            var now = DateTime.UtcNow;
            var exp = now.Add(lifetime ?? TimeSpan.FromHours(1));

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email)
            };

            var token = new JwtSecurityToken(
                issuer: _opts.Issuer,
                audience: _opts.Audience,
                claims: claims,
                notBefore: now,
                expires: exp,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
