# Slot API

API for object manipulation using memory slots. Up to 255 slots available.

## slot

Serialize and output the object in a slot to memory.

```c
int64_t slot(uint32_t write_ptr, uint32_t write_len, uint32_t slot_no);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| write_ptr | uint32_t | Output buffer pointer (0 to return as int64_t) |
| write_len | uint32_t | Output buffer size |
| slot_no | uint32_t | Slot number to read from |

**Return Value:**
- Success: Number of bytes written
- write_ptr=0: Value encoded as int64_t
- Error: Negative error code

**Error Codes:**
- `INVALID_ARGUMENT (-7)`: write_ptr is 0 but write_len is not 0
- `OUT_OF_BOUNDS (-1)`: Memory out of range
- `TOO_SMALL (-4)`: write_len < 1 (when write_ptr != 0)
- `DOESNT_EXIST (-5)`: Slot does not exist
- `INTERNAL_ERROR (-2)`: Slot entry is null

---

## slot_set

Load an object into a slot from a Keylet or transaction hash.

```c
int64_t slot_set(uint32_t read_ptr, uint32_t read_len, uint32_t slot_into);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| read_ptr | uint32_t | Pointer to Keylet (34 bytes) or Tx hash (32 bytes) |
| read_len | uint32_t | Buffer size (32 or 34) |
| slot_into | uint32_t | Slot number (0=auto-assign) |

**Return Value:**
- Success: Assigned slot number
- Error: Negative error code

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of range
- `INVALID_ARGUMENT (-7)`: Invalid size or slot_into > max_slots
- `NO_FREE_SLOTS (-6)`: No free slots available
- `DOESNT_EXIST (-5)`: Keylet/hash not found

---

## slot_clear

Free a slot.

```c
int64_t slot_clear(uint32_t slot_no);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| slot_no | uint32_t | Slot number to free |

**Return Value:**
- Success: `1`
- Error: Negative error code

**Error Codes:**
- `DOESNT_EXIST (-5)`: Slot does not exist

---

## slot_count

Get the number of array elements in a slot.

```c
int64_t slot_count(uint32_t slot_no);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| slot_no | uint32_t | Slot number |

**Return Value:**
- Success: Number of array elements
- Error: Negative error code

**Error Codes:**
- `DOESNT_EXIST (-5)`: Slot does not exist
- `INTERNAL_ERROR (-2)`: Slot entry is null
- `NOT_AN_ARRAY (-22)`: Not an array

---

## slot_size

Get the serialized size of an object in a slot.

```c
int64_t slot_size(uint32_t slot_no);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| slot_no | uint32_t | Slot number |

**Return Value:**
- Success: Size in bytes after serialization
- Error: Negative error code

**Error Codes:**
- `DOESNT_EXIST (-5)`: Slot does not exist
- `INTERNAL_ERROR (-2)`: Slot entry is null

---

## slot_subarray

Extract a specific index element from an array in a slot to a new slot.

```c
int64_t slot_subarray(uint32_t parent_slot, uint32_t array_id, uint32_t new_slot);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| parent_slot | uint32_t | Slot number of the parent array |
| array_id | uint32_t | Array index (0-based) |
| new_slot | uint32_t | New slot number (0=auto-assign) |

**Return Value:**
- Success: Assigned slot number
- Error: Negative error code

**Error Codes:**
- `DOESNT_EXIST (-5)`: Parent slot does not exist or index out of range
- `INTERNAL_ERROR (-2)`: Parent slot entry is null
- `NOT_AN_ARRAY (-22)`: Parent is not an array
- `NO_FREE_SLOTS (-6)`: No free slots available
- `INVALID_ARGUMENT (-7)`: new_slot > max_slots

---

## slot_subfield

Extract a specific field from an object in a slot to a new slot.

```c
int64_t slot_subfield(uint32_t parent_slot, uint32_t field_id, uint32_t new_slot);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| parent_slot | uint32_t | Slot number of the parent object |
| field_id | uint32_t | SField field ID |
| new_slot | uint32_t | New slot number (0=auto-assign) |

**Return Value:**
- Success: Assigned slot number
- Error: Negative error code

**Error Codes:**
- `DOESNT_EXIST (-5)`: Parent slot does not exist or field not present
- `INVALID_FIELD (-17)`: Invalid field ID
- `INTERNAL_ERROR (-2)`: Parent slot entry is null
- `NOT_AN_OBJECT (-23)`: Parent is not an object
- `NO_FREE_SLOTS (-6)`: No free slots available
- `INVALID_ARGUMENT (-7)`: new_slot > max_slots

---

## slot_type

Get the type of an object in a slot.

```c
int64_t slot_type(uint32_t slot_no, uint32_t flags);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| slot_no | uint32_t | Slot number |
| flags | uint32_t | 0=field code, 1=XRP check |

**Return Value:**
- flags=0: Field code
- flags=1: `1` (XRP) or `0` (IOU)
- Error: Negative error code

**Error Codes:**
- `DOESNT_EXIST (-5)`: Slot does not exist
- `INTERNAL_ERROR (-2)`: Slot entry is null
- `NOT_AN_AMOUNT (-32)`: flags=1 and not an amount type
- `INVALID_ARGUMENT (-7)`: Invalid flags

---

## slot_float

Convert an amount in a slot to an XFL value.

```c
int64_t slot_float(uint32_t slot_no);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| slot_no | uint32_t | Slot number |

**Return Value:**
- Success: XFL value
- Underflow: `0`
- Error: Negative error code

**Error Codes:**
- `DOESNT_EXIST (-5)`: Slot does not exist
- `INTERNAL_ERROR (-2)`: Slot entry is null
- `NOT_AN_AMOUNT (-32)`: Not an amount type

---

## Usage Example

```c
// Load transaction into slot
int64_t slot = otxn_slot(0);

// Extract Amount field
int64_t amount_slot = slot_subfield(slot, sfAmount, 0);

// Convert to XFL value
int64_t amount = slot_float(amount_slot);

// Clear when done
slot_clear(slot);
slot_clear(amount_slot);
```
