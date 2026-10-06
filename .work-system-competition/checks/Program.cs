using Appwebbongda.Controllers;
using Appwebbongda.Models;
using Appwebbongda.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

void Check(bool condition, string label) { if (!condition) throw new Exception(label); Console.WriteLine("PASS: " + label); }
TournamentsController Controller(string role) {
    var controller = new TournamentsController(null!, null!, null!, null!);
    controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Role, role) }, "test")) } };
    return controller;
}
var dto = new TournamentsController.TournamentDto { Name = "Test", SystemCompetition = "Premier League" };
Check((await Controller("User").Create(dto) as ObjectResult)?.StatusCode == 403, "User cannot assign a system competition on create");
Check((await Controller("BTC").Update(1, dto) as ObjectResult)?.StatusCode == 403, "Organizer cannot change system competition");
dto.SystemCompetition = "Not a system competition";
Check((await Controller("Admin").Create(dto) as ObjectResult)?.StatusCode == 400, "Admin cannot submit unknown competition");
Check(SystemCompetitions.Names.Length == 13 && SystemCompetitions.IsValid("Premier League"), "13 supported competition names");
Check(SystemCompetitions.IsCompleted("Hoàn thành") && SystemCompetitions.IsCompleted("finished") && !SystemCompetitions.IsCompleted("Đang diễn ra"), "Completion status recognition");
var service = new ChampionHonorSyncService(null!);
await service.StageAsync(new Tournament { Status = "Đang diễn ra", SystemCompetition = "Premier League" });
await service.StageAsync(new Tournament { Status = "Hoàn thành" });
Console.WriteLine("PASS: No honours sync for ongoing or unassigned tournaments");
var visible = SystemCompetitions.RankedHonor.Compile();
var mappedTournament = new Tournament { SystemCompetition = "Premier League" };
var honor = new ChampionHonor { CompetitionName = "Premier League", Tournament = mappedTournament };
Check(visible(honor), "Assigned tournament is included");
mappedTournament.SystemCompetition = null;
Check(!visible(honor), "Unassigning immediately excludes old honours");
mappedTournament.SystemCompetition = "";
Check(!visible(honor), "Empty assignment is excluded");
mappedTournament.SystemCompetition = "Unknown";
Check(!visible(honor), "Unknown assignment is excluded");
honor.Tournament = null;
Check(!visible(honor), "Unlinked legacy record is excluded");
mappedTournament.SystemCompetition = "LaLiga";
honor.Tournament = mappedTournament;
Check(!visible(honor), "Old category is excluded after reassignment");
honor.CompetitionName = "LaLiga";
Check(visible(honor), "Synced reassignment appears in correct category");
