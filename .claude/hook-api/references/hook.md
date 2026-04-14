# Hook API

API for retrieving Hook information and managing parameters.

## hook_account

Retrieves the account where the Hook is installed.

```c
int64_t hook_account(uint32_t write_ptr, uint32_t write_len);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| write_ptr | uint32_t | Output buffer pointer (20 bytes) |
| write_len | uint32_t | Output buffer size |

**Return Value:**
- Success: `20` (account ID size)
- Error: Negative error code

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `TOO_SMALL (-4)`: write_len < 20

---

## hook_hash

Retrieves the Hook's hash value.

```c
int64_t hook_hash(uint32_t write_ptr, uint32_t write_len, int32_t hook_no);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| write_ptr | uint32_t | Output buffer pointer (32 bytes) |
| write_len | uint32_t | Output buffer size |
| hook_no | int32_t | Hook index (-1 = current Hook) |

**Return Value:**
- Success: `32` (hash size)
- Error: Negative error code

**Error Codes:**
- `TOO_SMALL (-4)`: write_len < 32
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `INTERNAL_ERROR (-2)`: Failed to retrieve Hook definition
- `DOESNT_EXIST (-5)`: Specified Hook does not exist

---

## hook_again

Requests an additional weak execution (post-processing execution).

```c
int64_t hook_again();
```

**Parameters:** None

**Return Value:**
- `1`: Success
- `ALREADY_SET (-8)`: Already set
- `PREREQUISITE_NOT_MET (-9)`: Not in strong execution

**Usage:**
When called during strong execution (pre-processing), a weak execution will be additionally executed after the transaction is applied.

---

## hook_param

Retrieves a Hook parameter value.

```c
int64_t hook_param(uint32_t write_ptr, uint32_t write_len, uint32_t read_ptr, uint32_t read_len);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| write_ptr | uint32_t | Output buffer pointer |
| write_len | uint32_t | Output buffer size |
| read_ptr | uint32_t | Parameter name pointer |
| read_len | uint32_t | Parameter name size (1-32 bytes) |

**Return Value:**
- Success: Number of bytes written
- Error: Negative error code

**Priority:**
1. Override value set by preceding Hook
2. Parameter value from Hook configuration

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `TOO_SMALL (-4)`: Parameter name < 1 byte
- `TOO_BIG (-3)`: Parameter name > 32 bytes
- `DOESNT_EXIST (-5)`: Parameter does not exist

---

## hook_param_set

Overrides parameters for subsequent Hooks.

```c
int64_t hook_param_set(
    uint32_t read_ptr, uint32_t read_len,
    uint32_t kread_ptr, uint32_t kread_len,
    uint32_t hread_ptr, uint32_t hread_len);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| read_ptr | uint32_t | Parameter value pointer |
| read_len | uint32_t | Parameter value size (0-256 bytes) |
| kread_ptr | uint32_t | Parameter name pointer |
| kread_len | uint32_t | Parameter name size (1-32 bytes) |
| hread_ptr | uint32_t | Target Hook hash pointer |
| hread_len | uint32_t | Hook hash size (must be 32 bytes) |

**Return Value:**
- Success: read_len
- Error: Negative error code

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `TOO_SMALL (-4)`: Parameter name < 1 byte
- `TOO_BIG (-3)`: Parameter name > 32 bytes or parameter value > 256 bytes
- `INVALID_ARGUMENT (-7)`: Hook hash != 32 bytes
- `TOO_MANY_PARAMS (-36)`: Parameter count exceeded (max 16)

---

## hook_skip

Skips execution of a specific Hook in the Hook chain.

```c
int64_t hook_skip(uint32_t read_ptr, uint32_t read_len, uint32_t flags);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| read_ptr | uint32_t | Hook hash pointer |
| read_len | uint32_t | Hook hash size (must be 32 bytes) |
| flags | uint32_t | Operation flag |

**flags:**
- `0`: Add to skip list
- `1`: Remove from skip list

**Return Value:**
- `1`: Success
- Error: Negative error code

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `INVALID_ARGUMENT (-7)`: Hash length != 32 or invalid flags
- `DOESNT_EXIST (-5)`: Hook does not exist in chain (when adding) or not in skip list (when removing)
- `INTERNAL_ERROR (-2)`: Failed to retrieve Hook definition

---

## hook_pos

Retrieves the current position within the Hook chain.

```c
int64_t hook_pos();
```

**Parameters:** None

**Return Value:**
- Position within the Hook chain (0-9)

**Usage:**
Used to determine the position of the currently executing Hook when multiple Hooks are installed.
