// ==UserScript==
// @name          GitHub My Issues
// @description   Add a contextual link to issues you've contributed to on GitHub
// @author        chocolateboy
// @copyright     chocolateboy
// @version       2.0.0
// @namespace     https://github.com/chocolateboy/userscripts
// @license       GPL
// @include       https://github.com/
// @include       https://github.com/*
// @require       https://cdn.jsdelivr.net/npm/cash-dom@8.1.5/dist/cash.min.js
// @grant         GM_addStyle
// @run-at        document-start
// ==/UserScript==

/*
 * value of the ID attribute for the "My Issues" link. used to identify an
 * existing link so it can be removed on pjax page loads
 */
const ID = 'my-issues-tab'

/*
 * selector for the "Issues" link. we navigate up from this to its parent
 * tab, which we clone the "My Issues" tab from and append to.
 */
const ISSUES_LINK = 'a#issues-tab'

/*
 * text for the "My Issues" link
 */
const MY_ISSUES = 'My Issues'

/*
 * meta-tag selector for the `<user>/<repo>` identifier
 */
const REPO = 'octolytics-dimension-repository_nwo'

/*
 * meta-tag selector for the name of the logged-in user
 */
const SELF = 'user-login'

/*
 * meta-tag selector for the owner of a repo
 */
const USER = 'octolytics-dimension-user_login'

/*
 * helper function which extracts a value from a META tag
 */
function meta (name: string, key = 'name') {
    const quotedName = JSON.stringify(name)
    return $(`meta[${key}=${quotedName}]`).attr('content')
}

/*
 * add the "My Issues" link
 */
function run () {
    // if we're here via a pjax load, there may be an existing "My Issues" link
    // from a previous page load. we can't reuse it as the event handlers may no
    // longer work, so we just replace it
    $(`#${ID}`).closest('li').remove()

    const [self, user, repo] = [meta(SELF), meta(USER), meta(REPO)]

    if (!(self && user && repo)) {
        return
    }

    const $issuesLink = $(ISSUES_LINK)
    const $issues = $issuesLink.closest('li')

    if ($issues.length !== 1) {
        return
    }

    const myIssues = `involves:${self}`
    const subqueries = [myIssues, 'sort:updated-desc']

    if (user === self) { // own repo
        // is:open archived:false involves:<self> ...
        subqueries.unshift('is:open', 'archived:false')
    }

    const query = subqueries.join('+')
    const path = `/${repo}/issues`
    const href = `${path}?q=${escape(query)}`
    const $myIssues = $issues.clone()
    const $link = $myIssues
        .find(`:scope ${ISSUES_LINK}`)
        .removeClass('selected')
        .removeClass('deselected')
        .attr({
            id: ID,
            role: 'tab',
            href,
            'aria-current': null,
            'data-hotkey': 'g I',
            'data-selected-links': null,
        })

    $link.find(':scope [data-content="Issues"]').text(MY_ISSUES)
    $link.find(':scope [id="issues-repo-tab-count"]').remove()

    let q: string | null = null

    if (location.pathname === path) {
        const params = new URLSearchParams(location.search)
        q = params.get('q')
    }

    if (q && q.trim().split(/\s+/).includes(myIssues)) {
        $link.attr('aria-selected', 'true')
        $issuesLink.addClass('deselected')
    } else {
        $link.attr('aria-selected', 'false')
        $issuesLink.removeClass('deselected')
    }

    $issues.after($myIssues)
}

GM_addStyle(`
    .deselected::after {
        background: transparent !important;
    }
`)

// run on navigation (including full page loads)
$(document).on('turbo:load', run)
