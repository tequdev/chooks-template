# STO API

API for manipulating Serialized Transaction Objects.

## sto_validate

Validates the integrity of an STO.

```c
int64_t sto_validate(uint32_t read_ptr, uint32_t read_len);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| read_ptr | uint32_t | Pointer to STO data |
| read_len | uint32_t | Size of STO data |

**Return Value:**
- `1`: Valid STO
- `0`: Invalid STO (including parse errors)
- Negative value: Error

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `TOO_SMALL (-4)`: read_len < 2

---

## sto_subfield

Extracts a specific field from an STO.

```c
int64_t sto_subfield(uint32_t read_ptr, uint32_t read_len, uint32_t field_id);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| read_ptr | uint32_t | Pointer to STO data |
| read_len | uint32_t | Size of STO data |
| field_id | uint32_t | Field ID (upper 16 bits = type, lower 16 bits = field) |

**Return Value:**
- Success: Upper 32 bits = offset, lower 32 bits = payload length
  - `SUB_OFFSET(result)`: Macro to extract offset
  - `SUB_LENGTH(result)`: Macro to extract length
- Error: Negative error code

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `TOO_SMALL (-4)`: read_len < 2
- `DOESNT_EXIST (-5)`: Field does not exist
- `PARSE_ERROR (-18)`: Parse error

**Usage Example:**
```c
int64_t result = sto_subfield(SBUF(sto), sfAmount);
if (result > 0) {
    uint32_t offset = SUB_OFFSET(result);
    uint32_t length = SUB_LENGTH(result);
    // Field data is at sto + offset for length bytes
}
```

---

## sto_subarray

Extracts an element at a specific index from an STO array.

```c
int64_t sto_subarray(uint32_t read_ptr, uint32_t read_len, uint32_t index_id);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| read_ptr | uint32_t | Pointer to array data |
| read_len | uint32_t | Size of array data |
| index_id | uint32_t | Array index (0-based) |

**Return Value:**
- Success: Upper 32 bits = offset, lower 32 bits = element length
- Error: Negative error code

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `TOO_SMALL (-4)`: read_len < 2
- `DOESNT_EXIST (-5)`: Index out of range
- `PARSE_ERROR (-18)`: Parse error

---

## sto_emplace

Inserts or replaces a field in an STO.

```c
int64_t sto_emplace(
    uint32_t write_ptr, uint32_t write_len,
    uint32_t sread_ptr, uint32_t sread_len,
    uint32_t fread_ptr, uint32_t fread_len,
    uint32_t field_id);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| write_ptr | uint32_t | Output buffer pointer |
| write_len | uint32_t | Output buffer size (must be >= sread_len + fread_len) |
| sread_ptr | uint32_t | Source STO pointer |
| sread_len | uint32_t | Source STO size (must be >= 2 and <= 16KB) |
| fread_ptr | uint32_t | Field to insert pointer (0 for deletion) |
| fread_len | uint32_t | Field to insert size (must be >= 2 and <= 4KB, 0 for deletion) |
| field_id | uint32_t | Field ID |

**Return Value:**
- Success: Number of bytes written to output
- Error: Negative error code

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `TOO_BIG (-3)`: Object too large (sread_len > 16KB or fread_len > 4KB)
- `TOO_SMALL (-4)`: Buffer insufficient or sread_len < 2 or fread_len < 2
- `PARSE_ERROR (-18)`: Parse error (also returned when field_id mismatches injected field)
- `MEM_OVERLAP (-43)`: Memory regions overlap

---

## sto_erase

Removes a field from an STO.

```c
int64_t sto_erase(
    uint32_t write_ptr, uint32_t write_len,
    uint32_t read_ptr, uint32_t read_len,
    uint32_t field_id);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| write_ptr | uint32_t | Output buffer pointer |
| write_len | uint32_t | Output buffer size |
| read_ptr | uint32_t | Source STO pointer |
| read_len | uint32_t | Source STO size |
| field_id | uint32_t | Field ID to remove |

**Return Value:**
- Success: Number of bytes written to output
- Error: Negative error code

**Error Codes:**
- `DOESNT_EXIST (-5)`: Field does not exist
- Others: Same as sto_emplace

**Notes:**
- Internally calls sto_emplace with fread_ptr=0 and fread_len=0
- Returns DOESNT_EXIST when the output size equals the input size (field was not found)
