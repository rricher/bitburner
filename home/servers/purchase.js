/** @param {NS} ns */
export async function main(ns) {
  const ram = 8;
  const serv_name = "pserv-" + (ns.getPurchasedServers().length + 1);
  ns.purchaseServer(serv_name, ram);
}
