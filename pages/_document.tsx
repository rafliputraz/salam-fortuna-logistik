import { Head, Html, Main, NextScript } from 'next/document'

/**
 * The inline bootstrap marks the document as scripted before first paint.
 * Reveal animations only pre-hide content under `.js`, so a visitor whose
 * scripts fail still gets the whole page. It also marks a visitor who has
 * already seen the boot sequence this session, so it never flashes twice.
 */
const JS_BOOTSTRAP = `(function(d){d.classList.add('js');try{if(sessionStorage.getItem('sfl-booted'))d.classList.add('booted')}catch(e){d.classList.add('booted')}})(document.documentElement)`

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
