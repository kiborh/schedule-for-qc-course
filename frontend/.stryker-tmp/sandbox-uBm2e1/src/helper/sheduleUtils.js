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
import { isEmpty } from 'lodash';
const getScheduleByType = stryMutAct_9fa48("20") ? () => undefined : (stryCov_9fa48("20"), (() => {
  const getScheduleByType = (entityId, semesterId) => ({});
  return getScheduleByType;
})());
const isNotReadySchedule = stryMutAct_9fa48("21") ? () => undefined : (stryCov_9fa48("21"), (() => {
  const isNotReadySchedule = (schedule, loading) => stryMutAct_9fa48("24") ? isEmpty(schedule) || !loading : stryMutAct_9fa48("23") ? false : stryMutAct_9fa48("22") ? true : (stryCov_9fa48("22", "23", "24"), isEmpty(schedule) && (stryMutAct_9fa48("25") ? loading : (stryCov_9fa48("25"), !loading)));
  return isNotReadySchedule;
})());
const filterClassesArray = (inputArray = stryMutAct_9fa48("26") ? ["Stryker was here"] : (stryCov_9fa48("26"), [])) => {
  if (stryMutAct_9fa48("27")) {
    {}
  } else {
    stryCov_9fa48("27");
    const safeArray = Array.isArray(inputArray) ? inputArray : stryMutAct_9fa48("28") ? ["Stryker was here"] : (stryCov_9fa48("28"), []);
    if (stryMutAct_9fa48("30") ? false : stryMutAct_9fa48("29") ? true : (stryCov_9fa48("29", "30"), isEmpty(safeArray))) {
      if (stryMutAct_9fa48("31")) {
        {}
      } else {
        stryCov_9fa48("31");
        return stryMutAct_9fa48("32") ? ["Stryker was here"] : (stryCov_9fa48("32"), []);
      }
    }
    return stryMutAct_9fa48("33") ? safeArray : (stryCov_9fa48("33"), safeArray.filter((item, index, array) => {
      if (stryMutAct_9fa48("34")) {
        {}
      } else {
        stryCov_9fa48("34");
        const resIndex = array.findIndex(stryMutAct_9fa48("35") ? () => undefined : (stryCov_9fa48("35"), findItem => stryMutAct_9fa48("38") ? findItem.id !== item.id : stryMutAct_9fa48("37") ? false : stryMutAct_9fa48("36") ? true : (stryCov_9fa48("36", "37", "38"), findItem.id === item.id)));
        return stryMutAct_9fa48("41") ? resIndex !== index : stryMutAct_9fa48("40") ? false : stryMutAct_9fa48("39") ? true : (stryCov_9fa48("39", "40", "41"), resIndex === index);
      }
    }));
  }
};
export { getScheduleByType, isNotReadySchedule, filterClassesArray };