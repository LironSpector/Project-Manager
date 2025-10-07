using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManager.Api.Dtos.Tasks;
using ProjectManager.Api.Infrastructure;
using ProjectManager.Api.Services.Interfaces;

namespace ProjectManager.Api.Controllers
{
    [ApiController]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ITaskService _svc;

        public TasksController(ITaskService svc) => _svc = svc;


        // GET /api/projects/{projectId}/tasks
        [HttpGet("api/projects/{projectId:guid}/tasks")]
        public async Task<ActionResult<IEnumerable<TaskResponse>>> List([FromRoute] Guid projectId)
        {
            var userId = User.CurrentUserId();
            if (userId is null) return Unauthorized();

            var list = await _svc.ListByProjectAsync(userId.Value, projectId);
            if (list is null) return NotFound(); // project not found or not owned

            return Ok(list);
        }

        // POST /api/projects/{projectId}/tasks
        [HttpPost("api/projects/{projectId:guid}/tasks")]
        public async Task<ActionResult<TaskResponse>> Create([FromRoute] Guid projectId, [FromBody] CreateTaskRequest req)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var userId = User.CurrentUserId();
            if (userId is null) return Unauthorized();

            var created = await _svc.CreateAsync(userId.Value, projectId, req);
            if (created is null) return NotFound(); // project not found or not owned by user

            // Created at "resource" style URL (I have PUT/DELETE by taskId)
            return Created($"/api/tasks/{created.Id}", created);
        }

        // PUT /api/tasks/{taskId}
        [HttpPut("api/tasks/{taskId:guid}")]
        public async Task<ActionResult<TaskResponse>> Update([FromRoute] Guid taskId, [FromBody] UpdateTaskRequest req)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var userId = User.CurrentUserId();
            if (userId is null) return Unauthorized();

            var updated = await _svc.UpdateAsync(userId.Value, taskId, req);
            if (updated is null) return NotFound(); // not found or not owned

            return Ok(updated);
        }

        // DELETE /api/tasks/{taskId}
        [HttpDelete("api/tasks/{taskId:guid}")]
        public async Task<IActionResult> Delete([FromRoute] Guid taskId)
        {
            var userId = User.CurrentUserId();
            if (userId is null) return Unauthorized();

            var ok = await _svc.DeleteAsync(userId.Value, taskId);
            return ok ? NoContent() : NotFound();
        }
    }
}
