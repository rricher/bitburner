/** @param {NS} ns */
export async function main(ns) {
  const server = "home";
  const server_ram = ns.getServerMaxRam(server);
  const script = "/start_hacking.js";
  const script_ram = ns.getScriptRam(script);
  ns.run(script);
  while (true) {
    await ns.sleep(100000);
    if (ns.getServerUsedRam(server) + script_ram > server_ram) {
      await ns.sleep(1000);
    }
    ns.run(script);
  }
}
