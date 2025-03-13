/** @param {NS} ns */
export async function main(ns) {
  const purchased_servers = ns.getPurchasedServers();
  for (let i = 0; i < purchased_servers.length; i++) {
    let new_name = "pserv-" + (i + 1);
    ns.renamePurchasedServer(purchased_servers[i], new_name);
  }
  // ns.renamePurchasedServer("pserv-0", "pserv-25");
}
