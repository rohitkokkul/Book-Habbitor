export class ReadingTracker {
    private startTime: number | null = null;
    private totalDurationMs: number = 0;

    /**
     * Starts or resumes the current reading session timer.
     */
    start(): void {
        if (!this.startTime) {
            this.startTime = Date.now();
        }
    }

    /**
     * Pauses the timer and accumulates the elapsed time.
     */
    pause(): void {
        if (this.startTime) {
            this.totalDurationMs += Date.now() - this.startTime;
            this.startTime = null; // Prevent double accumulation
        }
    }

    /**
     * Resumes the reading session (alias for start).
     */
    resume(): void {
        this.start();
    }

    /**
     * Stops the tracker permanently for this instance and returns the total time read in seconds.
     */
    stopAndGetSeconds(): number {
        this.pause(); // Accrue the final slice of time
        const durationSeconds = Math.floor(this.totalDurationMs / 1000);
        this.totalDurationMs = 0; // Reset conceptually, returning final value
        return durationSeconds;
    }
}
