/** @param {NS} ns */
export async function main(ns) {
  const server_limit = ns.getPurchasedServerLimit();
  while (ns.getPurchasedServers().length < server_limit) {
    const cost = ns.getPurchasedServerCost(8);
    if (cost < ns.getServerMoneyAvailable("home")) {
      ns.run("/servers/purchase.js");
    }
    await ns.sleep(1000);
  }
}
