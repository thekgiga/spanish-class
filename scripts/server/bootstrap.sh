#!/usr/bin/env bash
# Idempotent server bootstrap for a fresh Hetzner Ubuntu 24.04/26.04 VM.
# Runs as root (or via sudo). Safe to re-run.
#
#   curl -fsSL https://raw.githubusercontent.com/<you>/spanish-class/main/scripts/server/bootstrap.sh | sudo bash -s -- <ssh_pubkey_file_or_inline>
#
# Or after `git clone` on the box:
#   sudo bash scripts/server/bootstrap.sh
#
# What it does:
#   1. apt update + unattended-upgrades for security patches
#   2. Create non-root `deploy` user with sudo and an SSH key
#   3. Harden sshd: key-only, non-standard port, no root login
#   4. Install Docker Engine + Compose plugin
#   5. Install ufw, fail2ban, rclone, age
#   6. ufw: deny incoming except 22(custom)+80+443, allow outgoing
#   7. fail2ban: protect sshd
#   8. Create /srv/spanish-class and /opt/backup with right ownership

set -euo pipefail
trap 'echo "[bootstrap] FAILED at line $LINENO"; exit 1' ERR

# ─── Tunables ────────────────────────────────────────────────────────
SSH_PORT="${SSH_PORT:-2222}"                   # non-standard SSH port
DEPLOY_USER="${DEPLOY_USER:-deploy}"
APP_DIR="/srv/spanish-class"
BACKUP_DIR="/opt/backup"
LOG_DIR="/var/log/spanish-class"
PUBKEY_INPUT="${1:-}"                           # path or literal key content

log() { echo -e "\033[1;32m[bootstrap]\033[0m $*"; }

require_root() { [ "$(id -u)" -eq 0 ] || { echo "must run as root"; exit 1; }; }
require_root

# ─── 1. APT + unattended-upgrades ────────────────────────────────────
log "apt update & base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y --no-install-recommends \
  ca-certificates curl gnupg lsb-release \
  ufw fail2ban unattended-upgrades \
  rclone age \
  python3-pip jq htop dnsutils

log "configuring unattended-upgrades"
dpkg-reconfigure --priority=low unattended-upgrades >/dev/null 2>&1 || true
cat >/etc/apt/apt.conf.d/52unattended-upgrades-local <<'EOF'
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "04:00";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
EOF

# ─── 2. Deploy user ──────────────────────────────────────────────────
log "creating user '${DEPLOY_USER}'"
if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  useradd -m -s /bin/bash -G sudo "$DEPLOY_USER"
fi

# ─── 2b. Admin user (console/emergency access with password) ─────────
ADMIN_USER="${ADMIN_USER:-thekgiga}"
log "creating admin user '${ADMIN_USER}'"
if ! id "$ADMIN_USER" >/dev/null 2>&1; then
  useradd -m -s /bin/bash -G sudo "$ADMIN_USER"
fi
echo "${ADMIN_USER} ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/${ADMIN_USER}
chmod 440 /etc/sudoers.d/${ADMIN_USER}
# Copy root's SSH key so this user can also SSH in with a key
mkdir -p /home/${ADMIN_USER}/.ssh
if [ -f /root/.ssh/authorized_keys ]; then
  cp /root/.ssh/authorized_keys /home/${ADMIN_USER}/.ssh/authorized_keys
fi
chown -R ${ADMIN_USER}:${ADMIN_USER} /home/${ADMIN_USER}/.ssh
chmod 700 /home/${ADMIN_USER}/.ssh
chmod 600 /home/${ADMIN_USER}/.ssh/authorized_keys
log "Set a password for '${ADMIN_USER}' after bootstrap: passwd ${ADMIN_USER}"
# Allow sudo without password for docker compose ops
echo "${DEPLOY_USER} ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/${DEPLOY_USER}
chmod 440 /etc/sudoers.d/${DEPLOY_USER}

mkdir -p /home/${DEPLOY_USER}/.ssh
if [ -n "$PUBKEY_INPUT" ]; then
  if [ -f "$PUBKEY_INPUT" ]; then
    cat "$PUBKEY_INPUT" >> /home/${DEPLOY_USER}/.ssh/authorized_keys
  else
    echo "$PUBKEY_INPUT" >> /home/${DEPLOY_USER}/.ssh/authorized_keys
  fi
