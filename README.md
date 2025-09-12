# Visual Ansible EE Builder 

UI for generating Ansible Execution Environment files.

**No builds. No pushes. No creds.**

---

## 🚀 What it does
- Pick a **base image**, add **collections / Python packages / RPMs**.
- See **YAML preview** → **Export** files.
- Start from **empty** and still get valid outputs.

## 🧯 What it *doesn’t* (yet)
- Run `ansible-builder` for you.
- Push images to registries.
- Handle Red Hat credentials.

---

## 🧱 Base images (Option A lineup)

1. **Recommended (no entitlement)** — `registry.access.redhat.com/ubi9/python-311`  
   *RHEL‑like, Python preinstalled → fastest to green.*

2. **Supported 🔒 (requires entitlement)** — `registry.redhat.io/ansible-automation-platform-25/ee-minimal-rhel9:latest`  
   *Official AAP base. Requires `podman login registry.redhat.io` on the build machine.*

3. **Custom (power users)** — any `<registry>/<namespace>/<name>:<tag>`  
   *If not RHEL/UBI‑like, RPM installs may be disabled to avoid pkg‑mgr issues.*

---

## ⏱️ 30‑Second Quick Start
1. Choose a base image.  
2. Add collections / Python / (optional) RPMs.  
3. Review the **YAML preview**.  
4. **Export** files.  
5. Build locally:

```bash
ansible-builder build -t quay.io/<org>/<name>:<tag> -f execution-environment.yml --container-runtime podman

# optional
podman push quay.io/<org>/<name>:<tag>
```

---

## 📦 Files you’ll get
```
execution-environment.yml
requirements.yml
requirements.txt
bindep.txt   # only if you added RPMs
```

---

## ✅ Guardrails
- Empty lists are **OK** → files still valid.  
- Image ref sanity check (format like `quay.io/org/name:tag`).  
- RPMs **off by default**; enabled only when you add them (and when base supports it).

---

## 🧪 Troubleshooting (super short)
- **`registry.redhat.io` pull fails** → run `podman login registry.redhat.io`.  
- **Missing Python at build** → use **UBI Python 3.11** base or install Python in your Containerfile.  
- **`dnf` vs `microdnf`** → UBI minimal uses `microdnf`; standard UBI/AAP use `dnf`.  
- **Custom base quirks** → non‑RHEL bases may not support RPM installs.

---

## 🗺️ Roadmap (post‑MVP)
- Optional backend to run `ansible-builder` + stream logs.  
- Preflight checks (auth, base pullability, pkg‑mgr detection).  
- Team templates, org RBAC, audit history.

---

## 🔐 Security & Privacy
- No credential collection.  
- Files are generated client‑side and downloaded to your machine.
