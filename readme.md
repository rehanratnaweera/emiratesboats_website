# Emirates Boats Interactive 3D Showcase

A high-performance, containerized web application built to render interactive 3D marine models using React, Vite, and Three.js. 

## Architecture & DevOps

This repository serves as a fully automated GitOps pipeline, demonstrating secure, zero-downtime deployments to an on-premise server.

* **CI/CD Pipeline**: GitHub Actions automatically lints, builds, and publishes production-ready Docker images to the GitHub Container Registry (GHCR).
* **Automated Versioning**: `semantic-release` analyzes Conventional Commits to automatically generate version bumps and changelogs.
* **GitOps Deployment**: An on-premise Watchtower instance securely polls GHCR, automatically pulling and reconciling the Nginx container state without exposing inbound firewall ports.

## Frontend Optimization

* **Vite & Rollup**: Configured with custom vendor chunking to isolate the heavy Three.js rendering engine, maximizing browser cache efficiency for recurring visitors.
* **Developer Guardrails**: Enforced repository standards using local Husky hooks and Commitlint.

## Local Development

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm run dev