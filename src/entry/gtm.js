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

    function setHeight(iframe, height) {
        iframe.style.height = height + 'px'
    }

    function setScroll(iframe, position, offset, animate) {
        const floatingMenu = $('.docked-nav-outer')
        const hasFloatingMenu = floatingMenu.get(0)

        let scrollTo
        if (typeof position === 'string') {
            scrollTo = $(position).position().top + offset
        } else if (position === -1) {
            scrollTo = 0
        } else {
            scrollTo = $(iframe).position().top + offset

            const floatingMenuBreakpoint = $('header').outerHeight()
            if (hasFloatingMenu && scrollTo > floatingMenuBreakpoint) {
                scrollTo -= floatingMenu.outerHeight()
            }
        }

        $('html, body')[animate ? 'animate' : 'prop']({
            scrollTop: Math.max(0, scrollTo),
        })
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
                setScroll(iframe, json.position, json.offset, json.animate)
                break
        }
    }

    function scrollHandler() {
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
