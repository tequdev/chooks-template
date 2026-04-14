# Trace API

Debug trace output API. Output is only produced when trace log level is enabled.

## trace

Output a message and data to trace log.

```c
int64_t trace(uint32_t mread_ptr, uint32_t mread_len, uint32_t dread_ptr, uint32_t dread_len, uint32_t as_hex);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| mread_ptr | uint32_t | Pointer to message string |
| mread_len | uint32_t | Message length (max 128 bytes) |
| dread_ptr | uint32_t | Pointer to data buffer |
| dread_len | uint32_t | Data length (max 1023 bytes) |
| as_hex | uint32_t | Hex output flag (non-zero for hex output) |

**Return Value:**
- Always `0`

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds

**Notes:**
- UTF-16LE encoding is automatically decoded
- No output is produced when trace logging is disabled

---

## trace_num

Output a message and integer value to trace log.

```c
int64_t trace_num(uint32_t read_ptr, uint32_t read_len, int64_t number);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| read_ptr | uint32_t | Pointer to message string |
| read_len | uint32_t | Message length (max 128 bytes) |
| number | int64_t | Integer value to output |

**Return Value:**
- Always `0`

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds

**Example:**
```c
trace_num(SBUF("Counter value"), counter);
```

---

## trace_float

Output a message and XFL value to trace log.

```c
int64_t trace_float(uint32_t read_ptr, uint32_t read_len, int64_t float1);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| read_ptr | uint32_t | Pointer to message string |
| read_len | uint32_t | Message length (max 128 bytes) |
| float1 | int64_t | XFL value to output |

**Return Value:**
- Always `0`

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds

**Output Format:**
- `Float mantissa*10^(exponent)`
- float1=0: `Float 0*10^(0) <ZERO>`
- Invalid XFL: `Float <INVALID>`

**Example:**
```c
int64_t amount = float_set(6, 1000000);  // 1.0
trace_float(SBUF("Amount"), amount);
// Output: "Amount: Float 1000000000000000*10^(-15)"
```

---

## meta_slot

Load transaction metadata into a slot.

```c
int64_t meta_slot(uint32_t slot_into);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| slot_into | uint32_t | Slot number (0 = auto-assign) |

**Return Value:**
- Success: The assigned slot number
- Error: Negative error code

**Error Codes:**
- `PREREQUISITE_NOT_MET (-9)`: Metadata is not available
- `INVALID_ARGUMENT (-7)`: slot_into > 255
- `NO_FREE_SLOTS (-6)`: No free slots available

**Notes:**
- Retrieves metadata (AffectedNodes, etc.) after transaction processing
- Used during weak execution

---

## xpop_slot

Load inner transaction and metadata from an Import transaction into slots.

```c
int64_t xpop_slot(uint32_t slot_into_tx, uint32_t slot_into_meta);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| slot_into_tx | uint32_t | Slot number for transaction (0 = auto-assign) |
| slot_into_meta | uint32_t | Slot number for metadata (0 = auto-assign) |

**Return Value:**
- Success: `(slot_into_tx << 16) + slot_into_meta`
- Error: Negative error code

**Error Codes:**
- `PREREQUISITE_NOT_MET (-9)`: Not a ttIMPORT transaction
- `INVALID_ARGUMENT (-7)`: Slot number > 255 or both are the same non-zero value
- `NO_FREE_SLOTS (-6)`: Not enough free slots (2 required)
- `INVALID_TXN (-37)`: Failed to retrieve InnerTxn/metadata

**Notes:**
- Exclusive to ttIMPORT (Import transaction)
- Retrieves inner transaction information during cross-chain import

**Example:**
```c
int64_t result = xpop_slot(0, 0);
if (result > 0) {
    uint32_t tx_slot = result >> 16;
    uint32_t meta_slot = result & 0xFFFF;
    // Process inner transaction and metadata
}
```
