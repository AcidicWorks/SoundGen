class AudioTone {
    static A440 = 440.0
    static SEMITONE = Math.pow(2, 1/12)

    constructor() {
        this._audioContext = new AudioContext()
        this.controller = new AbortController()
    }

    get audioContext() { return this._audioContext }

    semitoneStep(tonicIndex, n, octave) {
        const octaveFactor = Math.pow(2, Number(octave) - 4)
        const tonicFreq = AudioTone.A440 * octaveFactor * Math.pow(AudioTone.SEMITONE, tonicIndex)
        return tonicFreq * Math.pow(AudioTone.SEMITONE, n)
    }   

    play(freq, interval, waveType, options) {
        options = options ? options : {}

        return new Promise((resolve, reject) => {
            const source = this.oscillatorNode(freq, interval, waveType);
            source.onended = () => resolve('tone ended')
            this.controller.signal.addEventListener('abort', () => {
                source.stop(this.audioContext.currentTime)
                reject(new Error('tone aborted'))
            })

            const shaper = this.waveShaperNode(options.shaper)
            const gain = this.gainNode(interval/4)
            const output = source.connect(shaper).connect(gain)

            output.connect(this.audioContext.destination)
            if (options.analyser)
                output.connect(options.analyser)
        });
    }

    stop() {
        if (this.controller)
            this.controller.abort()            
        this.controller = new AbortController()
    }

    oscillatorNode(freq, interval, waveForm) {
        const oscillator = this.audioContext.createOscillator()
        oscillator.type = waveForm
        oscillator.frequency.value = freq
        oscillator.start(this.audioContext.currentTime)
        if (interval > 0)
            oscillator.stop(this.audioContext.currentTime + interval)
        return oscillator;
    }

    waveShaperNode(curve) {
        const shaper = this.audioContext.createWaveShaper()
        shaper.oversample = '4x' 
        shaper.curve = curve           
        return shaper
    }   
    
    gainNode(interval) {
        const gain = this.audioContext.createGain()
        if (interval > 0)
            gain.gain.setTargetAtTime(0, this.audioContext.currentTime, interval)
        return gain
    }

    static bitCrusher(n_bits) {
        n_bits = AudioTone.clamp(n_bits, 1, 16)
        const n_levels = Math.pow(2, n_bits)
        const n_samples = Math.pow(2, 16)
        const curve = new Float32Array(n_samples)
        for (let i = 0; i < n_samples; i++) {
            const x = i*n_levels/n_samples
            curve[i] = (2*Math.floor(x) + 1)/n_levels - 1
        }
        return curve;
    }

    static saturation(height, attack) {
        height = AudioTone.clamp(height, -1, 1)
        attack = AudioTone.clamp(attack, 0, 1)
        const n_samples = 44100
        const curve = new Float32Array(n_samples)
        for (let i = 0; i < n_samples; i++) {
            const x = 2*i/n_samples - 1
            curve[i] = height*Math.tanh(attack*100*x)
        }
        return curve;
    }

    static clamp(x, min, max) {
        return Math.max(Math.min(x, max), min);
      }    
}