/** @param {NS} ns */
export async function main(ns) {
  const ram = 8;
  const serv_name = "pserv-" + (ns.args[1] + 1);
  const cost = ns.args[0];
  if (ns.getServerMoneyAvailable("home") > cost) {
    ns.purchaseServer(serv_name, ram);
  }
}
