# State API

API for persistent state management of Hooks. Functions as a key-value store.

## state

Read local Hook state.

```c
int64_t state(uint32_t write_ptr, uint32_t write_len, uint32_t kread_ptr, uint32_t kread_len);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| write_ptr | uint32_t | Output buffer pointer (0 to return as int64_t) |
| write_len | uint32_t | Output buffer size |
| kread_ptr | uint32_t | Key pointer |
| kread_len | uint32_t | Key size (1-32 bytes) |

**Return Value:**
- Success: Number of bytes read
- write_ptr=0: Value returned as int64_t
- Error: Negative error code

**Error Codes:**
- `DOESNT_EXIST (-5)`: Key does not exist
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `TOO_SMALL (-4)`: Buffer too small, or write_len < 1 when write_ptr != 0
- `TOO_BIG (-3)`: Key > 32 bytes
- `INVALID_ARGUMENT (-7)`: Invalid parameter combination

**Example:**
```c
uint8_t value[256];
int64_t len = state(SBUF(value), "counter", 7);
if (len == DOESNT_EXIST) {
    // Key does not exist
}
```

---

## state_foreign

Read Hook state from a foreign account.

```c
int64_t state_foreign(
    uint32_t write_ptr, uint32_t write_len,
    uint32_t kread_ptr, uint32_t kread_len,
    uint32_t nread_ptr, uint32_t nread_len,
    uint32_t aread_ptr, uint32_t aread_len);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| write_ptr | uint32_t | Output buffer pointer |
| write_len | uint32_t | Output buffer size |
| kread_ptr | uint32_t | Key pointer |
| kread_len | uint32_t | Key size (1-32 bytes) |
| nread_ptr | uint32_t | Namespace pointer (32 bytes, 0 for local) |
| nread_len | uint32_t | Namespace size (0 or 32) |
| aread_ptr | uint32_t | Account ID pointer (20 bytes) |
| aread_len | uint32_t | Account ID size (0 or 20) |

**Return Value:**
- Success: Number of bytes read
- Error: Negative error code

**Error Codes:**
- `DOESNT_EXIST (-5)`: Key does not exist
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `TOO_SMALL (-4)`: Buffer too small, or write_len < 1 when write_ptr != 0
- `TOO_BIG (-3)`: Key > 32 bytes
- `INVALID_ARGUMENT (-7)`: Invalid parameter combination
- `INTERNAL_ERROR (-2)`: Internal error (e.g., key generation failed)

---

## state_set

Set or update local Hook state.

```c
int64_t state_set(uint32_t read_ptr, uint32_t read_len, uint32_t kread_ptr, uint32_t kread_len);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| read_ptr | uint32_t | Value pointer to set |
| read_len | uint32_t | Value size (0 to delete) |
| kread_ptr | uint32_t | Key pointer |
| kread_len | uint32_t | Key size (1-32 bytes) |

**Return Value:**
- Success: read_len
- Error: Negative error code

**Error Codes:**
- `TOO_BIG (-3)`: Key > 32 bytes or value exceeds maximum size
- `TOO_SMALL (-4)`: Key < 1 byte
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `RESERVE_INSUFFICIENT (-38)`: Insufficient account reserve for new state entry
- `TOO_MANY_NAMESPACES (-45)`: Maximum namespace count exceeded
- `TOO_MANY_STATE_MODIFICATIONS (-44)`: State modification count exceeded

**Example:**
```c
// Set state
uint64_t counter = 42;
state_set(&counter, 8, "counter", 7);

// Delete state
state_set(0, 0, "counter", 7);
```

---

## state_foreign_set

Set Hook state on a foreign account (requires authorization).

```c
int64_t state_foreign_set(
    uint32_t read_ptr, uint32_t read_len,
    uint32_t kread_ptr, uint32_t kread_len,
    uint32_t nread_ptr, uint32_t nread_len,
    uint32_t aread_ptr, uint32_t aread_len);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| read_ptr | uint32_t | Value pointer to set (0 to delete) |
| read_len | uint32_t | Value size |
| kread_ptr | uint32_t | Key pointer |
| kread_len | uint32_t | Key size (1-32 bytes) |
| nread_ptr | uint32_t | Namespace pointer (32 bytes, 0 for local) |
| nread_len | uint32_t | Namespace size (0 or 32) |
| aread_ptr | uint32_t | Account ID pointer (20 bytes) |
| aread_len | uint32_t | Account ID size (0 or 20) |

**Return Value:**
- Success: read_len
- Error: Negative error code

**Error Codes:**
- `TOO_BIG (-3)`: Key > 32 bytes or value exceeds maximum size
- `TOO_SMALL (-4)`: Key < 1 byte
- `INVALID_ARGUMENT (-7)`: Invalid parameter combination
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `NOT_AUTHORIZED (-34)`: No access permission (Hook Grant not configured)
- `DOESNT_EXIST (-5)`: Delete target does not exist, or target account does not exist
- `INTERNAL_ERROR (-2)`: Internal error
- `PREVIOUS_FAILURE_PREVENTS_RETRY (-35)`: Retry not allowed due to previous failure
- `TOO_MANY_STATE_MODIFICATIONS (-44)`: State modification count exceeded
- `RESERVE_INSUFFICIENT (-38)`: Insufficient account reserve for new state entry
- `TOO_MANY_NAMESPACES (-45)`: Maximum namespace count exceeded

**Authorization:**
To modify state on a foreign account, a Hook Grant must be configured by a Hook on that account.

**Namespace:**
- 32-byte hash value
- Different namespaces provide separate state storage even for the same Hook
- Specifying 0 (null) uses the local namespace
