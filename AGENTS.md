# Instructions for AI assistants

## Production deployment rule

Noelle is deployed directly over SSH. GitHub Actions is not used.

Use `./deploy` from the repository root. It runs pre-deploy checks, syncs
the repository with rsync, and rebuilds the Docker Compose services. Do not
invent a separate manual deployment sequence when this script is available.
Do not deploy unless the user explicitly requests a deployment.

Before changing or operating this project:

1. Read `README.md` for the project purpose and current limitations.
2. Read `docs/server-operations.md` for reusable SSH and rsync patterns.
3. If present, use `docs/server-operations.local.md` for machine-specific
   constants.
4. Never print, copy into documentation, or commit the contents of private SSH
   keys or cloud secrets.
5. Treat server addresses as potentially stale and verify the deployment
   target before running state-changing remote operations.
