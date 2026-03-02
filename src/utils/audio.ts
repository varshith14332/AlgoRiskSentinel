// Audio alert using Web Audio API (no external files needed)
export function playAlertSound() {
    try {
        const ctx = new window.AudioContext();
        // Create an alarm-like tone
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
        oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.15); // E5
        oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.3); // A5

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
    } catch {
        // Audio not available
    }
}
