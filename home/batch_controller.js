const time = "200";
let target = "server";
let target_max_money = 0;
const grow = "/grow.js";
const weaken = "/weaken.js";
const hack = "/hack.js";
let used_servers = {};
let target_min_security = 0;
let total_ram = 0;
let total_threads = 0;
let used_ram = 0;
let servers = {};
let servers_money = {};

/** @param {NS} ns */
function get_target(ns) {
  const skill = ns.getHackingLevel();
  for (const [key, value] of Object.entries(servers_money)) {
    if (skill >= key) {
      if (ns.hasRootAccess(value[1])) {
        target_max_money = value[0];
        target = value[1];
      }
    } else {
      break;
    }
  }
}

/** @param {NS} ns */
function get_total_ram(ns) {
  for (const [key, value] of Object.entries(servers)) {
    total_ram += value;
  }
}

/** @param {NS} ns */
function get_total_threads(ns) {
  let script_ram = ns.getScriptRam(grow);
  total_threads = Math.floor(total_ram / script_ram);
}

/** @param {NS} ns */
export async function main(ns) {
  servers = ns.read("batch_servers.json")
    ? JSON.parse(ns.read("batch_servers.json"))
    : {};
  servers_money = ns.read("batch_money.json")
    ? JSON.parse(ns.read("batch_money.json"))
    : {};
  get_target(ns);
  get_total_ram(ns);
  get_total_threads(ns);
  target_max_money = ns.getServerMaxMoney(target);
  target_min_security = ns.getServerMinSecurityLevel(target);
  let wait_time = 0;
  wait_time = await prep_target(ns);
  await ns.sleep(wait_time);
  used_servers = {};
  used_ram = 0;
  await run_batch(ns);
}

/** @param {NS} ns */
function get_threads(ns, hack_threads) {
  ns.tprint("Calculating threads...");
  ns.tprint("Hack threads: " + hack_threads);
  let weaken_single_thread = ns.weakenAnalyze(1);
  ns.tprint("Weaken single thread: " + weaken_single_thread);
  let hack_money_percent = ns.hackAnalyze(target) * hack_threads;
  ns.tprint("Hack money percent: " + hack_money_percent);
  let hack_security_increase = ns.hackAnalyzeSecurity(hack_threads);
  ns.tprint("Hack security increase: " + hack_security_increase);
  let weaken_hack_threads = Math.ceil(
    hack_security_increase / weaken_single_thread
  );
  ns.tprint("Weaken hack threads: " + weaken_hack_threads);
  let money_after_hack = target_max_money * (1 - hack_money_percent);
  ns.tprint("Money after hack: " + money_after_hack);
  let grow_threads = Math.ceil(
    ns.growthAnalyze(target, target_max_money / money_after_hack)
  );
  ns.tprint("Grow threads: " + grow_threads);
  let grow_securty_increase = ns.growthAnalyzeSecurity(grow_threads);
  ns.tprint("Grow security increase: " + grow_securty_increase);
  let weaken_grow_threads = Math.ceil(
    grow_securty_increase / weaken_single_thread
  );
  ns.tprint("Weaken grow threads: " + weaken_grow_threads);
  return [weaken_hack_threads, grow_threads, weaken_grow_threads];
}

/** @param {NS} ns */
async function run_batch(ns) {
  ns.tprint("Running batch...");
  let weaken_time = ns.getWeakenTime(target);
  let grow_time = ns.getGrowTime(target);
  let hack_time = ns.getHackTime(target);
  ns.tprint("Weaken time: " + weaken_time);
  ns.tprint("Grow time: " + grow_time);
  ns.tprint("Hack time: " + hack_time);

  let [weaken_hack_threads, grow_threads, weaken_grow_threads] = get_threads(
    ns,
    1
  );
  let total_single_threads =
    weaken_hack_threads + grow_threads + weaken_grow_threads + 1;
  ns.tprint("Single threads: " + total_single_threads);
  let max_batches = 0;
  while (max_batches < total_threads) {
    max_batches = Math.floor(total_threads / total_single_threads);
    ns.tprint("Max batches: " + max_batches);
    let hack_threads = max_batches;
    ns.tprint("Hack threads: " + hack_threads);
    [weaken_hack_threads, grow_threads, weaken_grow_threads] = get_threads(
      ns,
      hack_threads
    );
    let wait_time = weaken_time + time * 2;
    let grow_wait = weaken_time - grow_time - time;
    let hack_wait = weaken_time - hack_time - grow_wait - time * 3;
    assign_servers(ns, weaken_hack_threads, weaken, wait_time);
    await ns.sleep(time * 2);
    assign_servers(ns, weaken_grow_threads, weaken, wait_time);
    await ns.sleep(grow_wait);
    assign_servers(ns, grow_threads, grow, wait_time);
    await ns.sleep(hack_wait);
    assign_servers(ns, hack_threads, hack, wait_time);
  }
}

