// pitch-shifter-processor.js

class PitchShifterProcessor extends AudioWorkletProcessor {
    // Define the parameters for our custom node.
    // 'pitchRatio' will control how much we shift the pitch.
    static get parameterDescriptors() {
        return [{
            name: 'pitchRatio',
            defaultValue: 1.0, // 1.0 means no pitch shift
            minValue: 0.1,    // Minimum possible pitch ratio (e.g., very low)
            maxValue: 10.0    // Maximum possible pitch ratio (e.g., very high)
        }];
    }

    constructor() {
        super();
        this.buffer = []; // A buffer to store incoming audio for processing
        this.bufferSize = 2048; // A reasonable buffer size for simple processing
        this.currentReadIndex = 0;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0]; // Get the first input (from microphone)
        const output = outputs[0]; // Get the first output (to speakers)
        const pitchRatio = parameters.pitchRatio[0]; // Get the current pitch ratio parameter

        // Simple pitch shift by changing playback rate (this will also change tempo)
        // For a true pitch shifter (without tempo change), you'd need more complex DSP
        // like phase vocoders or granular synthesis, which are beyond this basic example.

        if (input.length > 0) { // Check if there's audio input
            const inputChannel = input[0]; // Assuming mono input for simplicity
            const outputChannel = output[0];

            // Append new input data to our internal buffer
            for (let i = 0; i < inputChannel.length; i++) {
                this.buffer.push(inputChannel[i]);
            }

            // Keep buffer from growing indefinitely
            if (this.buffer.length > this.bufferSize * 2) { // Allow some headroom
                this.buffer = this.buffer.slice(this.buffer.length - this.bufferSize * 2);
            }

            // Process output based on pitchRatio
            for (let i = 0; i < outputChannel.length; i++) {
                // Calculate the read index based on the pitchRatio
                // If pitchRatio > 1, we read faster (higher pitch)
                // If pitchRatio < 1, we read slower (lower pitch)
                let readIndex = this.currentReadIndex;
                let nextReadIndex = readIndex + pitchRatio;

                // Simple linear interpolation to get sample value
                let sample;
                const floorReadIndex = Math.floor(readIndex);
                const ceilReadIndex = Math.ceil(readIndex);
                const fraction = readIndex - floorReadIndex;

                if (ceilReadIndex < this.buffer.length) {
                    sample = this.buffer[floorReadIndex] * (1 - fraction) +
                             this.buffer[ceilReadIndex] * fraction;
                } else if (floorReadIndex < this.buffer.length) {
                    sample = this.buffer[floorReadIndex];
                } else {
                    sample = 0; // No more data in buffer
                }

                outputChannel[i] = sample;

                // Update the read index
                this.currentReadIndex = nextReadIndex;

                // Loop the read index if it goes beyond the current buffer (for continuous playback)
                if (this.currentReadIndex >= this.buffer.length - 1) {
                    // A very basic loop. For more robust looping/shifting,
                    // you'd typically manage crossfading or more complex buffer strategies.
                    this.currentReadIndex = 0; // Reset to start of buffer, creating a loop/glitch
                }
            }
        } else {
            // If no input, clear output to prevent noise
            for (let i = 0; i < output.length; i++) {
                for (let channel = 0; channel < output[i].length; channel++) {
                    output[i][channel] = 0;
                }
            }
        }

        return true; // Keep the processor active
    }
}

// Register our custom AudioWorklet processor with a unique name
registerProcessor('pitch-shifter-processor', PitchShifterProcessor);