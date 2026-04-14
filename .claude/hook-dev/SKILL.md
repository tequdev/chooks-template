---
name: hook-dev
description: |
  Development guide for Xahau Hook WebAssembly smart contracts. Use when:
  (1) Writing new Hook smart contracts in C for the Xahau blockchain
  (2) Implementing state management, transaction emission, or slot-based data access in Hooks
  (3) Understanding Hook execution flow, guard system, and resource limits
  (4) Working with SetHook operations (create, install, update, delete)
  (5) Compiling and testing Hook WASM binaries
  (6) Debugging Hook execution issues
  Complements the hook-api skill which provides API function signatures and error codes.
---

# Hook Smart Contract Development

## Hook Entry Points

Every hook exports two functions:

```c
#include "hookapi.h"

int64_t hook(uint32_t reserved) {
    GUARD(1);
    // Main hook logic - called on matching transactions
    accept(SBUF("OK"), 0);
    return 0;
}

int64_t cbak(uint32_t reserved) {
    GUARD(1);
    // Callback - called when an emitted tx settles
    return 0;
}
```

## Include Files

| File | Purpose |
|------|---------|
| `hookapi.h` | Main include (keylet constants, includes all others) |
| `extern.h` | All 50+ API extern declarations |
| `error.h` | Error codes (45+ codes) |
| `macro.h` | Helper macros (control, buffer, conversion) |
| `sfcodes.h` | Serialized field codes (324 definitions) |
| `tts.h` | Transaction type constants (77 types) |

## Guard System (Mandatory)

Every loop MUST have a guard call. Omitting guards causes WASM rejection.

```c
for (int i = 0; GUARD(10), i < 10; ++i) {
    // loop body
}

// Multiple loops on same line need GUARDM
while (GUARDM(5, 1), condition1) { ... }
while (GUARDM(5, 2), condition2) { ... }
```

## Resource Limits

| Resource | Limit |
|----------|-------|
| WASM binary size | 65,535 bytes |
| Hooks per account | 10 (chain) |
| Parameter key size | 32 bytes |
| Parameter value size | 256 bytes |
| State data size | 256 bytes (up to 4,096 with scale) |
| Namespaces per account | 256 |

## Execution Modes

| Mode | Trigger | Can Rollback | Description |
|------|---------|-------------|-------------|
| Strong | Transaction match | Yes | Pre-apply, can reject tx |
| Weak | `hook_again()` | No | Post-apply, observe only |
| Callback | Emitted tx settles | No | Receives emit result in `cbak()` |

## WASM Compilation

```
C code -> wasmcc -> hook-cleaner -> WASM binary
WAT text -> wat2wasm -> WASM binary
```

## Detailed Guides

| Topic | Reference |
|-------|-----------|
| Hook structure & execution model | [hook-structure.md](references/hook-structure.md) |
| State management patterns | [state-management.md](references/state-management.md) |
| Emitting transactions | [transaction-emission.md](references/transaction-emission.md) |
| Slot-based data access | [slot-system.md](references/slot-system.md) |
| XFL floating-point math | [xfl-arithmetic.md](references/xfl-arithmetic.md) |
| Helper macros reference | [macros-reference.md](references/macros-reference.md) |
| SetHook operations | [sethook-operations.md](references/sethook-operations.md) |
