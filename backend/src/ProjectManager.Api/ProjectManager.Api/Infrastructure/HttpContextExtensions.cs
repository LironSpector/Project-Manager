using System.Security.Claims;

namespace ProjectManager.Api.Infrastructure
{
    public static class HttpContextExtensions
    {
        public static Guid? CurrentUserId(this ClaimsPrincipal user)
        {
            var sub = user.FindFirstValue("sub")
                      ?? user.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(sub, out var id) ? id : null;
        }
    }
}
