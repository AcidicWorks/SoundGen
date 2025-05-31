class AudioGraph {
    constructor(graphCanvas, audioContext, options) {
        options = options ? options : {};
        this.backgroundColor = options.backgroundColor ? options.backgroundColor : 'rgb(200, 200, 200)'
        this.foregroundColor = options.foregroundColor ? options.foregroundColor : 'rgb(0, 0, 0)'
        this.canvas = graphCanvas
        this.canvasContext = this.canvas.getContext('2d')
        this.analyser = audioContext.createAnalyser()
        this.analyser.fftSize = 2048
        this.bufferLength = this.analyser.frequencyBinCount
        this.dataArray = new Uint8Array(this.bufferLength)
        this.analyser.getByteTimeDomainData(this.dataArray)
        this.draw()
    }

    draw() {
        requestAnimationFrame(() => { this.draw() })

        this.canvasContext.fillStyle = this.backgroundColor
        this.canvasContext.strokeStyle = this.foregroundColor
        this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.canvasContext.lineWidth = 8
        this.canvasContext.beginPath()

        this.analyser.getByteTimeDomainData(this.dataArray)
        const sliceWidth = (this.canvas.width * 1.0) / this.bufferLength

        for (let i = 0; i < this.bufferLength; i++) {
            const x = i * sliceWidth
            const v = this.dataArray[i] / 128.0
            const y = (v * this.canvas.height) / 2 

            if (i === 0) 
                this.canvasContext.moveTo(x, y)
            else 
                this.canvasContext.lineTo(x, y)
        }

        this.canvasContext.lineTo(this.canvas.width, this.canvas.height / 2)
        this.canvasContext.stroke()
    }
}