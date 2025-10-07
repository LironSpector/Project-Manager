namespace ProjectManager.Api.Auth
{
    public class JwtOptions
    {
        public string Issuer { get; set; } = "";
        public string Audience { get; set; } = "";
        public string Secret { get; set; } = "";

        public int AccessTokenMinutes { get; set; } = 30;
        public int RefreshTokenDays { get; set; } = 7;

        public bool AllowBodyRefreshTokenInDev { get; set; } = true;
    }
}
