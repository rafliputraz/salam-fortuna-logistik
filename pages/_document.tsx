import { Head, Html, Main, NextScript } from 'next/document'

/**
 * The inline bootstrap marks the document as scripted before first paint.
 * Reveal animations only pre-hide content under `.js`, so a visitor whose
 * scripts fail still gets the whole page.
 */
const JS_BOOTSTRAP = `document.documentElement.classList.add('js')`

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: JS_BOOTSTRAP }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
