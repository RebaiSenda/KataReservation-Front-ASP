using Microsoft.AspNetCore.Mvc;

namespace KataReservation_Front
{
    [ApiController]
    [Route("[controller]")]
    public class LogController : ControllerBase
    {
        private readonly ILogger<LogController> _logger;

        public LogController(ILogger<LogController> logger)
        {
            _logger = logger;
        }

        public class LogMessage
        {
            public int LogLevel { get; set; }
            public string Message { get; set; } = string.Empty;
        }

        [HttpPost]
        public IActionResult Post([FromBody] LogMessage log)
        {
            var level = (LogLevel)log.LogLevel;

            switch (level)
            {
                case LogLevel.Critical:
                case LogLevel.Error:
                    _logger.LogError(log.Message);
                    break;
                case LogLevel.Warning:
                    _logger.LogWarning(log.Message);
                    break;
                case LogLevel.Information:
                    _logger.LogInformation(log.Message);
                    break;
                case LogLevel.Debug:
                    _logger.LogDebug(log.Message);
                    break;
                case LogLevel.Trace:
                    _logger.LogTrace(log.Message);
                    break;
                default:
                    _logger.LogInformation("UNKNOWN LEVEL: " + log.Message);
                    break;
            }

            return Ok();
        }
    }

}