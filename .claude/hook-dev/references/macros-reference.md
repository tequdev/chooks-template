# Hook Helper Macros Reference

Source: `hook/macro.h`

## Control Flow

| Macro | Expands To | Purpose |
|-------|-----------|---------|
| `DONEEMPTY()` | `accept("", 0, 0)` | Accept with empty message |
| `DONEMSG(msg)` | `accept(msg, sizeof(msg), 0)` | Accept with message |
| `DONE(x)` | `accept(&x, sizeof(x), 0)` | Accept with variable |
| `ASSERT(x)` | rollback if `!x` | Assert condition or rollback |
| `NOPE(x)` | `rollback(x, sizeof(x), -1)` | Rollback with message |

## Guards

| Macro | Purpose |
|-------|---------|
| `GUARD(maxiter)` | Loop guard: `_g((1ULL << 31) + __LINE__, maxiter)` |
| `GUARDM(maxiter, n)` | Named guard for multiple loops on same line |

## Buffer Helpers

| Macro | Purpose |
|-------|---------|
| `SBUF(str)` | `str, sizeof(str)` -- pointer + size pair |
| `SVAR(x)` | `&x, sizeof(x)` -- address + size pair |
| `CLEARBUF(b)` | Zero-fill buffer |

## STO Result Extraction

| Macro | Purpose |
|-------|---------|
| `SUB_OFFSET(x)` | Upper 32 bits of sto_subfield result (byte offset) |
| `SUB_LENGTH(x)` | Lower 32 bits of sto_subfield result (byte length) |

## Integer Conversion (Big-Endian)

| Write | Read |
|-------|------|
| `UINT16_TO_BUF(buf, val)` | `UINT16_FROM_BUF(buf)` |
| `UINT32_TO_BUF(buf, val)` | `UINT32_FROM_BUF(buf)` |
| `UINT64_TO_BUF(buf, val)` | `UINT64_FROM_BUF(buf)` |
| `INT64_TO_BUF(buf, val)` | `INT64_FROM_BUF(buf)` |

### WARNING: Variable Shadowing in `*_TO_BUF` Macros

All `*_TO_BUF` macros (`UINT8_TO_BUF`, `UINT16_TO_BUF`, `UINT32_TO_BUF`, `UINT64_TO_BUF`, `INT64_TO_BUF`, `BYTES20_TO_BUF`, `BYTES32_TO_BUF`) internally declare `unsigned char *buf = (unsigned char *)buf_raw;`. If the caller passes a variable named `buf` as the first argument, the internal `buf` shadows the caller's variable. Under aggressive optimization (Zig `-Oz` + wasm-opt), this causes **WASM traps at runtime** — the hook crashes silently with `HookResult=1` and an empty `HookReturnString`.

**Bad — will crash:**
```c
uint8_t buf[8];
INT64_TO_BUF(buf, value);      // 'buf' shadows macro-internal 'buf'
state_set(SBUF(buf), SBUF(key)); // reads garbage or traps
```

**Good — use descriptive names:**
```c
uint8_t bal_val[8];
INT64_TO_BUF(bal_val, value);      // no shadowing
state_set(SBUF(bal_val), SBUF(key)); // works correctly
```

**Rule:** Never pass a variable named `buf` to `*_TO_BUF` macros. Use purpose-specific names like `bal_val`, `counter_data`, `bp_val`, etc.

Note: `*_FROM_BUF` macros (expression-style, no internal variable declaration) are not affected.

## Buffer Operations

| Macro | Purpose |
|-------|---------|
| `BUFFER_EQUAL_1(a, b)` | Compare 1 byte |
| `BUFFER_EQUAL_8(a, b)` | Compare 8 bytes |
| `BUFFER_EQUAL_20(a, b)` | Compare 20 bytes (AccountID) |
| `BUFFER_EQUAL_32(a, b)` | Compare 32 bytes (uint256) |
| `BUFFER_EQUAL_GUARD(out, a, b, len, n)` | Guarded arbitrary-length compare |
| `BUFFER_SWAP(x, y)` | Swap two buffer pointers |
| `ACCOUNT_COMPARE(a, b)` | Compare AccountIDs: -1, 0, or 1 |
| `BYTES20_TO_BUF(dst, src)` | Copy 20-byte buffer |
| `BYTES32_TO_BUF(dst, src)` | Copy 32-byte buffer |

## Endianness

| Macro | Purpose |
|-------|---------|
| `FLIP_ENDIAN_16(x)` | Swap bytes of uint16 |
| `FLIP_ENDIAN_32(x)` | Swap bytes of uint32 |
| `FLIP_ENDIAN_64(x)` | Swap bytes of uint64 |

## Amount Conversion

| Macro | Purpose |
|-------|---------|
| `AMOUNT_TO_DROPS(buf)` | Convert serialized Amount field to XRP drops |

## Tracing (Debug)

| Macro | Purpose |
|-------|---------|
| `TRACEVAR(v)` | Trace variable value |
| `TRACEHEX(v)` | Trace data as hex |
| `TRACEXFL(v)` | Trace XFL float value |
| `TRACESTR(v)` | Trace string |

## Keylet Constants

| Constant | Value | Target |
|----------|-------|--------|
| `KEYLET_HOOK` | 1 | Account hook |
| `KEYLET_HOOK_STATE` | 2 | Hook state entry |
| `KEYLET_ACCOUNT` | 3 | Account root |
| `KEYLET_AMENDMENTS` | 4 | Amendments |
| `KEYLET_FEES` | 7 | Fee settings |
| `KEYLET_LINE` | 9 | Trust line |
| `KEYLET_OFFER` | 10 | Offer |
| `KEYLET_OWNER_DIR` | 18 | Owner directory |
| `KEYLET_ESCROW` | 20 | Escrow |
| `KEYLET_PAYCHAN` | 21 | Payment channel |
| `KEYLET_HOOK_DEFINITION` | 24 | Hook definition |
| `KEYLET_HOOK_STATE_DIR` | 25 | Hook state directory |
| `KEYLET_CRON` | 26 | Cron |

## Account/Amount Type Constants

**Account types** (for otxn_field with account fields):
atACCOUNT(1), atOWNER(2), atDESTINATION(3), atISSUER(4), atAUTHORIZE(5), atUNAUTHORIZE(6), atTARGET(7), atREGULARKEY(8), atPSEUDOCALLBACK(9)

**Amount types** (for otxn_field with amount fields):
amAMOUNT(1), amBALANCE(2), amLIMITAMOUNT(3), amTAKERPAYS(4), amTAKERGETS(5), amLOWLIMIT(6), amHIGHLIMIT(7), amFEE(8), amSENDMAX(9), amDELIVERMIN(10), amMINIMUMOFFER(16), amRIPPLEESCROW(17), amDELIVEREDAMOUNT(18)
