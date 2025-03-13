/** @param {NS} ns */
export async function main(ns) {
  const host = "pserv-" + ns.args[0];
  ns.scp("early-hack-template.js", host);
  ns.exec("early-hack-template.js", host, 3);
}
