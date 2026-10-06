import fs from 'node:fs';
import path from 'node:path';
const root = 'E:/WEB PNH EFOOTBALL/PHH EFOOTBALL BACKEND/PHH EFOOTBALL BACKEND';
const stage = '.work-system-competition/backend';
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const write = (file, content) => { const target = path.join(stage, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, content); };
const replace = (source, before, after) => { if (!source.includes(before)) throw new Error(`Missing: ${before}`); return source.replace(before, after); };
let model = read('Models/Tournament.cs');
model = replace(model, 'public string? Season { get; set; }', 'public string? Season { get; set; }\n        [MaxLength(100)]\n        public string? SystemCompetition { get; set; }');
write('Models/Tournament.cs', model);

const names = ['Premier League','LaLiga','Bundesliga','Champions League','Europa League','World Cup','Serie A','Ligue 1','Eredivisie','Primeira Liga','SPL','Belgian Pro League','Conference League'];
write('Services/SystemCompetitions.cs', `namespace Appwebbongda.Services;
public static class SystemCompetitions
{
    public static readonly string[] Names = { ${names.map(n => JSON.stringify(n)).join(', ')} };
    public static bool IsValid(string? name) => name != null && Names.Contains(name, StringComparer.Ordinal);
    public static bool IsCompleted(string? status) => new[] { "Hoàn thành", "Đã kết thúc", "Completed", "Finished", "done" }.Contains(status?.Trim(), StringComparer.OrdinalIgnoreCase);
}
`);

let honors = read('Controllers/ChampionHonorsController.cs');
const helpersStart = honors.indexOf('\t\tprivate static bool IsFinished(');
const helpersEnd = honors.indexOf('\t\t//', honors.indexOf('\n\t\t}', honors.indexOf('\t\tprivate static int? Winner(')));
const helpers = honors.slice(helpersStart, helpersEnd);
const resolverStart = honors.indexOf('\t\tprivate async Task<');
const resolver = honors.slice(resolverStart, honors.lastIndexOf('\n\t}'));
const syncStart = honors.indexOf('\t\t\tvar placements =', honors.indexOf('public async Task<IActionResult> SyncTournament'));
const teamsStart = honors.indexOf('\t\t\tvar teams =', syncStart);
const saveStart = honors.indexOf('\n\t\t\tawait _context\n\t\t\t\t.SaveChangesAsync();', teamsStart);
let syncBody = honors.slice(teamsStart, saveStart);
syncBody = replace(syncBody, 'tournament.Name;', 'tournament.SystemCompetition!;');
syncBody = replace(syncBody, 'item.EndDate =\n\t\t\t\t\tDateTime.UtcNow;', 'item.EndDate = item.EndDate == default ? DateTime.UtcNow : item.EndDate;');
write('Services/ChampionHonorSyncService.cs', `using Appwebbongda.Data;
using Appwebbongda.Models;
using Microsoft.EntityFrameworkCore;
namespace Appwebbongda.Services;
public class ChampionHonorSyncService(AppDbContext context)
{
    private readonly AppDbContext _context = context;
    private const int KNOCKOUT_BASE = 100;
    // Stage honours in the same SaveChanges transaction as the tournament status.
    public async Task StageAsync(Tournament tournament)
    {
        if (!SystemCompetitions.IsCompleted(tournament.Status) || string.IsNullOrWhiteSpace(tournament.SystemCompetition)) return;
        if (!SystemCompetitions.IsValid(tournament.SystemCompetition)) throw new InvalidOperationException("Giải hệ thống không hợp lệ.");
        var tournamentId = tournament.TournamentId;
        var placements = await ResolvePlacements(tournamentId);
        if (placements.Count == 0) throw new InvalidOperationException("Chưa đủ kết quả để xác định nhà vô địch. Vui lòng hoàn tất các trận đấu trước khi kết thúc giải.");
${syncBody}
    }
${helpers}
${resolver}
}
`);
// Remove duplicated placement helpers from the API controller.
honors = honors.slice(0, resolverStart) + '\t}\n}\n';
honors = honors.slice(0, helpersStart) + honors.slice(helpersEnd);
const coreStart = honors.indexOf('\t\t\tif (\n\t\t\t\t!string.Equals(', honors.indexOf('public async Task<IActionResult> SyncTournament'));
const coreEnd = honors.indexOf('\n\t\tprivate static string? Validate(', coreStart);
honors = honors.slice(0, coreStart) + `            if (!SystemCompetitions.IsCompleted(tournament.Status))
                return BadRequest(new { success = false, message = "Chỉ đồng bộ khi giải đã kết thúc." });
            if (string.IsNullOrWhiteSpace(tournament.SystemCompetition))
                return BadRequest(new { success = false, message = "Giải chưa được gán vào giải hệ thống." });
            try
            {
                await new ChampionHonorSyncService(_context).StageAsync(tournament);
                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Đã cập nhật BXH giải hệ thống." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
` + honors.slice(coreEnd);
honors = 'using Appwebbongda.Services;\n' + honors;
honors = honors.replace('\t\tprivate const int KNOCKOUT_BASE = 100;\n', '');
write('Controllers/ChampionHonorsController.cs', honors);

