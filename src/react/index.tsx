import ReactDOM from 'react-dom/client'
import RichTextEditor from './rich-text-editor'

export const REACT_ROOT = document.getElementById('root')!

ReactDOM.createRoot(REACT_ROOT).render(
  <RichTextEditor
    language="FI"
    editorStyle={{ top: '300px', position: 'relative' }}
    onValueChange={() => {}}
    initialValue='testi. <br>kaava: &nbsp;<span class="math-editor-wrapper" id="math-editor-1" style="display: contents;" contenteditable="false"><img src="data:image/svg+xml;utf8," data-math-svg="true" data-latex="\sqrt{123}" alt="\sqrt{123}"></span>&nbsp;<br> <br>&nbsp;'
  />,
)
