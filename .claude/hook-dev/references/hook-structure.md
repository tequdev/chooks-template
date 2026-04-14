# Hook Structure & Execution Model

## Entry Points

```c
// Main hook - called when a matching transaction arrives
int64_t hook(uint32_t reserved) {
    accept(SBUF("Success"), 0);  // approve tx
    return 0;
}

// Callback - called when an emitted transaction settles
int64_t cbak(uint32_t reserved) {
    return 0;
}
```

Both must be exported. `hook()` is required; `cbak()` can be a no-op stub.

## Execution Modes

### Strong Execution (Default)
- Runs BEFORE transaction is applied to ledger
- Can `accept()` (approve) or `rollback()` (reject) the transaction
- State changes persist only if accepted
- Flag: `hefSTRONG`

### Weak Execution
- Runs AFTER transaction is applied
- Triggered by calling `hook_again()` during strong execution
- Cannot rollback -- observe only
- Useful for logging, notifications, secondary state updates

### Callback Execution
- `cbak()` is called when a previously emitted transaction settles
- Flag: `hefCALLBACK`
- Use `otxn_type()` and `meta_slot()` to inspect the result

## Guard System

All loops require guards to prevent infinite execution:

```c
// Standard for-loop
for (int i = 0; GUARD(100), i < 100; ++i) {
    // body
}

// While loop
int count = 0;
while (GUARD(50), count < 50) {
    count++;
}

// Multiple loops on same source line
for (int i = 0; GUARDM(10, 1), i < 10; ++i) { ... }
for (int j = 0; GUARDM(10, 2), j < 10; ++j) { ... }
```

Guard ID is computed as `(1ULL << 31) + __LINE__`. Use `GUARDM(max, n)` for disambiguation.

## Control Flow

```c
// Approve transaction and end hook execution
accept(SBUF("Approved"), 0);       // with message
accept(0, 0, 0);                   // minimal

// Reject transaction and end hook execution
rollback(SBUF("Rejected"), 1);     // with message and error code

// Convenience macros
DONEEMPTY();           // accept("", 0)
DONEMSG("OK");         // accept("OK", 0)
ASSERT(condition);     // rollback if false
NOPE("reason");        // rollback("reason", -1)
```

## HookOn Bitmask

Controls which transaction types trigger the hook. Each bit corresponds to a transaction type:
- Bit = 0: trigger hook for this tx type
- Bit = 1: skip hook for this tx type

Default `sfHookOn` = 0 means trigger on ALL transaction types.

## Hook Chain

- Up to 10 hooks per account (positions 0-9)
- `hook_pos()` returns current position in chain
- Hooks execute in order; each can accept or rollback independently

## Inter-Hook Communication

```c
// Override parameter for a subsequent hook in chain
hook_param_set(SBUF(value), SBUF(key), SBUF(target_hook_hash));

// Skip a specific hook's execution
hook_skip(SBUF(hook_hash), 1);   // 1=skip, 0=unskip
```

## Transactional Stake Holders (TSH)

TSH determines which accounts' hooks fire for a transaction:

| Flag | Value | Behavior |
|------|-------|----------|
| tshNONE | 0b000 | No TSH |
| tshROLLBACK | 0b001 | Can rollback tx |
| tshCOLLECT | 0b010 | Collect mode (observe) |
| tshMIXED | 0b100 | Mixed mode |

## HookContext (Server-Side)

The runtime context contains:
- **Slot map**: numbered slots holding serialized objects
- **Nonce counters**: for emit and ledger nonces
- **Guard map**: tracks iteration counts per guard ID
- **State map**: 3-level nested map (account -> namespace -> key -> value)
- **Emit queue**: pending emitted transactions
- **Result**: exit type, reason, code, instruction count
