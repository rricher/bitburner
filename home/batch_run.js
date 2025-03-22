/** @param {NS} ns */
export async function main(ns) {
  let script = ns.args[0];
  let target = ns.args[1];
  let wait_time = ns.args[2];
  let servers_to_assign = JSON.parse(ns.args[3]);
  while (true) {
    for (let [server, threads] of Object.entries(servers_to_assign)) {
      ns.exec(script, server, threads, target);
    }
    await ns.sleep(wait_time);
  }
}
