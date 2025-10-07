using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManager.Api.Dtos.Projects;
using ProjectManager.Api.Infrastructure;
using ProjectManager.Api.Services.Interfaces;

namespace ProjectManager.Api.Controllers
{
    [ApiController]
    [Route("api/projects")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _svc;

        public ProjectsController(IProjectService svc) => _svc = svc;

        // GET /api/projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectResponse>>> List()
        {
            var userId = User.CurrentUserId();
            if (userId is null) return Unauthorized();

            var items = await _svc.ListAsync(userId.Value);
            return Ok(items);
        }

        // POST /api/projects
        [HttpPost]
        public async Task<ActionResult<ProjectResponse>> Create([FromBody] CreateProjectRequest req)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var userId = User.CurrentUserId();
            if (userId is null) return Unauthorized();

            var created = await _svc.CreateAsync(userId.Value, req);
            // return 201 with Location header to GET /api/projects/{id}
            return CreatedAtAction(nameof(GetById), new { id = created!.Id }, created);
        }

        // GET /api/projects/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ProjectResponse>> GetById([FromRoute] Guid id)
        {
            var userId = User.CurrentUserId();
            if (userId is null) return Unauthorized();

            var item = await _svc.GetAsync(userId.Value, id);
            if (item is null) return NotFound();
            return Ok(item);
        }

        // DELETE /api/projects/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            var userId = User.CurrentUserId();
            if (userId is null) return Unauthorized();

            var ok = await _svc.DeleteAsync(userId.Value, id);
            return ok ? NoContent() : NotFound();
        }
    }
}
