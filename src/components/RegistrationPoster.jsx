import './RegistrationPoster.css';

export default function RegistrationPoster({ names, tournamentName, season, total, page, pages, offset }) {
  return <div className="registration-poster">
    <div className="registration-poster-inner">
      <header className="registration-poster-brand"><span>PNH <b>EFOOTBALL</b></span><span>PLAYER REGISTRATION</span></header>
      <div className="registration-poster-heading">
        <p>DANH SÁCH ĐĂNG KÝ</p>
        <h2>{tournamentName}</h2>
        <div className="registration-poster-meta"><span>{total} NGƯỜI ĐĂNG KÝ</span>{season && <span>MÙA {season}</span>}</div>
      </div>
      <div className="registration-poster-roster">
        {names.map((name, index) => <div className="registration-poster-player" key={offset + index}>
          <span>{String(offset + index + 1).padStart(2, '0')}</span><strong>{name || 'Người đăng ký'}</strong>
        </div>)}
      </div>
      <footer className="registration-poster-footer"><span>PNH EFOOTBALL <b>·</b> CÙNG NHAU TRANH TÀI</span><span>TRANG {page} / {pages}</span></footer>
    </div>
  </div>;
}