let controller = read('Controllers/TournamentsController.cs');
controller = replace(controller, 'public string? Season { get; set; }', 'public string? Season { get; set; }\n            public string? SystemCompetition { get; set; }');
controller = replace(controller, 'x.t.Season,', 'x.t.Season,\n                        x.t.SystemCompetition,');
const guard = `
            if (dto.SystemCompetition != null && !IsAdmin())
                return StatusCode(403, new { success = false, message = "Chỉ ADMIN được chọn giải hệ thống." });
            if (!string.IsNullOrEmpty(dto.SystemCompetition) && !SystemCompetitions.IsValid(dto.SystemCompetition))
                return BadRequest(new { success = false, message = "Giải hệ thống không hợp lệ." });
`;
controller = replace(controller, 'public async Task<IActionResult> Create([FromBody] TournamentDto dto)\n        {', 'public async Task<IActionResult> Create([FromBody] TournamentDto dto)\n        {' + guard);
controller = replace(controller, 'Season = dto.Season,', 'Season = dto.Season,\n                SystemCompetition = string.IsNullOrEmpty(dto.SystemCompetition) ? null : dto.SystemCompetition,');
controller = replace(controller, 'public async Task<IActionResult> Update(int id, [FromBody] TournamentDto dto)\n        {', 'public async Task<IActionResult> Update(int id, [FromBody] TournamentDto dto)\n        {' + guard);
controller = replace(controller, 'if (dto.Season != null) tournament.Season = dto.Season;', 'if (dto.Season != null) tournament.Season = dto.Season;\n            if (dto.SystemCompetition != null) tournament.SystemCompetition = dto.SystemCompetition.Length == 0 ? null : dto.SystemCompetition;');
controller = replace(controller, '            await _context.SaveChangesAsync();\n            return Ok(new { success = true, message = "Cập nhật giải đấu thành công!", data = tournament });', `            try { await new ChampionHonorSyncService(_context).StageAsync(tournament); }
            catch (InvalidOperationException ex) { return BadRequest(new { success = false, message = ex.Message }); }
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Cập nhật giải đấu thành công!", data = tournament });`);
controller = replace(controller, 'tournament.Status = dto.Status;\n                await _context.SaveChangesAsync();', `tournament.Status = dto.Status;
                try { await new ChampionHonorSyncService(_context).StageAsync(tournament); }
                catch (InvalidOperationException ex) { return BadRequest(new { success = false, message = ex.Message }); }
                await _context.SaveChangesAsync();`);
write('Controllers/TournamentsController.cs', controller);
let program = read('Program.cs');
program = replace(program, 'var syncColumns =\n            new[]\n            {', `var syncColumns =
            new[]
            {
                @"IF COL_LENGTH('dbo.Tournaments','SystemCompetition') IS NULL
                ALTER TABLE dbo.Tournaments ADD SystemCompetition NVARCHAR(100) NULL;",
`);
write('Program.cs', program);
console.log('Prepared backend changes in ' + stage);
