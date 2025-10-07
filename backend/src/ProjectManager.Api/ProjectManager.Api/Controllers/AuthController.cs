using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManager.Api.Data;
using ProjectManager.Api.Dtos.Auth;
using ProjectManager.Api.Services.Interfaces;

namespace ProjectManager.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;

        public AuthController(IAuthService auth) => _auth = auth;

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _auth.RegisterAsync(req.Email, req.Password, ip: ip);
            if (result is null) return Conflict("Email already registered.");

            SetRefreshCookieIfPresent(result);
            return Ok(result);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _auth.LoginAsync(req.Email, req.Password, ip: ip);
            if (result is null) return Unauthorized("Invalid credentials.");

            SetRefreshCookieIfPresent(result);
            return Ok(result);
        }

        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> Refresh([FromBody] RefreshRequest? body)
        {
            // Try cookie first, then body for development convenience
            var cookieToken = Request.Cookies.TryGetValue("rt", out var c) ? c : null;
            var token = cookieToken ?? body?.RefreshToken;
            if (string.IsNullOrEmpty(token)) return Unauthorized("Missing refresh token.");

            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _auth.RefreshAsync(token, ip: ip);
            if (result is null) return Unauthorized("Invalid or expired refresh token.");

            SetRefreshCookieIfPresent(result);
            return Ok(result);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] RefreshRequest? body)
        {
            var cookieToken = Request.Cookies.TryGetValue("rt", out var c) ? c : null;
            var token = cookieToken ?? body?.RefreshToken;
            if (!string.IsNullOrEmpty(token))
                await _auth.LogoutAsync(token);

            // Clear cookie
            Response.Cookies.Delete("rt");
            return NoContent();
        }

        [HttpPost("logout-all")]
        [Authorize]
        public async Task<IActionResult> LogoutAll()
        {
            var sub = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (sub is null) return Unauthorized();
            await _auth.LogoutAllAsync(Guid.Parse(sub));
            Response.Cookies.Delete("rt");
            return NoContent();
        }

        private void SetRefreshCookieIfPresent(AuthResponse result)
        {
            // If we included a refresh token in body, also set cookie.
            if (result.RefreshToken is null || result.RefreshTokenExpiresAtUtc is null) return;

            var cookieOpts = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // requires HTTPS to be sent, better security (this means the browser will only send it over HTTPS)
                SameSite = SameSiteMode.None,
                Expires = result.RefreshTokenExpiresAtUtc
            };

            Response.Cookies.Append("rt", result.RefreshToken, cookieOpts);
        }
    }
}
