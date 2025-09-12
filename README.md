# Visual EE Builder — Generate Ansible Execution Environment files

**Status:** Public alpha — this MVP **generates files only** (`execution-environment.yml`, `requirements.yml`, `requirements.txt`, `bindep.txt`). It does **not** build or push images yet.

---

## What this does
- A simple UI to choose a **base image** and add **Ansible collections**, **Python packages**, and optional **system packages**.
- Live **file preview** and **Export** so you can run `ansible-builder` yourself.
- Sensible defaults so a user can start from **empty selections** and still get valid files.

## What this does *not* do (yet)
- No `ansible-builder` execution from the app.
- No image push to registries.
- No credentials collection (e.g., Red Hat or quay).

---

## Base images 

### 1) **Recommended (no entitlement)** — UBI9 Python 3.11
- **Why:** RHEL‑like environment with Python preinstalled; no subscription required to pull from the access registry.
- **Good for:** fastest path to a working EE for demos and RHEL‑compatible builds.
- **Image:** `registry.access.redhat.com/ubi9/python-311`

### 2) **Advanced (requires entitlement)** — AAP EE minimal (RHEL 9)
- **Why:** official Ansible Automation Platform base; best fit when integrating with Automation Controller/Private Automation Hub.
- **Good for:** organizations already authenticated to `registry.redhat.io`.
- **Requires:** `podman login registry.redhat.io` on the build machine (subscription/entitlement).
- **Image:** `registry.redhat.io/ansible-automation-platform-25/ee-minimal-rhel9:latest`

### 3) **Custom base (free text input)** — any OCI reference
- **Format:** `<registry>/<namespace>/<name>:<tag>` (e.g., `quay.io/org/ee:1.0`).
- **Note:** If the base is **not** RHEL/UBI‑like, the app may **disable system packages** (RPMs) by default to avoid `dnf/microdnf` issues during downstream builds.
- 
---

## Files this app generates

```
execution-environment.yml
requirements.yml
requirements.txt
bindep.txt 
```

### `execution-environment.yml` (example scaffold)
```yaml
version: 3

images:
  base_image:
    name: <chosen-base-image>

dependencies:
  galaxy: requirements.yml
  python: requirements.txt
  # 'system: bindep.txt' is added only if you specified system packages

# Optional additional steps – enable via UI if desired
# additional_build_steps:
#   prepend_base:
#     - RUN dnf -y update && dnf clean all
#   append_final:
#     - RUN whoami
```

### `requirements.yml` (example)
```yaml
---
collections:
  - name: ansible.posix
    version: ">=1.5.4"
  # Add more collections here
```

### `requirements.txt` (example)
```
# Python packages for your EE
requests>=2.28.0
pyyaml>=6.0
```

### `bindep.txt` (example; only if you added system packages)
```
# One RPM per line (RHEL/UBI package names)
git
gcc
python3-devel
```

---

## How to build locally with `ansible-builder`

1) Ensure you can pull the base image you selected.
   - For **Advanced** AAP base: `podman login registry.redhat.io`
2) From the exported files directory, run:

```bash
ansible-builder build -t quay.io/<org>/<name>:<tag>   -f execution-environment.yml   --container-runtime podman
```

Then (optional) push:
```bash
podman push quay.io/<org>/<name>:<tag>
```

---

## Validation & safeguards (MVP)

- **Empty states:** All lists can be empty. The app still outputs valid files.
- **YAML preview:** Always available before export.
- **Image/tag checks:** Basic validation to prevent obviously invalid names (e.g., require `<registry>/<repo>:<tag>` format).
- **System packages:** Off by default; added only if you include RPMs. If the base is not RHEL/UBI‑like, the UI may disable system packages.

---

## Known limitations

- No build/push inside the app.
- No streaming logs or job history.
- No automatic version pinning for collections or Python dependencies.
- No per‑base preflight (e.g., entitlement checks) inside the UI.

---

## Troubleshooting

- **Pull/auth errors on Advanced image** → run `podman login registry.redhat.io` on the machine where you will build.
- **Missing Python during build** → choose the UBI Python base; or install Python in your own Dockerfile/Containerfile.
- **`dnf` vs `microdnf`** → UBI **minimal** uses `microdnf`; standard UBI and AAP bases use `dnf`. If you rely on system packages, ensure the right package manager is available in your base.
- **Custom base quirks** → non‑RHEL bases may not support RPM installs; keep `bindep.txt` empty or switch to a RHEL/UBI‑like base.

---

## Roadmap (post‑MVP)

- Optional backend that runs `ansible-builder` and streams logs.
- Preflight checks (registry auth, base pullability, pkg‑mgr detection).
- Template library (e.g., Telco/Network, DevSecOps, SAP).
- Team features: save/share templates, org RBAC, audit history.
- One‑click push to Private Automation Hub.

---

## Security & privacy

- This MVP does **not** collect or store registry credentials.
- All files are generated client‑side and downloaded to your machine.

---

## License

MIT (or your preferred OSS license).
