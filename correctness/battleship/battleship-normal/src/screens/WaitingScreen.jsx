import { useState } from 'react'

export default function WaitingScreen({ message, roomId }) {
  const [copied, setCopied] = useState(false)

  const shareUrl = roomId ? `${window.location.origin}?room=${roomId}` : null

  function copyUrl() {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fullscreen-center">
      <div className="waiting-card">
        <div className="sonar-ring" />
        {message ? (
          <h2>{message}</h2>
        ) : roomId ? (
          <>
            <h2>Room <span className="room-code">{roomId}</span></h2>
            <p className="waiting-sub">Share this link with your opponent:</p>
            <div className="share-row">
              <span className="share-url">{shareUrl}</span>
              <button className="copy-btn" onClick={copyUrl}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="waiting-dots">Waiting for opponent to join</p>
          </>
        ) : (
          <h2>Waiting for opponent…</h2>
        )}
      </div>
    </div>
  )
}
