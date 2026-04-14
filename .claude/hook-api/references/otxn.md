# OTXN API

API for retrieving information about the originating transaction (the transaction that triggered the Hook).

## otxn_burden

Get the burden value of the originating transaction.

```c
int64_t otxn_burden();
```

**Parameters:** None

**Return Value:**
- Normal transaction: `1`
- Emit transaction: sfEmitBurden value

---

## otxn_generation

Get the generation of the originating transaction.

```c
int64_t otxn_generation();
```

**Parameters:** None

**Return Value:**
- Normal transaction: `0`
- Emit transaction: sfEmitGeneration value

---

## otxn_field

Get a specific field from the originating transaction.

```c
int64_t otxn_field(uint32_t write_ptr, uint32_t write_len, uint32_t field_id);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| write_ptr | uint32_t | Output buffer pointer (0 to return int64_t) |
| write_len | uint32_t | Output buffer size |
| field_id | uint32_t | SField field ID |

**Return Value:**
- Success: Number of bytes written (write_ptr != 0) or int64_t encoded value (write_ptr = 0)
- Error: Negative error code

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `INVALID_ARGUMENT (-7)`: write_ptr is 0 but write_len is not 0
- `TOO_SMALL (-4)`: Buffer too small
- `DOESNT_EXIST (-5)`: Field does not exist
- `INVALID_FIELD (-17)`: Invalid field ID

**Usage Example:**
```c
// Get Amount field
uint8_t amount[48];
int64_t len = otxn_field(SBUF(amount), sfAmount);

// Get small value as int64_t
int64_t txn_type = otxn_field(0, 0, sfTransactionType);
```

---

## otxn_id

Get the ID of the originating transaction.

```c
int64_t otxn_id(uint32_t write_ptr, uint32_t write_len, uint32_t flags);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| write_ptr | uint32_t | Output buffer pointer (32 bytes) |
| write_len | uint32_t | Output buffer size |
| flags | uint32_t | Flags (0 = prefer emitFailure) |

**Return Value:**
- Success: `32` (TxID size)
- Error: Negative error code

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `TOO_SMALL (-4)`: write_len < 32

---

## otxn_type

Get the type of the originating transaction.

```c
int64_t otxn_type();
```

**Parameters:** None

**Return Value:**
- Transaction type code (TxType value)

**Common Transaction Types:**
| Type | Value | Description |
|------|-------|-------------|
| ttPAYMENT | 0 | Payment |
| ttESCROW_CREATE | 1 | Escrow creation |
| ttESCROW_FINISH | 2 | Escrow completion |
| ttACCOUNT_SET | 3 | Account settings |
| ttESCROW_CANCEL | 4 | Escrow cancellation |
| ttOFFER_CREATE | 7 | Offer creation |
| ttOFFER_CANCEL | 8 | Offer cancellation |
| ttTRUST_SET | 20 | Trust line settings |
| ttHOOK_SET | 22 | Hook settings |
| ttINVOKE | 99 | Direct Hook invocation |

---

## otxn_slot

Load the originating transaction into a slot.

```c
int64_t otxn_slot(uint32_t slot_into);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| slot_into | uint32_t | Slot number (0 = auto-assign) |

**Return Value:**
- Success: Assigned slot number
- Error: Negative error code

**Error Codes:**
- `NO_FREE_SLOTS (-6)`: No free slots available
- `INVALID_ARGUMENT (-7)`: slot_into > max_slots

**Usage Example:**
```c
int64_t slot = otxn_slot(0);  // Auto-assign
// Use slot_subfield etc. to get fields
```

---

## otxn_param

Get a Hook parameter attached to the transaction.

```c
int64_t otxn_param(uint32_t write_ptr, uint32_t write_len, uint32_t read_ptr, uint32_t read_len);
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

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `TOO_BIG (-3)`: Parameter name > 32 bytes
- `TOO_SMALL (-4)`: Parameter name < 1 byte or buffer too small
- `DOESNT_EXIST (-5)`: Parameter does not exist

**Usage Example:**
```c
uint8_t value[256];
int64_t len = otxn_param(SBUF(value), "my_param", 8);
if (len > 0) {
    // Use parameter value
}
```
