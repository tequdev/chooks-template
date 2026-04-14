# Control API

API for controlling Hook execution flow.

## _g (Guard Function)

Guard function to prevent infinite loops. Automatically inserted by the compiler.

```c
int32_t _g(uint32_t id, uint32_t maxitr);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | uint32_t | Guard identifier. Upper 16 bits = macro line number, lower 16 bits = source line number |
| maxitr | uint32_t | Maximum number of iterations allowed |

**Return Value:**
- `1`: Continue OK
- `RC_ROLLBACK (-19)`: Guard violation, execution terminated

**Error Codes:**
- `GUARD_VIOLATION (-16)`: Iteration count exceeded

---

## accept

Accept the transaction and terminate Hook execution.

```c
int64_t accept(uint32_t read_ptr, uint32_t read_len, int64_t error_code);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| read_ptr | uint32_t | Pointer to message string (0 for no message) |
| read_len | uint32_t | Message length (maximum 256 bytes) |
| error_code | int64_t | Custom error code |

**Return Value:**
- `RC_ACCEPT (-20)`: Normal termination

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds

**Example:**
```c
accept(SBUF("Transaction accepted"), 0);
```

---

## rollback

Reject the transaction and terminate Hook execution.

```c
int64_t rollback(uint32_t read_ptr, uint32_t read_len, int64_t error_code);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| read_ptr | uint32_t | Pointer to error message (0 for no message) |
| read_len | uint32_t | Message length (maximum 256 bytes) |
| error_code | int64_t | Custom error code |

**Return Value:**
- `RC_ROLLBACK (-19)`: Rollback termination

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds

**Example:**
```c
rollback(SBUF("Insufficient balance"), 1);
```
