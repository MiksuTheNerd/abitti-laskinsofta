import { expect, Page, Locator } from '@playwright/test'
import { Answer } from '../src/react/utility'

export const assertEditorTextContent = async (editor: Locator, content: string) => {
  expect(await editor.textContent()).toBe(content)
}

export const assertEditorHTMLContent = async (editor: Locator, content: string) => {
  expect(await editor.innerHTML()).toBe(content)
}

export const assertEquationEditorTextContent = async (equationEditor: Locator, content: string) => {
  expect(await equationEditor.locator('.math-editor-equation-field').textContent()).toBe(content)
}

export const assertEquationEditorLatexContent = async (equationEditor: Locator, content: string) => {
  expect(await equationEditor.locator('.math-editor-latex-field').textContent()).toBe(content)
}

export const getEditorLocator = (page: Page) => page.getByTestId('rich-text-editor')

export const repeat = async (times: number, action: () => Promise<void>) => {
  for (const _i of Array(times)) {
    await action()
  }
  return Promise.resolve()
}

export const inputSpecialCharacterFromToolbar = async (page: Page, character: string) => {
  await page.getByText(character, { exact: true }).click()
}

export const inputLatexCommandFromToolbar = async (page: Page, latexCommand: string) => {
  await page.getByTestId(`math-command-${latexCommand}`).click()
}

/** Clicks near the bottom corner of the page, to make sure it doesn't hit the editor or toolbar */
export const clickOutsideEditor = async (page: Page) => {
  const dimensions = await page.evaluate(() => ({
    x: document.documentElement.clientWidth,
    y: document.documentElement.clientHeight,
  }))

  await page.click('html', {
    position: {
      x: dimensions.x - 5,
      y: dimensions.y - 5,
    },
  })
}

export const getUndoButton = (page: Page) => page.getByTestId('undo')

export const getRedoButton = (page: Page) => page.getByTestId('redo')

const grantClipboardPermissions = async (page: Page) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
}

export const setClipboardText = async (page: Page, text: string) => {
  await grantClipboardPermissions(page)
  await page.evaluate(async (text) => {
    console.log(text)
    await navigator.clipboard.writeText(text)
  }, text)
}

export const setClipboardHTML = async (page: Page, text: string) => {
  await grantClipboardPermissions(page)
  await page.evaluate(async (text) => {
    await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([text], { type: 'text/html' }) })])
  }, text)
}

export const setClipboardImage = async (page: Page, filetype: string, base64: string) => {
  await page.evaluate(
    async ([filetype, base64]) => {
      const response = await fetch(`data:image/png;base64,${base64}`)
      const blob = await response.blob()

      const clipboardData: Record<string, Blob> = {}
      clipboardData[filetype] = blob

      await navigator.clipboard.write([new ClipboardItem(clipboardData)])
    },
    [filetype, base64],
  )
}

export const paste = async (page: Page) =>
  process.platform === 'darwin' ? page.keyboard.press('Meta+V') : page.keyboard.press('Control+V')

export const pasteHtmlImage = async (page: Page, base64: string) => {
  await setClipboardHTML(page, base64)
  await paste(page)
}

export const samplePNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC'

export const sampleGIF = 'R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='

const isAnswerKey = (key: string, answer: Answer): key is keyof Answer => key in answer

/** Assert that selected fields of Answer are as expected. Allows specifying just the fields to test,
 *   for convenience.
 */
export const assertAnswerContent = (answer: Answer, expected: Partial<Answer>) => {
  Object.entries(expected).forEach(([key, value]) => {
    // Remove slashes from self-closing tags because we do not care about that
    const expected = String(value).replace(/ \/>/g, '>')
    if (expected !== undefined) {
      if (!isAnswerKey(key, answer)) {
        throw new Error(`${key} not found in answer`)
      }
      const received = String(answer[key]).replace(/ \/>/g, '>')
      expect(received, `${key} does not match`).toMatch(expected)
    }
  })
}

/**  Helper for selecting part of the answer text, with logic to handle selections that span multiple nodes.
 *  Does not do anything to the content, beyond selecting it.
 */
export const selectEditorContent = async (locator: Locator, start: number, end: number) => {
  const handle = await locator.elementHandle()
  if (!handle) {
    throw new Error('Element not found')
  }

  await handle.evaluate(
    (element, [start, end]) => {
      const findNodeByOffset = (nodes: NodeListOf<ChildNode>, offset: number): [Node, number] => {
        const firstNode = nodes[0]
        let currentOffset = 0

        for (const node of Array.from(nodes)) {
          const nodeLength = node.textContent?.length ?? 0
          if (currentOffset + nodeLength >= offset) {
            return [node, offset - currentOffset]
          } else {
            currentOffset += nodeLength
          }
        }

        return [firstNode, 0]
      }

      const range = document.createRange()
      const [startNode, startOffset] = findNodeByOffset(element.childNodes, start)
      const [endNode, endOffset] = findNodeByOffset(element.childNodes, end)
      range.setStart(startNode, startOffset)
      range.setEnd(endNode, endOffset)
      const selection = window.getSelection()

      if (!selection) {
        throw new Error('Selection not succesfull')
      }

      selection.removeAllRanges()
      selection.addRange(range)
    },
    [start, end],
  )
}

export const specialCharacters = {
  alpha: ['\\alpha', '\u03B1'],
  delta: ['\\delta', '\u0394'],
  cos: ['\\cos'],
  sqrt: ['\\sqrt'],
}