/** @param {NS} ns */
async function prep_target(ns) {
  let weaken_time = ns.getWeakenTime(target);
  let grow_time = ns.getGrowTime(target);
  let target_curr_security = ns.getServerSecurityLevel(target);
  let weaken_single_thread = ns.weakenAnalyze(1);
  let weaken_threads = Math.ceil(
    (target_curr_security - target_min_security) / weaken_single_thread
  );
  let target_curr_money = ns.getServerMoneyAvailable(target);
  let grow_threads = Math.ceil(
    ns.growthAnalyze(target, target_max_money / target_curr_money)
  );
  let grow_securty_increase = ns.growthAnalyzeSecurity(grow_threads);
  let weaken_grow_threads = Math.ceil(
    grow_securty_increase / weaken_single_thread
  );
  let wait_time = 0;
  if (weaken_threads > 0 && grow_threads > 0) {
    let grow_wait = weaken_time - grow_time;
    wait_time = weaken_time - grow_wait - time * 2;
    assign_servers_prep(ns, weaken_threads, weaken);
    await ns.sleep(time);
    assign_servers_prep(ns, weaken_grow_threads, weaken);
    await ns.sleep(grow_wait - time);
    assign_servers_prep(ns, grow_threads, grow);
  } else if (weaken_threads > 0) {
    wait_time = weaken_time;
    assign_servers_prep(ns, weaken_threads, weaken);
  } else if (grow_threads > 0) {
    let grow_wait = weaken_time - grow_time;
    wait_time = weaken_time;
    assign_servers_prep(ns, weaken_grow_threads, weaken);
    await ns.sleep(grow_wait - time);
    assign_servers_prep(ns, grow_threads, grow);
  } else {
  }
  return wait_time;
}

/** @param {NS} ns */
function assign_servers(ns, threads, script, wait_time = 0) {
  ns.tprint("Assigning servers...");
  ns.tprint("Threads: " + threads);
  ns.tprint("Script: " + script);
  ns.tprint("Wait time: " + wait_time);
  ns.tprint("Used RAM: " + used_ram);
  ns.tprint("Total RAM: " + total_ram);
  let servers_to_assign = {};
  let assigned_threads = 0;
  let script_ram = ns.getScriptRam(script);
  if (threads / script_ram + used_ram > total_ram) {
    return;
  }
  for (const [server, server_ram] of Object.entries(servers)) {
    if (assigned_threads == threads) {
      break;
    }
    let free_ram = 0;
    if (server in used_servers) {
      free_ram = server_ram - used_servers[server];
    } else {
      free_ram = server_ram;
    }
    if (free_ram > script_ram) {
      let server_threads = Math.floor(free_ram / script_ram);
      if (server_threads > threads - assigned_threads) {
        server_threads = threads - assigned_threads;
      }
      servers_to_assign[server] = server_threads;
      assigned_threads += server_threads;
      let server_used_ram = server_threads * script_ram;
      used_ram += server_used_ram;
      used_servers[server] = used_servers[server] + server_used_ram;
    }
  }
  ns.tprint("Servers to assign: " + JSON.stringify(servers_to_assign));
  ns.tprint("target: " + target);
  ns.run(
    "/batch_run.js",
    1,
    script,
    target,
    wait_time,
    JSON.stringify(servers_to_assign)
  );
}

/** @param {NS} ns */
function assign_servers_prep(ns, threads, script) {
  let assigned_threads = 0;
  let script_ram = ns.getScriptRam(script);
  if (threads / script_ram + used_ram > total_ram) {
    return;
  }
  for (const [server, server_ram] of Object.entries(servers)) {
    if (assigned_threads == threads) {
      break;
    }
    let free_ram = 0;
    if (server in used_servers) {
      free_ram = server_ram - used_servers[server];
    } else {
      free_ram = server_ram;
    }
    if (free_ram > script_ram) {
      let server_threads = Math.floor(free_ram / script_ram);
      if (server_threads > threads - assigned_threads) {
        server_threads = threads - assigned_threads;
      }
      assigned_threads += server_threads;
      let server_used_ram = server_threads * script_ram;
      used_ram += server_used_ram;
      used_servers[server] = used_servers[server] + server_used_ram;
      ns.exec(script, server, server_threads, target);
    }
  }
}
