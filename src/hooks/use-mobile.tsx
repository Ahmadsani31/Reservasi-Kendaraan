import * as React from "react"

// Increased breakpoint to include tablets (typical iPad is 768-1024px)
const DESKTOP_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${DESKTOP_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < DESKTOP_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < DESKTOP_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
