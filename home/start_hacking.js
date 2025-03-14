/** @param {NS} ns */
export async function main(ns) {
  const script = "early-hack-template.js";

  // Array of all servers that don't need any ports opened
  // to gain root access. These have 16 GB of RAM
  const servers = ns.read("servers.json")
    ? JSON.parse(ns.read("servers.json"))
    : {};
  const servers_money = ns.read("servers_money.json")
    ? JSON.parse(ns.read("servers_money.json"))
    : {};

  const mem = ns.getScriptRam(script);

  const skill = ns.getHackingLevel();
  let target = null;
  for (const [key, value] of Object.entries(servers_money)) {
    if (skill >= key) {
      target = value[1];
    } else {
      break;
    }
  }
  const moneyThresh = ns.getServerMaxMoney(target);
  const securityThresh = ns.getServerMinSecurityLevel(target);
  // Copy our scripts onto each server that requires 0 ports
  // to gain root access. Then use nuke() to gain admin access and
  // run the scripts.
  let level = 0;

  // Wait until we acquire the "BruteSSH.exe" program
  if (ns.fileExists("BruteSSH.exe")) {
    level = 1;
  }

  // Wait until we acquire the "FTPCrack.exe" program
  if (ns.fileExists("FTPCrack.exe")) {
    level = 2;
  }

  // Wait until we acquire the "FTPCrack.exe" program
  if (ns.fileExists("relaySMTP.exe")) {
    level = 3;
  }

  // Wait until we acquire the "FTPCrack.exe" program
  if (ns.fileExists("HTTPWorm.exe")) {
    level = 4;
  }

  // Wait until we acquire the "FTPCrack.exe" program
  if (ns.fileExists("SQLInject.exe")) {
    level = 5;
  }
  hack_serv(
    ns,
    servers,
    level,
    script,
    mem,
    target,
    moneyThresh,
    securityThresh
  );
  const home_ram = Math.floor(
    (ns.getServerMaxRam("home") - ns.getScriptRam("/find.js")) / mem
  );
  if (home_ram >= 1) {
    ns.spawn(
      script,
      { threads: home_ram, spawnDelay: 5000 },
      target,
      moneyThresh,
      securityThresh
    );
  }
}

function hack_serv(
  ns,
  servers,
  level,
  script,
  mem,
  target,
  moneyThresh,
  securityThresh
) {
  for (const [key, value] of Object.entries(servers)) {
    for (const serv of value) {
      if (ns.hasRootAccess(serv)) {
        ns.scp(script, serv);
        ns.nuke(serv);
      } else if (key <= level) {
        ns.tprint(key, " ", level);
        if (level == 5) {
          ns.sqlinject(serv);
        }
        if (level >= 4) {
          ns.httpworm(serv);
        }
        if (level >= 3) {
          ns.relaysmtp(serv);
        }
        if (level >= 2) {
          ns.ftpcrack(serv);
        }
        if (level >= 1) {
          ns.brutessh(serv);
        }
        ns.scp(script, serv);
        ns.nuke(serv);
      } else {
        continue;
      }
      let ram = Math.floor(ns.getServerMaxRam(serv) / mem);
      if (ram >= 1) {
        ns.killall(serv);
        ns.exec(script, serv, ram, target, moneyThresh, securityThresh);
      }
    }
  }
}