fi
# Also copy root's authorized_keys (Hetzner injects yours there at create-time)
if [ -f /root/.ssh/authorized_keys ]; then
  cat /root/.ssh/authorized_keys >> /home/${DEPLOY_USER}/.ssh/authorized_keys
fi
sort -u /home/${DEPLOY_USER}/.ssh/authorized_keys -o /home/${DEPLOY_USER}/.ssh/authorized_keys
chown -R ${DEPLOY_USER}:${DEPLOY_USER} /home/${DEPLOY_USER}/.ssh
chmod 700 /home/${DEPLOY_USER}/.ssh
chmod 600 /home/${DEPLOY_USER}/.ssh/authorized_keys

# ─── 3. SSH hardening ────────────────────────────────────────────────
log "hardening sshd — listening on port 22 AND ${SSH_PORT} until you finalize"
SSHD=/etc/ssh/sshd_config
sed -i \
  -e 's/^#\?PermitRootLogin .*/PermitRootLogin no/' \
  -e 's/^#\?PasswordAuthentication .*/PasswordAuthentication no/' \
  -e 's/^#\?PubkeyAuthentication .*/PubkeyAuthentication yes/' \
  -e 's/^#\?ChallengeResponseAuthentication .*/ChallengeResponseAuthentication no/' \
  -e 's/^#\?KbdInteractiveAuthentication .*/KbdInteractiveAuthentication no/' \
  -e 's/^#\?UsePAM .*/UsePAM yes/' \
  "$SSHD"
# Allow password login only for the admin user (needed for Hetzner web console)
cat >> "$SSHD" <<EOF

# Emergency console access — password allowed only for ${ADMIN_USER}
Match User ${ADMIN_USER}
    PasswordAuthentication yes
EOF
# Listen on both port 22 (fallback) and the new port until the user confirms access.
# Remove existing Port lines, then add both.
sed -i '/^#\?Port /d' "$SSHD"
echo -e "Port 22\nPort ${SSH_PORT}" >> "$SSHD"
systemctl restart ssh

# ─── 4. Docker ────────────────────────────────────────────────────────
log "installing Docker Engine"
if ! command -v docker >/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
usermod -aG docker ${DEPLOY_USER}
systemctl enable --now docker

# Limit docker daemon log growth
mkdir -p /etc/docker
cat >/etc/docker/daemon.json <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "5" }
}
EOF
systemctl restart docker

# ─── 5. UFW (defense in depth alongside Hetzner Cloud Firewall) ──────
log "configuring ufw"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp       # kept open until you confirm port 2222 works, then run: ufw delete allow 22/tcp
ufw allow ${SSH_PORT}/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ─── 6. fail2ban (sshd) ──────────────────────────────────────────────
log "configuring fail2ban"
cat >/etc/fail2ban/jail.d/sshd.local <<EOF
[sshd]
enabled = true
port    = ${SSH_PORT}
bantime = 1h
findtime = 10m
maxretry = 5
EOF
systemctl enable --now fail2ban
systemctl restart fail2ban

# ─── 7. App + backup directories ─────────────────────────────────────
log "preparing app directories"
install -d -o ${DEPLOY_USER} -g ${DEPLOY_USER} -m 0755 "$APP_DIR"
install -d -o ${DEPLOY_USER} -g ${DEPLOY_USER} -m 0750 "$BACKUP_DIR"
install -d -o ${DEPLOY_USER} -g ${DEPLOY_USER} -m 0755 "$LOG_DIR"

# Logrotate for our log dir
cat >/etc/logrotate.d/spanish-class <<'EOF'
/var/log/spanish-class/*.log {
  daily
  rotate 14
  compress
  delaycompress
  missingok
  notifempty
  copytruncate
}
EOF

log "DONE."
log "Next steps:"
log "  1) From your laptop, test NEW port:  ssh -p ${SSH_PORT} ${DEPLOY_USER}@<server-ip>"
log "  2) Once confirmed working, close port 22 on the SERVER:"
log "       sudo ufw delete allow 22/tcp"
log "       sudo sed -i '/^Port 22$/d' /etc/ssh/sshd_config && sudo systemctl restart ssh"
log "  3) Also remove port 22 from your Hetzner Cloud Firewall inbound rules."
log "  4) Clone the repo into ${APP_DIR}"
log "  5) Create /srv/spanish-class/.env from config/templates/.env.host.prod.template"
log "  6) Create config/prod/.env from config/templates/.env.prod.template"
log "  7) cd ${APP_DIR} && docker compose pull && docker compose up -d"
