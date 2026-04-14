# Hook State Management

## Basics

Hooks have persistent key-value storage scoped by account and namespace.

- **Key**: 32 bytes (uint256)
- **Value**: up to 256 bytes (up to 4,096 with state scale)
- **Namespace**: 32 bytes (uint256), derived from hook's `sfHookNamespace`

## Read Own State

```c
uint8_t value[256];
uint8_t key[32] = { /* your key */ };
int64_t len = state(SBUF(value), SBUF(key));
if (len < 0) {
    // Key doesn't exist or error
}
```

## Write Own State

```c
uint8_t data[64] = { /* your data */ };
uint8_t key[32] = { /* your key */ };
int64_t result = state_set(SBUF(data), SBUF(key));
if (result < 0)
    rollback(SBUF("State write failed"), result);
```

## Delete State Entry

Write zero-length data:

```c
uint8_t key[32] = { /* key to delete */ };
state_set(0, 0, SBUF(key));
```

## Read Foreign State

```c
uint8_t value[256];
uint8_t key[32];
uint8_t namespace_[32];
uint8_t account[20];

int64_t len = state_foreign(
    SBUF(value),        // output buffer
    SBUF(key),          // state key
    SBUF(namespace_),   // hook namespace
    SBUF(account)       // target account
);
```

## Write Foreign State (Requires Grant)

The target account's hook must have granted write access:

```c
int64_t result = state_foreign_set(
    SBUF(data),         // data to write
    SBUF(key),          // state key
    SBUF(namespace_),   // hook namespace
    SBUF(account)       // target account
);
```

## Limits

| Limit | Value |
|-------|-------|
| Key size | 32 bytes (uint256) |
| Default value size | 256 bytes |
| Max value size (with scale) | 4,096 bytes (scale x 256) |
| Max state scale | 16 |
| Max namespaces per account | 256 |

## Patterns

### Counter Pattern
```c
uint8_t key[32] = "counter";
uint8_t buf[8];
state(SBUF(buf), SBUF(key));
int64_t count = INT64_FROM_BUF(buf);
count++;
INT64_TO_BUF(buf, count);
state_set(SBUF(buf), SBUF(key));
```

### Existence Check
```c
uint8_t key[32] = "mykey";
uint8_t tmp[1];
int64_t exists = state(SBUF(tmp), SBUF(key));
if (exists == DOESNT_EXIST) {
    // Key not found
}
```

## Debugging State Write Failures

`state_set()` returns a negative error code on failure but does **not** abort hook execution. If the return value is not checked, the hook may call `accept()` successfully while no state was actually written.

### Symptoms
- Hook returns `accept` message (HookResult=3) but `HookStateChangeCount=0`
- Subsequent hooks reading the state find no entry

### Diagnosis
1. Check `HookStateChangeCount` in `HookExecution` metadata — it should match the expected number of `state_set()` calls
2. Use `account_namespace` RPC to inspect the actual state entries after the transaction
3. Add explicit error checking:

```c
int64_t result = state_set(SBUF(data), SBUF(key));
if (result < 0)
    rollback(SBUF("state_set failed"), result);
```

### Common Causes of Silent Failure
- `RESERVE_INSUFFICIENT (-38)`: Hook account doesn't have enough XRP for the owner reserve required by new state entries
- `TOO_BIG (-3)`: State value exceeds 256 bytes or key exceeds 32 bytes
- `TOO_MANY_STATE_MODIFICATIONS (-44)`: Too many state changes in a single hook execution
- `TOO_MANY_NAMESPACES (-45)`: Account has too many hook namespaces
