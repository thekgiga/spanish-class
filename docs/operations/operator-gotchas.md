# Operator Gotchas — things to know before working with the VM

A living catalogue of "wait, what?" moments and their fixes. Update this any time you hit something that took more than 5 minutes to figure out — future-you will thank present-you.

Each entry has the same shape: **what you'll see, why it happens, how to fix, how to prevent.**

---

## 1. SSH "Connection refused" — your IP rotated

### What you'll see
```
$ ssh -p 2222 deploy@<vm-ip>
ssh: connect to host <vm-ip> port 2222: Connection refused
```

(or `Connection timed out`, which is roughly the same symptom from your end)

### Why
The Hetzner Cloud Firewall restricts SSH to one specific source IP (yours). Many home/office ISPs hand out dynamic IPs that rotate every few hours/days. The moment yours rotates, your access dies.

### Fix (90 seconds)
1. From your Mac: `curl -s https://checkip.amazonaws.com` — note your new IP.
2. Open Hetzner Console → Firewalls → `spanish-class-prod`.
3. Click the IP in the "SSH on new port" rule, replace with the new value.
4. Save — auto-applies. SSH works again immediately.

### Before you panic
Always check your IP **before** assuming the VM is broken. The check from your Mac:
```bash
echo "Current IP: $(curl -s https://checkip.amazonaws.com)"
echo "Firewall has: (check Hetzner console)"
```
If those two values match, the firewall isn't the problem — keep diagnosing.

### Prevent
Two reasonable options:

- **Option A (cheap)** — Accept it. Update the firewall once a week or whenever it bites you. Realistic if your IP rotates infrequently.
- **Option B (proper)** — Add a Cloudflare Tunnel bastion. Then your SSH connection goes through Cloudflare's network and you don't need any IP allowlist. Cost: free. Effort: ~30 min one-time. See [docs/operations/follow-up-work.md](./follow-up-work.md) OP-6.

---

## 2. SSH "Connection refused" — port 2222 not in firewall

### What you'll see
Same symptom as above. To distinguish:
```bash
ssh -v -p 2222 deploy@<vm-ip> 2>&1 | grep "connect to"
```
- `connect to address ... port 2222: Connection refused` → port is closed somewhere
- `Connecting to ...` then hangs for 30+ seconds → packet dropped silently

### Why
Common after fresh setup: someone enabled port 2222 on the **VM's sshd** (or `ssh.socket`) but forgot to open it on the **Hetzner Cloud Firewall**. Two separate firewalls — both must allow it.

### Fix
1. Hetzner Console → Firewalls → `spanish-class-prod` → Inbound rules.
2. Confirm a TCP/2222 rule exists with your IP as source.
3. If missing, **Add rule** → TCP, Port `2222`, Source `<your IP>/32`.
4. Save. Verify the firewall shows "Fully applied" and is attached to the VM under the **Resources** tab.

### Prevent
Whenever you change SSH-port settings on the VM, **mirror the change in the Hetzner firewall in the same session**. Treat them as one operation.

---

## 3. SSH lockout — last-resort access via Hetzner Console

### Use this when
You can't SSH at all, but need to fix the VM. For example: you closed port 22 before testing port 2222 worked, locked yourself out by changing firewall rules incorrectly, or the SSH config is broken.

### How
1. **Hetzner Console → Servers → your server → Console** (top right).
2. A web-based serial console opens in the browser.
3. Log in as `thekgiga` (the admin user we created during bootstrap) with the password you set via `passwd thekgiga`.
4. `sudo -i` to become root.
5. Fix whatever is broken.

### Why this works
The Hetzner web console bypasses the network firewall entirely — it's a virtual KVM. Even if your VM's network is completely cut off, the console works.

### Caveats
- **Slow.** Lag is real, copy/paste is awkward, no proper terminal features.
- **Authentication is by password**, not key — the password for `thekgiga` is the one you set with `passwd thekgiga` right after bootstrap. Keep it in your password manager. Without it, you have no fallback.
- **Use it only for emergency repairs**, not regular ops. Once SSH is fixed, switch back.

---

## 4. Ubuntu 26.04 SSH peculiarities (collected from PR-1 setup)

