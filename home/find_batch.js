const servers = {};
const server_money = {};

/** @param {NS} ns */
export async function main(ns) {
  find(ns);
}

/** @param {NS} ns */
function find(ns) {
  const host = "home";
  let level = 0;
  if (ns.fileExists("BruteSSH.exe")) {
    level = 1;
  }
  if (ns.fileExists("FTPCrack.exe")) {
    level = 2;
  }
  if (ns.fileExists("relaySMTP.exe")) {
    level = 3;
  }
  if (ns.fileExists("HTTPWorm.exe")) {
    level = 4;
  }
  if (ns.fileExists("SQLInject.exe")) {
    level = 5;
  }
  const scanned = ns.scan(host);
  for (let i = 0; i < scanned.length; i++) {
    let server = scanned[i];
    scan(ns, server, level);
  }
  ns.write("batch_money.json", JSON.stringify(server_money, null, "  "), "w");
  ns.write("batch_servers.json", JSON.stringify(servers, null, "  "), "w");
}

/** @param {NS} ns */
function scan(ns, server, level) {
  let info = ns.getServer(server);
  let ram = info.maxRam;
  let money = info.moneyMax;
  let ports = info.numOpenPortsRequired;
  let skill = info.requiredHackingSkill ? info.requiredHackingSkill : 0;
  if ((ns.hasRootAccess(server) && ram > 0) || (ports <= level && ram > 0)) {
    servers[server] = ram;
    // if (!ns.fileExists("hack.js", server)) {
    //   ns.scp("hack.js", server);
    // // }
    // if (!ns.fileExists("grow.js", server)) {
    //   ns.scp("grow.js", server);
    // }
    // if (!ns.fileExists("weaken.js", server)) {
    //   ns.scp("weaken.js", server);
    // }
    ns.scp("hack.js", server);
    ns.scp("grow.js", server);
    ns.scp("weaken.js", server);
  }
  if (money > 0) {
    if (skill in server_money) {
      if (server_money[skill][0] < money) {
        server_money[skill] = [money, server];
      }
    } else {
      server_money[skill] = [money, server];
    }
  }
  const scanned = ns.scan(server);
  if (scanned.length > 1) {
    for (let i = 1; i < scanned.length; i++) {
      scan(ns, scanned[i], level);
    }
  } else {
    return;
  }
}
