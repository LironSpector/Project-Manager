using System.Security.Cryptography;
using System.Text;

namespace ProjectManager.Api.Infrastructure
{
    public static class Crypto
    {
        public static string Sha256Base64Url(string input)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
            // Construct a Base64Url (instead of reguar Base64, so no padding, -_, not +/, no =)
            var b64 = Convert.ToBase64String(bytes)
                .TrimEnd('=').Replace('+', '-').Replace('/', '_');
            // This converts a regular Base64 string (which uses +, /, and possibly = padding) into a Base64URL-encoded string (more URL safe, since it avoids characters that have special meaning)
            return b64;
        }

        public static string NewOpaqueToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(64);
            return Convert.ToBase64String(bytes)
                .TrimEnd('=').Replace('+', '-').Replace('/', '_'); // base64url
        }
    }
}
