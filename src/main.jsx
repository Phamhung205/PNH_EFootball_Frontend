import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

// ErrorBoundary: chan moi loi JS -> thay vi trang TRANG TRON, hien thong bao + nut tai lai.
// Gop thang vao day de KHONG can tao file rieng (tranh loi import tren Vercel).
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Da bat loi:', error, info)
  }
  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }
  handleHome = () => {
    window.location.href = '/'
  }
  render() {
    if (!this.state.hasError) return this.props.children

    const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV
    const err = this.state.error
    const detail = err ? (err.stack || err.message || String(err)) : ''

    const wrap = {
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0d1426', color: '#e8edf5', padding: '24px', fontFamily: 'system-ui, sans-serif',
    }
    const card = {
      maxWidth: '520px', width: '100%', background: '#131c33', border: '1px solid #243350',
      borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,.4)',
    }
    const btn = {
      padding: '12px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
      fontWeight: 700, fontSize: '14px', margin: '6px',
    }

    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚽</div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px' }}>Đã có lỗi xảy ra</h1>
          <p style={{ fontSize: '14px', color: '#8ea0bf', margin: '0 0 24px', lineHeight: 1.6 }}>
            Trang gặp sự cố ngoài ý muốn. Bạn thử tải lại trang, nếu vẫn lỗi hãy quay về trang chủ.
          </p>
          <div>
            <button style={{ ...btn, background: '#38bdf8', color: '#0b1020' }} onClick={this.handleReload}>
              ↻ Tải lại trang
            </button>
            <button style={{ ...btn, background: 'transparent', color: '#e8edf5', border: '1px solid #243350' }} onClick={this.handleHome}>
              🏠 Về trang chủ
            </button>
          </div>
          {isDev && detail && (
            <pre style={{
              textAlign: 'left', marginTop: '24px', padding: '14px', background: '#0b1020',
              border: '1px solid #243350', borderRadius: '10px', color: '#ff9b9b',
              fontSize: '12px', overflow: 'auto', maxHeight: '240px', whiteSpace: 'pre-wrap',
            }}>
              {detail}
            </pre>
          )}
        </div>
      </div>
    )
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)