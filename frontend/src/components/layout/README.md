# Layout Components Directory

This directory contains component wrappers that define the structure of pages, such as:
- Navigation bars (Navbar)
- Side navigation panels (Sidebar)
- Footers
- Header sections

## Guidelines
- Keep layout structural logic clean and decoupled from business details where possible.
- If layouts require session data (e.g. current user info for Navbar), integrate it via lightweight store calls or custom hooks.
