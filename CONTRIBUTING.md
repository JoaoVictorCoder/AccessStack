# Contributing to AcessStack

Thanks for your interest in contributing.

## Development setup

1. Fork and clone the repository.
2. Copy env templates:
   - `backend/.env.example` -> `backend/.env`
   - `frontend/.env.example` -> `frontend/.env`
3. Start PostgreSQL (local or Docker).
4. Backend:
   - `cd backend`
   - `npm install`
   - `npm run prisma:generate`
   - `npm run prisma:migrate:dev -- --name init`
   - `npm run seed`
   - `npm run dev`
5. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

## Contribution guidelines

- Keep backward compatibility for HTTP contracts whenever possible.
- Prefer incremental refactors over full rewrites.
- Update `README.md` and `docs/MANUTENCAO.md` when architecture or setup changes.
- Frontend UI guidelines:
  - use ShadCN-based primitives from `frontend/src/components/ui/*`
  - keep styling aligned with the zinc theme tokens in `frontend/src/styles.css`
  - avoid introducing isolated custom CSS when an existing shared component can be reused
- Keep security-sensitive flows stable:
  - authentication
  - check-in validation
  - credential generation (QR/PDF)
  - audit and backup features

## Pull requests

- Describe the problem and the proposed solution.
- Include validation steps (`build`, `tests`, or manual verification).
- Mention any migration or environment changes explicitly.
