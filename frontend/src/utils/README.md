# Utils Directory

This folder contains helper utility functions. All helpers must be pure functions with zero side-effects.
Examples:
- `cn.ts` - Style merger helper
- `date.ts` - Date parsing and formatting functions
- `format.ts` - Number and currency formatting functions

## Guidelines
- Never put API network requests or routing logic here.
- Write unit tests for custom functions added here since they are pure logic.
