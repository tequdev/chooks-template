# Ledger API

API for retrieving ledger information.

## fee_base

Get the base fee for the current ledger.

```c
int64_t fee_base();
```

**Parameters:** None

**Return Value:**
- Base fee (in drops)

---

## ledger_seq

Get the current ledger sequence number.

```c
int64_t ledger_seq();
```

**Parameters:** None

**Return Value:**
- Ledger sequence number

---

## ledger_last_hash

Get the hash of the parent ledger (previous ledger).

```c
int64_t ledger_last_hash(uint32_t write_ptr, uint32_t write_len);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| write_ptr | uint32_t | Output buffer pointer (32 bytes) |
| write_len | uint32_t | Output buffer size |

**Return Value:**
- Success: `32`
- Error: Negative error code

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `TOO_SMALL (-4)`: write_len < 32

---

## ledger_last_time

Get the close time of the parent ledger.

```c
int64_t ledger_last_time();
```

**Parameters:** None

**Return Value:**
- Unix timestamp (in seconds)

---

## ledger_nonce

Generate a unique nonce.

```c
int64_t ledger_nonce(uint32_t write_ptr, uint32_t write_len);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| write_ptr | uint32_t | Output buffer pointer (32 bytes) |
| write_len | uint32_t | Output buffer size |

**Return Value:**
- Success: `32`
- Error: Negative error code

**Error Codes:**
- `TOO_SMALL (-4)`: write_len < 32
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `TOO_MANY_NONCES (-12)`: Called more than 256 times

**Generation Inputs:**
- Ledger sequence
- Parent ledger timestamp
- Parent ledger hash
- Transaction ID
- Call counter
- Account ID

---

## ledger_keylet

Search for the next keylet within a specified range.

```c
int64_t ledger_keylet(
    uint32_t write_ptr, uint32_t write_len,
    uint32_t lread_ptr, uint32_t lread_len,
    uint32_t hread_ptr, uint32_t hread_len);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| write_ptr | uint32_t | Output buffer pointer (34 bytes) |
| write_len | uint32_t | Output buffer size |
| lread_ptr | uint32_t | Lower bound keylet pointer (34 bytes) |
| lread_len | uint32_t | Lower bound keylet size |
| hread_ptr | uint32_t | Upper bound keylet pointer (34 bytes) |
| hread_len | uint32_t | Upper bound keylet size |

**Return Value:**
- Success: `34` (keylet size)
- Error: Negative error code

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `TOO_SMALL (-4)`: Buffer < 34 bytes
- `TOO_BIG (-3)`: Buffer > 34 bytes
- `INVALID_ARGUMENT (-7)`: Keylet deserialization failed
- `DOES_NOT_MATCH (-40)`: Lower and upper bound keylet types differ
- `DOESNT_EXIST (-5)`: No keylet exists within the range

**Keylet Format:**
- Bytes 0-1: Keylet type (big-endian)
- Bytes 2-33: uint256 key value

**Usage Example:**
```c
// Iterate through account owned objects
uint8_t keylet_lo[34], keylet_hi[34], result[34];

// Set lower and upper bound keylets
// Generate KEYLET_OWNER_DIR using util_keylet

while (ledger_keylet(SBUF(result), SBUF(keylet_lo), SBUF(keylet_hi)) == 34) {
    // Process the keylet in result
    // Update lower bound for next iteration
    memcpy(keylet_lo, result, 34);
}
```
