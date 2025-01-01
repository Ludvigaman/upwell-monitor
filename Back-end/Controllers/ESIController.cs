using Back_end.Services;
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
        private readonly ESIService _esiService;
        private readonly List<string> _whitelist;
        private readonly bool _whitelistEnabled;


        public ESIController(IEsiClient client, IConfiguration configuration) {

            _esiService = new ESIService(client);
            _client = client;
            _whitelist = configuration.GetSection("Whitelist").Get<List<string>>();
            _whitelistEnabled = configuration.GetSection("WhitelistEnabled").Get<bool>();
        }

        [HttpGet("createAuthenticationUrl")]
        public IActionResult CreateAuthenticationUrl(string challengeCode)
        {
            var scopes = new List<string>
            {
                "esi-assets.read_corporation_assets.v1",
                "esi-corporations.read_structures.v1"
            };

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

        [HttpGet("refreshTokenAndGetData")]
        public async Task<IActionResult> RefreshAuthenticationToken(string refreshToken)
        {
            SsoToken token = await _client.SSO.GetToken(GrantType.RefreshToken, refreshToken);

            AuthorizedCharacterData authorizedCharacterData = await _client.SSO.Verify(token);

            return Ok(authorizedCharacterData);
        }

        [HttpGet("fetchWhitelist")]
        public async Task<IActionResult> FetchWhitelist()
        {
            if (_whitelistEnabled)
            {
                return Ok(_whitelist);
            } else
            {
                return Ok(false);
            }
        }

        [HttpPost("getStructureList")]
        public async Task<IActionResult> GetStructureList([FromBody] AuthorizedCharacterData validationData)
        {
            if(_whitelistEnabled){
                 if (_whitelist.Contains(validationData.CorporationID.ToString())
                     || _whitelist.Contains(validationData.AllianceID.ToString())){
                    _client.SetCharacterData(validationData);
                    var structureList = await _esiService.GetStructureIdList();
    
                    return Ok(structureList);
                } else
                {
                    return BadRequest("Your corporation isn't on the whitelist...");
                }   
            } else {
                _client.SetCharacterData(validationData);
                var structureList = await _esiService.GetStructureIdList();

                return Ok(structureList);
            }
        }
    }
}
