using ESI.NET;
using ESI.NET.Enumerations;
using ESI.NET.Models.SSO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Net;

namespace Back_end.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ESIController : ControllerBase
    {
        private readonly IEsiClient _client;
        public ESIController(IEsiClient client) {

            _client = client;
        }

        [HttpGet("createAuthenticationUrl")]
        public IActionResult CreateAuthenticationUrl(string challengeCode)
        {
            var scopes = new List<string>();
            var url = _client.SSO.CreateAuthenticationUrl(scopes, "authentication", challengeCode);

            return Ok(new { url = url });
        }

        [HttpGet("createTokenAndGetData")]
        public async Task<IActionResult> CreateAuthenticationToken(string code, string state, string challengeCode)
        {
            if (state.Equals("authentication"))
            {
                SsoToken token = await _client.SSO.GetToken(GrantType.AuthorizationCode, code, challengeCode);
                AuthorizedCharacterData authorizedCharacterData = await _client.SSO.Verify(token);
                return Ok(authorizedCharacterData);
            }

            return BadRequest("Incorrect state");
        }
    }
}
