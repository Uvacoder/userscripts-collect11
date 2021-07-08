// ==UserScript==
// @name          IMDb Full Summary
// @description   Automatically show the full plot summary on IMDb
// @author        chocolateboy
// @copyright     chocolateboy
// @version       2.0.0
// @namespace     https://github.com/chocolateboy/userscripts
// @license       GPL
// @include       https://www.imdb.com/title/tt*
// @grant         none
// ==/UserScript==

/*
 * Tests:
 *
 *  - movie:   https://www.imdb.com/title/tt7638460/
 *  - TV show: https://www.imdb.com/title/tt0108983/
 */

// the truncated summary
const summary = document.querySelector('[data-testid="plot-xl"]')

// the full summary
const storyline = document.querySelector('[data-testid="storyline-plot-summary"] > div > div')

if (summary && storyline && storyline.firstChild) {
    const init = { childList: true }

    const replaceSummary = (_mutations, observer) => {
        observer.disconnect()
        // @ts-ignore
        summary.textContent = storyline.firstChild.textContent
        observer.observe(summary, init)
    }

    replaceSummary([], new MutationObserver(replaceSummary))
}