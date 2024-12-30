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

        //[HttpGet("authenticate")]
        //public IActionResult Authenticate()
        //{
        //    //Needs to be at least 32 characters long
        //    var challengeCode = "angelicaTakanawaUpwellApplication";

        //    var scopes = new List<string>();

        //    var url = _client.SSO.CreateAuthenticationUrl(scopes, "authentication", challengeCode);
        //    return Redirect(url);

        //}

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

        //[HttpGet("callback")]
        //public async Task<IActionResult> Callback([FromQuery] string code, [FromQuery] string state)
        //{

        //    if (!state.Equals("authentication")) 
        //    {
        //        return BadRequest("Incorrect authcode...");
        //    }

        //    SsoToken token = await _client.SSO.GetToken(GrantType.AuthorizationCode, code, "angelicaTakanawaUpwellApplication");

        //    AuthorizedCharacterData authorizedCharacterData = await _client.SSO.Verify(token);

        //    _client.SetCharacterData(authorizedCharacterData);

        //    return Ok(authorizedCharacterData);
        //}
    }
}