### `ssh.socket` controls listening ports, not `sshd_config`
On Ubuntu 22.04+ SSH is **socket-activated** — `systemd` opens the listen sockets and hands the file descriptor to `sshd` on connect. This means **the `Port` directive in `/etc/ssh/sshd_config` is ignored**. To change what ports SSH listens on you must edit the socket unit, not the daemon config.

```bash
# Wrong (silently does nothing for new ports):
sed -i 's/^#Port .*/Port 2222/' /etc/ssh/sshd_config

# Right:
sudo mkdir -p /etc/systemd/system/ssh.socket.d/
sudo tee /etc/systemd/system/ssh.socket.d/listen.conf > /dev/null <<'EOF'
[Socket]
ListenStream=
ListenStream=0.0.0.0:2222
ListenStream=[::]:2222
EOF
sudo systemctl daemon-reload
sudo systemctl restart ssh.socket
```

### `ListenStream` without an address binds **IPv6-only**
You'd expect `ListenStream=2222` to bind both IPv4 and IPv6 because `bindv6only=0`. It doesn't. systemd creates separate sockets per family and needs you to be explicit. Always write:
```
ListenStream=0.0.0.0:<port>
ListenStream=[::]:<port>
```
Otherwise `ss -tlnp | grep :2222` shows only `[::]:2222` and IPv4 clients get "connection refused".

### `ChallengeResponseAuthentication` was removed in OpenSSH 9+
Ubuntu 26.04 ships OpenSSH 10.x. Configs that still reference `ChallengeResponseAuthentication` fail `sshd -t` and `sshd` won't restart. Either delete that line or guard it:
```bash
sshd -t -o "ChallengeResponseAuthentication=no" 2>/dev/null \
  && echo "still supported" || echo "removed in this OpenSSH"
```
(The bootstrap script handles this automatically; this is a heads-up if you edit `sshd_config` by hand.)

### Service name: `ssh.service` (24.04) vs `sshd.service` (26.04)
Use:
```bash
# What's actually running?
systemctl is-active ssh sshd 2>/dev/null

# Use whichever returns 'active'
sudo systemctl restart ssh    # or sshd, whichever it is
```
The `ssh.socket` name is the same on both releases.

### `Port` directive must come **before** any `Match` block
A `Match User foo` block extends to end of file. Any `Port` line written *after* it is parsed as inside the match context, which is invalid. If you hand-edit `sshd_config`, put `Port` lines near the top, never at the bottom.

---

## 5. Cloudflare firewall vs Hetzner firewall — two layers

There are **two firewalls** in front of the VM. They serve different purposes and you can hit confusing states if you forget which is which.

| Firewall | Where configured | Filters | Use it for |
|---|---|---|---|
| **Cloudflare** | Cloudflare Dashboard → Security | HTTP(S) traffic to your domain | WAF rules, rate limits, bot protection, DDoS |
| **Hetzner Cloud Firewall** | Hetzner Console → Firewalls | All TCP/UDP traffic to VM IP | SSH allowlist, port whitelisting, blocking direct-to-IP traffic |

### Common gotchas
- **Cloudflare** rules only matter when traffic comes through `<your-domain>`. Direct `<vm-ip>` access bypasses Cloudflare entirely. That's why we also tighten Hetzner port 443 to Cloudflare IP ranges after DNS is live.
- **Hetzner** rules apply to all traffic regardless of hostname. SSH, HTTP, HTTPS — everything.
- **Changes to Hetzner Cloud Firewall apply within seconds.** Cloudflare WAF rule changes propagate in 1-2 minutes.

### Quick test: which one is blocking?
From your Mac:
```bash
# Test direct VM IP — exercises Hetzner firewall
curl -I --resolve "<your-domain>:443:<vm-ip>" https://<your-domain>/health

# Test via Cloudflare — exercises both
curl -I https://<your-domain>/health
```

If first one works and second doesn't, Cloudflare is the issue. If first one fails too, Hetzner is the issue.

---

## 6. Docker on a fresh Ubuntu 26.04 — repo codename mismatch

### What you'll see
```
$ apt-get install -y docker-ce
E: Unable to locate package docker-ce
```

