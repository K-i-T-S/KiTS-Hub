declare global {
  interface Window {
    botpressWebChat: {
      sendEvent: (event: { type: string }) => void
    }
  }
}

export {}
