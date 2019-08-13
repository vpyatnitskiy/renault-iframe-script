import { MESSAGE_PREFIX } from './common'
import { getBrandedVariable } from './brand'

const queue = []
let initialized = false, pingInterval
let parentState = {}
let eventHandlers = {
    scroll: new Set(),
}

function message(message, origin = '*') {
    window.parent.postMessage(message, origin)
}

function sendMessage(body) {
    message(MESSAGE_PREFIX + JSON.stringify(body))
}

function enqueue(cb) {
    if (initialized) {
        cb()
    } else {
        queue.push(cb)
    }
}

function sendQueuedMessage(...args) {
    enqueue(() => message(...args))
}

if (window !== parent) {
    window.addEventListener('message', ({ data }) => {
        if (!initialized && data.substring(0, 5) === 'pong|') {
            parentState = JSON.parse(data.substring(5))
            initialized = true
            clearInterval(pingInterval)
            console.log(`[${ getBrandedVariable() }] Initialized`)
            queue.forEach(cb => cb())
        } else if (data.substring(0, 7) === 'scroll|') {
            const payload = JSON.parse(data.substring(7))
            eventHandlers.scroll.forEach(cb => cb(payload))
        }
    })

    pingInterval = setInterval(() => {
        sendMessage({ type: 'ping' })
    }, 330)
}

function calculateHeight(element = undefined) {
    if (element === undefined) {
        return document.body
                ? Math.max(...[].map.call(document.body.children, calculateHeight))
                : 0
    }
    if (element.classList.contains('gm-style')) {
        return 0
    }

    const { pageYOffset } = window
    const { bottom } = element.getBoundingClientRect()

    if (window.getComputedStyle(element).overflowY !== 'visible') {
        return pageYOffset + bottom
    }

    return Math.ceil(Math.max(pageYOffset + bottom,
            ...[].map.call(element.children, calculateHeight)))
}

function resize(height = calculateHeight()) {
    console.log(`[${ getBrandedVariable() }] Resize to: ${ height }`)
    enqueue(() => sendMessage({ type: 'height', height }))
}

function logUnexpectedArgument(argument) {
    console.error(`[${ getBrandedVariable() }] Unexpected argument to scroll():`, argument)
}

function scroll(...args) {
    let position = -1
    let offset = -16
    let animate = false

    if (args.length > 0) {
        if ('number' === typeof args[0]) {
            position = args.shift()
        } else if ('object' === typeof args[0]) {
            let element = args.shift()
            if (element.jquery) {
                element = element.get(0)
            }
            if (!(element instanceof Node)) {
                logUnexpectedArgument(element)
                return
            } else {
                position = element.getBoundingClientRect().top
            }
        } else if ('string' === typeof args[0]) {
            position = args.shift()
        } else if (args[0] === true) {
            animate = true
        } else {
            logUnexpectedArgument(args[0])
            return
        }
    }
    if (args.length > 0) {
        if ('number' === typeof args[0]) {
            offset = args.shift()
        }
    }
    if (args.length > 0) {
        animate = args[0] === true
    }

    if (position >= 0) {
        position = Math.max(0, position + offset)
    }

    console.log(`[${ getBrandedVariable() }] Scroll to: ${ position === -1 ? 'top' : position }`)
    enqueue(() => sendMessage({ type: 'scroll', position, offset, animate }))
}

function getParentInfo(cb) {
    enqueue(() => cb(parentState))
}

function on(event, cb) {
    if (!(event in eventHandlers)) {
        throw new Error(`Unknown event type ${ event }`)
    }

    eventHandlers[event].add(cb)
}

function off(event, cb) {
    if (event in eventHandlers && eventHandlers[event].has(cb)) {
        eventHandlers[event].delete(cb)
    }
}

export {
    resize,
    scroll,
    sendQueuedMessage as message,
    getParentInfo,
    on,
    off,
}
