import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return;
        const ctx = canvas.getContext('2d')
        if (!ctx) return;
        let animId: number
        let logos: any[] = []
        const COUNT = 20

        function resize() {
            if (!canvas) return;
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        function init() {
            if (!canvas) return;
            logos = []
            for (let i = 0; i < COUNT; i++) {
                logos.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: 40 + Math.random() * 80,
                    alpha: 0.18 + Math.random() * 0.28,
                    rotation: (Math.random() - 0.5) * 0.4,
                    vx: (Math.random() - 0.5) * 0.18,
                    vy: -0.12 - Math.random() * 0.22,
                    vr: (Math.random() - 0.5) * 0.0008,
                    pulseSpeed: 0.008 + Math.random() * 0.006,
                    pulseOffset: Math.random() * Math.PI * 2,
                })
            }
        }

        function drawAlgoLogo(x: number, y: number, size: number, alpha: number, rotation: number, isDark: boolean) {
            if (!ctx) return;
            ctx.save()
            ctx.translate(x, y)
            ctx.rotate(rotation)
            ctx.globalAlpha = alpha
            // Color shifts based on light/dark mode
            ctx.strokeStyle = isDark ? 'rgba(180,220,255,0.75)' : 'rgba(20,20,20,0.35)'
            ctx.fillStyle = isDark ? 'rgba(180,220,255,0.75)' : 'rgba(20,20,20,0.35)'
            ctx.lineWidth = size * 0.16
            ctx.lineCap = 'square'
            ctx.lineJoin = 'miter'

            const s = size
            ctx.beginPath()
            ctx.moveTo(-s * 0.38, s * 0.42)
            ctx.lineTo(s * 0.04, -s * 0.42)
            ctx.lineTo(s * 0.38, s * 0.42)
            ctx.stroke()

            ctx.beginPath()
            ctx.moveTo(s * 0.04, -s * 0.42)
            ctx.lineTo(s * 0.22, s * 0.10)
            ctx.stroke()

            ctx.restore()
        }

        let frame = 0

        function animate() {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || true; // Force dark mode colors for Sentinel theme

            // Radial gradient wash 1
            const g1 = ctx.createRadialGradient(
                canvas.width * 0.25, canvas.height * 0.2, 0,
                canvas.width * 0.25, canvas.height * 0.2, canvas.width * 0.7
            )
            if (isDark) {
                g1.addColorStop(0, 'rgba(40,80,140,0.07)')
                g1.addColorStop(0.5, 'rgba(20,60,120,0.04)')
                g1.addColorStop(1, 'rgba(0,0,0,0)')
            } else {
                g1.addColorStop(0, 'rgba(80,80,80,0.06)')
                g1.addColorStop(0.5, 'rgba(40,40,40,0.03)')
                g1.addColorStop(1, 'rgba(0,0,0,0)')
            }
            ctx.fillStyle = g1
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Radial gradient wash 2
            const g2 = ctx.createRadialGradient(
                canvas.width * 0.78, canvas.height * 0.75, 0,
                canvas.width * 0.78, canvas.height * 0.75, canvas.width * 0.6
            )
            if (isDark) {
                g2.addColorStop(0, 'rgba(0,120,160,0.06)')
                g2.addColorStop(1, 'rgba(0,0,0,0)')
            } else {
                g2.addColorStop(0, 'rgba(30,30,30,0.05)')
                g2.addColorStop(1, 'rgba(0,0,0,0)')
            }
            ctx.fillStyle = g2
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            frame++

            logos.forEach(l => {
                // Mathematical pulse effect
                const pulse = Math.sin(frame * l.pulseSpeed + l.pulseOffset) * 0.10
                drawAlgoLogo(l.x, l.y, l.size, Math.max(0, l.alpha + pulse), l.rotation, isDark)

                // Kinematics and boundary loop wrapping
                l.x += l.vx
                l.y += l.vy
                l.rotation += l.vr
                if (l.y + l.size < 0) { l.y = canvas.height + l.size; l.x = Math.random() * canvas.width }
                if (l.y - l.size > canvas.height) l.y = -l.size
                if (l.x + l.size < 0) l.x = canvas.width + l.size
                if (l.x - l.size > canvas.width) l.x = -l.size
            })

            animId = requestAnimationFrame(animate)
        }

        resize()
        init()
        animate()

        const handleResize = () => { resize(); init() }
        window.addEventListener('resize', handleResize)

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', handleResize)
        }
    }, []) // only mount once; reads theme from DOM each frame

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed', top: 0, left: 0,
                width: '100%', height: '100%',
                pointerEvents: 'none', zIndex: 0,
            }}
        />
    )
}
