const servers = {};
const server_money = {};
let target = "";

/** @param {NS} ns */
export async function main(ns) {
  ns.run("/start_hacking.js");
  while (true) {
    await ns.sleep(10000);
    find_servers(ns);
  }
}

function find_servers(ns) {
  // basic script template
  const mem = ns.getScriptRam("early-hack-template.js");
  const home_ram = Math.floor(
    (ns.getServerMaxRam("home") - ns.getScriptRam("/find.js")) / mem
  );
  let prev_servers = ns.read("servers.json")
    ? JSON.parse(ns.read("servers.json"))
    : {};
  let prev_server_money = ns.read("servers_money.json")
    ? JSON.parse(ns.read("servers_money.json"))
    : {};

  const host = "home";

  const scanned = ns.scan(host);
  for (let i = 0; i < scanned.length; i++) {
    let server = scanned[i];
    scan_server(ns, server);
  }
  if (JSON.stringify(prev_server_money) != JSON.stringify(server_money)) {
    ns.write(
      "servers_money.json",
      JSON.stringify(server_money, null, "  "),
      "w"
    );
    if (JSON.stringify(prev_servers) != JSON.stringify(servers)) {
      ns.write("servers.json", JSON.stringify(servers, null, "  "), "w");
      ns.scriptKill("/early-hack-template.js", host);
      if (home_ram >= 1) {
        ns.run("/start_hacking.js");
      } else {
        ns.run("/start_hacking.js");
      }
    } else {
      ns.scriptKill("/early-hack-template.js", host);
      if (home_ram >= 1) {
        ns.run("/start_hacking.js");
      } else {
        ns.run("/start_hacking.js");
      }
    }
  } else {
    if (JSON.stringify(prev_servers) != JSON.stringify(servers)) {
      ns.write("servers.json", JSON.stringify(servers, null, "  "), "w");
      ns.scriptKill("/early-hack-template.js", host);
      if (home_ram >= 1) {
        ns.run("/start_hacking.js");
      } else {
        ns.run("/start_hacking.js");
      }
    } else {
      let new_target = "";
      for (const [key, value] of Object.entries(server_money)) {
        if (ns.getHackingLevel() >= key) {
          if (ns.hasRootAccess(value[1])) {
            new_target = value[1];
          }
        } else {
          break;
        }
      }
      if (new_target != target) {
        target = new_target;
        ns.run("/start_hacking.js");
      }
    }
  }
}

function scan_server(ns, host) {
  let info = ns.getServer(host);
  let money = info.moneyMax;
  let ports = info.numOpenPortsRequired;
  let skill = info.requiredHackingSkill ? info.requiredHackingSkill : 0;
  if (!(ports in servers)) {
    servers[ports] = [];
  }
  if (!servers[ports].includes(host)) {
    servers[ports].push(host);
    if (money > 0) {
      if (skill in server_money) {
        if (server_money[skill][0] < money) {
          server_money[skill] = [money, host];
        }
      } else {
        server_money[skill] = [money, host];
      }
    }
  }
  const scanned = ns.scan(host);
  if (scanned.length > 1) {
    for (let i = 1; i < scanned.length; i++) {
      scan_server(ns, scanned[i]);
    }
  } else {
    return;
  }
}
