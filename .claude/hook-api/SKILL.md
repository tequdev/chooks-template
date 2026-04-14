---
name: hook-api
description: |
  Xahau Hook API reference for WebAssembly smart contract development. Use when:
  (1) Writing or debugging Hook smart contracts
  (2) Understanding Hook API function signatures, parameters, and return values
  (3) Working with Hook state management, slot operations, or transaction emission
  (4) Converting between XFL (floating-point) and integer values
  (5) Accessing ledger data, transaction fields, or account information from Hooks
---

# Xahau Hook API Reference

The Hook API is the interface used by WebAssembly smart contracts (Hooks) running on the Xahau Ledger.

## API Categories

| Category | Description | Reference |
|----------|-------------|-----------|
| Control | Hook execution flow control (accept/rollback) | [control.md](references/control.md) |
| Utility | Address conversion, hashing, signature verification | [utility.md](references/utility.md) |
| STO | Serialized Transaction Object operations | [sto.md](references/sto.md) |
| Emit | Transaction emission | [emit.md](references/emit.md) |
| Float | XFL floating-point arithmetic | [float.md](references/float.md) |
| OTXN | Original transaction information retrieval | [otxn.md](references/otxn.md) |
| Hook | Hook information and parameter management | [hook.md](references/hook.md) |
| Ledger | Ledger information retrieval | [ledger.md](references/ledger.md) |
| State | Persistent state management | [state.md](references/state.md) |
| Slot | Memory slot operations | [slot.md](references/slot.md) |
| Trace | Debug trace output | [trace.md](references/trace.md) |

## Common Error Codes

| Code | Name | Value | Description |
|------|------|-------|-------------|
| SUCCESS | Success | 0 | Completed successfully |
| OUT_OF_BOUNDS | Out of bounds | -1 | Memory access out of bounds |
| INTERNAL_ERROR | Internal error | -2 | Unexpected internal error |
| TOO_BIG | Too big | -3 | Data is too large |
| TOO_SMALL | Too small | -4 | Buffer is too small |
| DOESNT_EXIST | Does not exist | -5 | Requested item does not exist |
| NO_FREE_SLOTS | No free slots | -6 | No available slots |
| INVALID_ARGUMENT | Invalid argument | -7 | Argument is invalid |
| ALREADY_SET | Already set | -8 | Already configured |
| PREREQUISITE_NOT_MET | Prerequisite not met | -9 | Prerequisite condition not satisfied |
| FEE_TOO_LARGE | Fee too large | -10 | Fee is too large |
| EMISSION_FAILURE | Emission failure | -11 | Transaction emission failed |
| TOO_MANY_NONCES | Too many nonces | -12 | Nonce generation limit exceeded |
| TOO_MANY_EMITTED_TXN | Too many emitted transactions | -13 | Emitted transaction limit exceeded |
| NOT_IMPLEMENTED | Not implemented | -14 | Feature not implemented |
| INVALID_ACCOUNT | Invalid account | -15 | Account ID is invalid |
| GUARD_VIOLATION | Guard violation | -16 | Infinite loop guard violation |
| INVALID_FIELD | Invalid field | -17 | Field ID is invalid |
| PARSE_ERROR | Parse error | -18 | Failed to parse data |
| RC_ROLLBACK | Rollback | -19 | Hook execution terminated (rollback) |
| RC_ACCEPT | Accept | -20 | Hook execution terminated (accept) |
| NO_SUCH_KEYLET | No such keylet | -21 | Keylet not found |
| NOT_AN_ARRAY | Not an array | -22 | Object is not an array |
| NOT_AN_OBJECT | Not an object | -23 | Not an object |
| INVALID_FLOAT | Invalid float | -10024 | XFL value is invalid |
| DIVISION_BY_ZERO | Division by zero | -25 | Division by zero |
| XFL_OVERFLOW | Overflow | -30 | XFL arithmetic overflow |
| NOT_AN_AMOUNT | Not an amount | -32 | Not an amount type |
| CANT_RETURN_NEGATIVE | Cannot return negative | -33 | Cannot return negative value |
| NOT_AUTHORIZED | Not authorized | -34 | No access permission |
| TOO_MANY_PARAMS | Too many params | -36 | Parameter limit exceeded |
| INVALID_TXN | Invalid transaction | -37 | Transaction is invalid |
| MEM_OVERLAP | Memory overlap | -43 | Memory regions overlap |

## Quick Reference

### Basic Patterns

**Terminating Hook execution:**
```c
// Terminate with success
accept(SBUF("Success"), 0);

// Terminate with failure
rollback(SBUF("Error message"), 1);
```

**Reading and writing state:**
```c
// Read state
uint8_t value[32];
int64_t len = state(SBUF(value), SBUF(key));

// Write state
state_set(SBUF(data), SBUF(key));
```

**Emitting transactions:**
```c
etxn_reserve(1);  // Reservation required beforehand
// ... Build transaction ...
emit(SBUF(hash), SBUF(txn));
```

## XFL (eXtended Floating point)

Xahau uses XFL format 64-bit floating point:
- Mantissa: 15 digits (10^15 to 10^16-1)
- Exponent: -96 to +80
- Sign: bit 62 (0=negative, 1=positive)

See [float.md](references/float.md) for details.
