/** @param {NS} ns */
export async function main(ns) {
  const server = "home";
  const server_ram = ns.getServerMaxRam(server);
  const script = "/servers/purchase.js";
  const script_ram = ns.getScriptRam(script);
  const purch_ram = 8;
  const cost = ns.getPurchasedServerCost(purch_ram);
  const server_limit = ns.getPurchasedServerLimit();
  while (ns.getPurchasedServers().length <= server_limit) {
    if (ns.getServerUsedRam(server) + script_ram > server_ram) {
      await ns.sleep(1000);
    }
    let servers = ns.getPurchasedServers().length + 1;
    ns.run(script, cost, servers);
    if (servers == ns.getPurchasedServers().length) {
      cost = ns.getPurchasedServerCost(ram);
      ns.run("/servers/exec.js", servers);
    }
    await ns.sleep(60000);
  }
}
