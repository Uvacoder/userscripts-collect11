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

// NOTE This file is generated from src/github-my-issues.user.ts and should not be edited directly.

"use strict";
(() => {
  // src/github-my-issues.user.ts
  // @license       GPL
  var ID = "my-issues-tab";
  var ISSUES_LINK = "a#issues-tab";
  var MY_ISSUES = "My Issues";
  var REPO = "octolytics-dimension-repository_nwo";
  var SELF = "user-login";
  var USER = "octolytics-dimension-user_login";
  function meta(name, key = "name") {
    const quotedName = JSON.stringify(name);
    return $(`meta[${key}=${quotedName}]`).attr("content");
  }
  function run() {
    $(`#${ID}`).closest("li").remove();
    const [self, user, repo] = [meta(SELF), meta(USER), meta(REPO)];
    if (!(self && user && repo)) {
      return;
    }
    const $issuesLink = $(ISSUES_LINK);
    const $issues = $issuesLink.closest("li");
    if ($issues.length !== 1) {
      return;
    }
    const myIssues = `involves:${self}`;
    const subqueries = [myIssues, "sort:updated-desc"];
    if (user === self) {
      subqueries.unshift("is:open", "archived:false");
    }
    const query = subqueries.join("+");
    const path = `/${repo}/issues`;
    const href = `${path}?q=${escape(query)}`;
    const $myIssues = $issues.clone();
    const $link = $myIssues.find(`:scope ${ISSUES_LINK}`).removeClass("selected").removeClass("deselected").attr({
      id: ID,
      role: "tab",
      href,
      "aria-current": null,
      "data-hotkey": "g I",
      "data-selected-links": null
    });
    $link.find(':scope [data-content="Issues"]').text(MY_ISSUES);
    $link.find(':scope [id="issues-repo-tab-count"]').remove();
    let q = null;
    if (location.pathname === path) {
      const params = new URLSearchParams(location.search);
      q = params.get("q");
    }
    if (q && q.trim().split(/\s+/).includes(myIssues)) {
      $link.attr("aria-selected", "true");
      $issuesLink.addClass("deselected");
    } else {
      $link.attr("aria-selected", "false");
      $issuesLink.removeClass("deselected");
    }
    $issues.after($myIssues);
  }
  GM_addStyle(`
    .deselected::after {
        background: transparent !important;
    }
`);
  $(document).on("turbo:load", run);
})();
