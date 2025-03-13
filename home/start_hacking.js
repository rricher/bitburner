/** @param {NS} ns */
export async function main(ns) {
  const script = "early-hack-template.js";

  // Array of all servers that don't need any ports opened
  // to gain root access. These have 16 GB of RAM
  const servers0Port = [
    "sigma-cosmetics",
    "joesguns",
    "nectar-net",
    "hong-fang-tea",
    "harakiri-sushi",
  ];

  // Array of all servers that only need 1 port opened
  // to gain root access. These have 32 GB of RAM
  const servers1Port = ["neo-net", "zer0", "max-hardware", "iron-gym"];

  // Array of all servers that only need 1 port opened
  // to gain root access. These have 32 GB of RAM
  const servers2Port = ["phantasy", "omega-net", "silver-helix"];

  // Copy our scripts onto each server that requires 0 ports
  // to gain root access. Then use nuke() to gain admin access and
  // run the scripts.
  for (let i = 0; i < servers0Port.length; ++i) {
    const serv = servers0Port[i];
    if (!ns.getRunningScript(script, serv)) {
      ns.scp(script, serv);
      ns.nuke(serv);
      ns.exec(script, serv, 6);
    }
  }

  // Wait until we acquire the "BruteSSH.exe" program
  if (!ns.fileExists("BruteSSH.exe")) {
    return null;
  }

  // Copy our scripts onto each server that requires 1 port
  // to gain root access. Then use brutessh() and nuke()
  // to gain admin access and run the scripts.
  for (let i = 0; i < servers1Port.length; ++i) {
    const serv = servers1Port[i];
    if (!ns.getRunningScript(script, serv)) {
      ns.scp(script, serv);
      ns.brutessh(serv);
      ns.nuke(serv);
      ns.exec(script, serv, 6);
    }
  }

  // Wait until we acquire the "FTPCrack.exe" program
  if (!ns.fileExists("FTPCrack.exe")) {
    return null;
  }

  // Copy our scripts onto each server that requires 1 port
  // to gain root access. Then use brutessh() and nuke()
  // to gain admin access and run the scripts.
  for (let i = 0; i < servers2Port.length; ++i) {
    const serv = servers2Port[i];
    if (!ns.getRunningScript(script, serv)) {
      ns.scp(script, serv);
      ns.ftpcrack(serv);
      ns.brutessh(serv);
      ns.nuke(serv);
      ns.exec(script, serv, 6);
    }
  }
}
