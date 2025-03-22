/** @param {NS} ns */
export async function main(ns) {
  let servers = ns.read("batch_servers.json")
    ? JSON.parse(ns.read("batch_servers.json"))
    : {};
  for (let server in servers) {
    ns.killall(server);
  }
}
