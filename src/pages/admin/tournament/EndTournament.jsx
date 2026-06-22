import React from 'react';
const EndTournament = ({ darkMode = true, language = 'vi' }) => (
  <div style={{minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
    <div style={{textAlign:'center'}}>
      <div style={{fontSize:'3rem', marginBottom:'1rem'}}>🚧</div>
      <p style={{fontSize:'1.25rem', fontWeight:'bold', color: darkMode ? 'white' : '#1e293b'}}>EndTournament</p>
      <p style={{color:'#64748b', fontSize:'0.875rem', marginTop:'0.5rem'}}>Coming soon...</p>
    </div>
  </div>
);
export default EndTournament;
