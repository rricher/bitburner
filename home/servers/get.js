/** @param {NS} ns */
export async function main(ns) {
  const purchased_servers = ns.getPurchasedServers();
  return purchased_servers;
}
