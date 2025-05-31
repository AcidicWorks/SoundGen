class Knob {
    constructor(text, min, max, def, step) {
        const label = document.createElement('label')
        label.innerText = text
        label.htmlFor = 'knob'
        //label.style.margin = '0 .5rem 0 1rem'
        // label.style.marginRight = '1rem'
        const input = document.createElement('input')
        input.id = 'knob'
        input.type = 'text'
        input.style = 'width:5rem; margin-left:.5rem !important; border-width:1px;'
        input.value = def
        input.onkeydown = (event) => {
            const key = Number(event.key)
            if (isNaN(key)) {
                const code = event.code
                const controlCodes = [
                    'Minus', 'Period', 'Backspace', 'Delete', 'Shift',
                    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
                ]
                if (controlCodes.includes(code)) {
                    if (code === 'Minus') {
                        if (event.target.selectionStart === 0)
                            return
                    }
                    else if (code == 'ArrowUp') {
                        event.target.value = Math.min(Number(event.target.value) + step, max).toFixed(2)
                        return
                    }
                    else if (code == 'ArrowDown') {
                        event.target.value = Math.max(Number(event.target.value) - step, min).toFixed(2)
                        return
                    }
                    else
                        return
                }
            }
            else if (0 <= key && key <= 9)
                return
            event.preventDefault()
        }
        input.onkeyup = (event) => {
            event.target.value = Math.max(event.target.value, min).toFixed(2)
            event.target.value = Math.min(event.target.value, max).toFixed(2)
        }
        this.knob = document.createElement('span')
        this.knob.appendChild(label)
        this.knob.appendChild(input)
    }

    get value() {
        return this.knob.querySelector('input').value
    }
}