// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import React from 'react';
import { COMMON_LINK_TO_MEETING_WORD } from '../constants/translationLabels/common';
import i18n from '../i18n';
const normalizeLink = link => {
  if (stryMutAct_9fa48("0")) {
    {}
  } else {
    stryCov_9fa48("0");
    if (stryMutAct_9fa48("3") ? !link && !String(link).trim() : stryMutAct_9fa48("2") ? false : stryMutAct_9fa48("1") ? true : (stryCov_9fa48("1", "2", "3"), (stryMutAct_9fa48("4") ? link : (stryCov_9fa48("4"), !link)) || (stryMutAct_9fa48("5") ? String(link).trim() : (stryCov_9fa48("5"), !(stryMutAct_9fa48("6") ? String(link) : (stryCov_9fa48("6"), String(link).trim())))))) {
      if (stryMutAct_9fa48("7")) {
        {}
      } else {
        stryCov_9fa48("7");
        return null;
      }
    }
    const trimmedLink = stryMutAct_9fa48("8") ? String(link) : (stryCov_9fa48("8"), String(link).trim());
    if (stryMutAct_9fa48("10") ? false : stryMutAct_9fa48("9") ? true : (stryCov_9fa48("9", "10"), (stryMutAct_9fa48("12") ? /^https:\/\//i : stryMutAct_9fa48("11") ? /https?:\/\//i : (stryCov_9fa48("11", "12"), /^https?:\/\//i)).test(trimmedLink))) {
      if (stryMutAct_9fa48("13")) {
        {}
      } else {
        stryCov_9fa48("13");
        return trimmedLink;
      }
    }
    return stryMutAct_9fa48("14") ? `` : (stryCov_9fa48("14"), `https://${trimmedLink}`);
  }
};
export const getHref = (link, attributes = {}) => {
  if (stryMutAct_9fa48("15")) {
    {}
  } else {
    stryCov_9fa48("15");
    const normalizedLink = normalizeLink(link);
    if (stryMutAct_9fa48("18") ? false : stryMutAct_9fa48("17") ? true : stryMutAct_9fa48("16") ? normalizedLink : (stryCov_9fa48("16", "17", "18"), !normalizedLink)) {
      if (stryMutAct_9fa48("19")) {
        {}
      } else {
        stryCov_9fa48("19");
        return null;
      }
    }
    return <a title={normalizedLink} className="link-to-meeting" href={normalizedLink} target="_blank" rel="noreferrer" {...attributes}>
            {i18n.t(COMMON_LINK_TO_MEETING_WORD)}
        </a>;
  }
};