### Why
Docker publishes packages per Ubuntu codename. Ubuntu 26.04 codename is `resolute`. Docker's package server may not have a `resolute` release yet (same lag we saw with `noble` when 24.04 launched). The bootstrap script handles this — but if you set up Docker by hand, you'd hit this.

### Fix
Use the previous LTS codename as fallback:
```bash
# Instead of $(lsb_release -cs) which returns "resolute"
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu noble stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Periodically check `https://download.docker.com/linux/ubuntu/dists/` — switch back to `resolute` once it's listed.

---

## 7. Pre-flight checklist before connecting to the VM

Quick mental check before you SSH:

1. **Am I on the same IP the firewall expects?**
   `curl -s https://checkip.amazonaws.com` ↔ Hetzner firewall rule.
2. **Is my SSH key still in `~/.ssh/id_ed25519`?**
   If you re-generated keys, the VM doesn't know about the new one.
3. **Did the VM reboot?**
   Look at "Uptime" in Hetzner Console. After reboot, `docker compose up -d` doesn't run automatically unless you set the systemd unit (we did).

### Useful one-liners
```bash
# Quick health check from my Mac
MYIP=$(curl -s https://checkip.amazonaws.com)
echo "My IP: $MYIP — make sure Hetzner firewall has this"

# Open an SSH session
ssh -p 2222 deploy@<vm-ip>

# Open a quick MySQL tunnel (port 3307 locally, 3306 on VM)
ssh -N -L 3307:localhost:3306 -p 2222 deploy@<vm-ip> &

# Tail prod backend logs from my laptop
ssh -p 2222 deploy@<vm-ip> 'cd /srv/spanish-class && docker compose logs -f --tail=200 backend'
```

---

## 8. The order in which to close port 22 (and not lock yourself out)

This sequence prevents lockout if something is misconfigured:

1. **Add port 2222 to ssh.socket + ufw + Hetzner firewall** (don't remove 22 yet).
2. **From your Mac**, verify port 2222 works:
   `ssh -p 2222 deploy@<vm-ip> hostname` should print the VM hostname.
3. **Only then**, remove port 22 from ssh.socket override:
   `sudo sed -i '/ListenStream=.*:22$/d' /etc/systemd/system/ssh.socket.d/listen.conf`
   `sudo systemctl daemon-reload && sudo systemctl restart ssh.socket`
4. **Verify port 2222 still works from your Mac.**
5. Remove port 22 from ufw: `sudo ufw delete allow 22/tcp && sudo ufw reload`.
6. Remove port 22 from Hetzner firewall.
7. **Final verification from your Mac**:
   - `ssh -p 22 deploy@<vm-ip>` → should fail
   - `ssh -p 2222 deploy@<vm-ip>` → should work

Each step is verifiable before the next. If you skip the verifications and one of the steps has a typo, the Hetzner web console (Gotcha #3) is your only way back in.

---

## 9. Adding a second person who needs SSH access

Workflow:
1. New person sends you their **public** SSH key (`~/.ssh/id_ed25519.pub`).
2. On the VM:
   ```bash
   sudo -u deploy bash -c 'echo "ssh-ed25519 AAAA... them@laptop" >> /home/deploy/.ssh/authorized_keys'
   sudo chmod 600 /home/deploy/.ssh/authorized_keys
   ```
3. Add their public IP to the Hetzner firewall port 2222 rule (or use Cloudflare Tunnel — better long-term).
4. They test: `ssh -p 2222 deploy@<vm-ip>`.

To revoke: remove their key line from `/home/deploy/.ssh/authorized_keys` and remove their IP from the Hetzner firewall.

---

## 10. The Hetzner snapshot — instant revert button

Before doing anything risky on the VM, take a snapshot:
1. Hetzner Console → Servers → your server → Snapshots → **Take Snapshot**.
2. Costs ~€0.01/GB/month while it exists.
3. To revert: select snapshot → Rebuild server.

Use before:
- Major Ubuntu upgrades
- Manual MySQL surgery
- Anything in a `docs/operations/incident-response.md` Section C ("suspected breach") branch

Delete the snapshot when you're confident the change worked. Don't accumulate them — they're not a substitute for the daily B2 backups.
