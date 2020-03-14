import { MESSAGE_PREFIX } from '../implementation/common'

(function () {

    if (window[MESSAGE_PREFIX + '_init']) {
        return
    }
    window[MESSAGE_PREFIX + '_init'] = true

    const clients = new Set()

    const jsFrameDetectionInterval = setInterval(() => {
        const iframe = document.querySelector('iframe[src*=\'javascript:\']')
        if (iframe) {
            iframe.parentNode.removeChild(iframe)
            clearInterval(jsFrameDetectionInterval)
        }
    }, 330)

    function applyGlobalStyles() {
        const style = document.createElement('style')
        style.type = 'text/css'
        style.innerHTML = '.content-zone .grid-row.bleed { max-width: auto !important; }'
        document.querySelector('head').appendChild(style)
    }

    function onFrameInitialized(frame) {
        if (process.env.BRAND === 'Nissan') {
            applyFrameStyles(frame)
            $(window).on('resize orientationchange', () => applyFrameStyles(frame))
        }
    }

    function applyFrameStyles(iframe) {
        if (process.env.BRAND === 'Nissan') {
            const dimensions = [window.innerWidth, document.documentElement.offsetWidth]
            const header = document.querySelector('header')
            if (header) {
                dimensions.push(header.offsetWidth)
            }

            iframe.style.width = '1px'
            iframe.style.minWidth = Math.min(...dimensions) + 'px'
            iframe.style.transition = 'none'
            iframe.style.webkitTransition = 'none'
        }
    }

    function setHeight(iframe, height) {
        iframe.style.height = height + 'px'
    }

    function setScroll(iframe, position, animate) {
        const floatingMenu = $('.docked-nav-outer')
        const hasFloatingMenu = floatingMenu.get(0)

        let scrollTo
        if (typeof position === 'string') {
            scrollTo = $(position).position().top
        } else if (position === -1) {
            scrollTo = 0
        } else {
            scrollTo = position + $(iframe).position().top

            const floatingMenuBreakpoint = $('header').outerHeight()
            if (hasFloatingMenu && scrollTo > floatingMenuBreakpoint) {
                scrollTo -= floatingMenu.outerHeight()
            }
        }

        const $els = $('html, body')
        if (animate) {
            $els.stop(true, false)
        }
        $els[animate ? 'animate' : 'prop']({
            scrollTop: Math.max(0, scrollTo),
        }, 275)
    }

    function findIframe(sourceWindow) {
        for (let iframe of document.querySelectorAll('iframe')) {
            if (iframe.contentWindow === sourceWindow) {
                return iframe
            }
        }
    }

    function messageHandler({ data, source }) {
        if (typeof data !== 'string' || data.substring(0, 6) !== MESSAGE_PREFIX) {
            return
        }

        const json = JSON.parse(data.substring(MESSAGE_PREFIX.length))
        const iframe = findIframe(source)

        if (!clients.has(iframe)) {
            clients.add(iframe)
            onFrameInitialized(iframe)
        }

        switch (json.type) {
            case 'ping':
                source.postMessage('pong|' + JSON.stringify({
                    url: location.href,
                }), '*')
                break
            case 'height':
                setHeight(iframe, json.height)
                break
            case 'scroll':
                setScroll(iframe, json.position, json.animate)
                break
            case 'geolocate':
                try {
                    navigator.geolocation.getCurrentPosition(pos => {
                        const coords = pos.coords
                        source.postMessage('geolocation-success|' + JSON.stringify({
                            coords: {
                                latitude: coords.latitude,
                                longitude: coords.longitude,
                                altitude: coords.altitude,
                                accuracy: coords.accuracy,
                                altitudeAccuracy: coords.altitudeAccuracy,
                                heading: coords.heading,
                                speed: coords.speed,
                            },
                            timestamp: pos.timestamp,
                        }), '*')
                    }, err => {
                        source.postMessage('geolocation-error|' + JSON.stringify({
                            code: err.code,
                            message: err.message,
                        }), '*')
                    })
                } catch (e) {
                    source.postMessage('geolocation-error|' + JSON.stringify({
                        code: 0,
                        message: e.message,
                    }), '*')
                }
        }
    }

    function scrollHandler() {
        for (let iframe of clients) {
            const offset = -iframe.getBoundingClientRect().top
            const height = window.innerHeight
            iframe.contentWindow.postMessage('scroll|' + JSON.stringify({
                offset,
                height,
            }), '*')
        }
    }

    applyGlobalStyles()
    window.addEventListener('message', messageHandler)
    window.addEventListener('scroll', scrollHandler)

})()
