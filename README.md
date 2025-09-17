# Visual Ansible EE Builder 

Visual builder for Ansible Execution Environments. Create an EE freaky fast — without fighting YAML, dependencies, or base-image gotchas.

![Visusl EE Builder](img/dashboard.png "Screenshow of EE builder")


## 🚀 What it does
- Start from **EE presets** (Basic, Network, Cloud, Security) or from scratch.
- Pick a **base image**, add **collections / Python packages / RPMs**.
- Export a ready-to-build package.
- Save and reuse your own presets.  

## 🧯 What it *doesn’t* (yet)
- Run `ansible-builder` for you.
- Push images to registries.
- Manage Red Hat entitlements or credentials.

## 🧩 Presets
Presets give you a **known working** execution environment & dependencies. You can use them as-is or tweak them.

- **Basic Automation** → minimal setup for running playbooks (posix + requests + openssh-clients).  
- **Network Automation** → SSH/NETCONF ready (ansible.netcommon, netmiko, paramiko, ncclient).  
- **Cloud Automation** → lightweight cloud SDKs (azure, boto3, google-auth).
- **Container Orchestration** → Kubernetes, Docker & OpenShift collections, Container SDKs.  
- **Security & Compliance** → crypto + hardening (community.crypto, devsec.hardening, cryptography).  

## 🧱 Base images (built-in lineup)

1. **UBI Python 3.11 (recommended)** — `registry.access.redhat.com/ubi9/python-311`  
   *Free, RHEL-like, Python preinstalled → smoothest builds.*  

2. **AAP EE Minimal (requires entitlement)** — `registry.redhat.io/ansible-automation-platform-25/ee-minimal-rhel9:latest`  
   *Official AAP base. Requires `podman login registry.redhat.io` on the build machine.*  

3. **Custom** — any `<registry>/<namespace>/<name>:<tag>`  
   *If not RHEL/UBI-like, RPM installs may fail due to missing package managers.*  

## ⏱️ Quick Start
1. Pick a base image (or preset).  
2. Add collections / Python deps / RPMs.  
3. Export the build package & create your EE:  

```bash
ansible-builder build -t quay.io/<org>/<name>:<tag> -f execution-environment.yml --container-runtime podman

# optional
podman push quay.io/<org>/<name>:<tag>
```

## 📦 Files you’ll get
```
execution-environment.yml
requirements.yml
requirements.txt
bindep.txt    # only if you added RPMs
build.sh      # build script to run
```

## ✅ Guardrails
- Empty lists are **OK** → files still valid.  
- Image ref sanity check (format like `quay.io/org/name:tag`).
- Clear warnings for subscription-only RPMs.
- RPMs **off by default**; enabled only when you add them (and when base supports it).

## 🧪 Troubleshooting
- **`registry.redhat.io` pull fails** → run `podman login registry.redhat.io`.  
- **Missing Python at build** → use **UBI Python 3.11** base or install Python in your Containerfile.  
- **`dnf` vs `microdnf`** → UBI minimal uses `microdnf`; standard UBI/AAP use `dnf`.  
- **Custom base quirks** → non‑RHEL bases may not support RPM installs.

## 🗺️ Roadmap (post‑MVP)
- Optional backend to run `ansible-builder` + stream logs.  
- Preflight checks (auth, base pullability, pkg‑mgr detection).  
- Team templates, org RBAC, audit history.

## 🔐 Security & Privacy
- No credential collection.  
- Files are generated client‑side and downloaded to your machine.
