const sanitizeHtml = require('sanitize-html')
const sanitizeOpts = require('./sanitizeOpts')
const equationImageSelector = 'img[src^="/math.svg"]'

module.exports = {
    isKey,
    isCtrlKey,
    insertToTextAreaAtCursor,
    sanitize,
    sanitizeContent,
    setCursorAfter,
    equationImageSelector,
    existingScreenshotCount,
    scrollIntoView
}

function convertLinksToRelative(html) {
    return html.replace(new RegExp(document.location.origin, 'g'), '')
}

function sanitize(html) {
    return sanitizeHtml(convertLinksToRelative(html), sanitizeOpts)
}
function insertToTextAreaAtCursor(field, value) {
    const startPos = field.selectionStart
    const endPos = field.selectionEnd
    let oldValue = field.value
    field.value = oldValue.substring(0, startPos) + value + oldValue.substring(endPos, oldValue.length)
    field.selectionStart = field.selectionEnd = startPos + value.length
}

function isKey(e, key) {
    return preventIfTrue(e, !e.altKey && !e.shiftKey && !e.ctrlKey && keyOrKeyCode(e, key))
}

function isCtrlKey(e, key) {
    return preventIfTrue(e, !e.altKey && !e.shiftKey && e.ctrlKey && keyOrKeyCode(e, key))
}

function keyOrKeyCode(e, val) {
    return typeof val === 'string' ? e.key === val : e.keyCode === val
}
function preventIfTrue(e, val) {
    if (val) e.preventDefault()
    return val
}

function sanitizeContent(answerElement) {
    const $answerElement = $(answerElement)
    const $mathEditor = $answerElement.find('[data-js="mathEditor"]')
    $mathEditor.hide()
    const text = $answerElement.get(0).innerText
    $mathEditor.show()

    const html = sanitize($answerElement.html())

    return {
        answerHTML: html,
        answerText: text,
        imageCount: existingScreenshotCount($(`<div>${html}</div>`))
    }
}

function setCursorAfter($img) {
    const range = document.createRange()
    const img = $img.get(0)
    const nextSibling = img.nextSibling && img.nextSibling.tagName === 'BR' ? img.nextSibling : img
    range.setStart(nextSibling, 0)
    range.setEnd(nextSibling, 0)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
}

function existingScreenshotCount($editor) {
    const imageCount = $editor.find('img').length
    const equationCount = $editor.find(equationImageSelector).length
    return imageCount - equationCount
}

function scrollIntoView($element) {
    const $window = $(window)
    const windowHeight = $window.height() - 40
    const scroll = windowHeight + $window.scrollTop()
    const pos = $element.offset().top + $element.height()
    if (scroll < pos) {
        $window.scrollTop(pos - windowHeight)
    }
}
