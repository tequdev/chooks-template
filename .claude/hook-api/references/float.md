# Float API

Floating-point arithmetic API using XFL (eXtended Floating point) format.

## About XFL Format

A floating-point representation using 64-bit integers:
- **Mantissa**: Lower 54 bits (15 digits, range 10^15 to 10^16-1)
- **Exponent**: Bits 54-61 (range -96 to +80)
- **Sign**: Bit 62 (0=negative, 1=positive)

---

## float_set

Create an XFL value from exponent and mantissa.

```c
int64_t float_set(int32_t exp, int64_t mantissa);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| exp | int32_t | Exponent |
| mantissa | int64_t | Mantissa |

**Return Value:**
- Success: Normalized XFL value
- `INVALID_FLOAT (-10024)`: mantissa=0 or overflow

---

## float_multiply

Multiply two XFL values.

```c
int64_t float_multiply(int64_t float1, int64_t float2);
```

**Return Value:**
- Success: float1 * float2
- `INVALID_FLOAT`: Invalid input value
- `XFL_OVERFLOW (-30)`: Overflow

---

## float_mulratio

Multiply an XFL value by a fraction.

```c
int64_t float_mulratio(int64_t float1, uint32_t round_up, uint32_t numerator, uint32_t denominator);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| float1 | int64_t | XFL value |
| round_up | uint32_t | Rounding mode (0=round down, non-zero=round up) |
| numerator | uint32_t | Numerator |
| denominator | uint32_t | Denominator |

**Return Value:**
- Success: float1 * (numerator / denominator)
- `INVALID_FLOAT (-10024)`: Invalid input value
- `DIVISION_BY_ZERO (-25)`: denominator = 0
- `XFL_OVERFLOW (-30)`: Overflow

---

## float_negate

Negate the sign of an XFL value.

```c
int64_t float_negate(int64_t float1);
```

**Return Value:**
- Success: -float1
- `INVALID_FLOAT`: Invalid input value

---

## float_compare

Compare two XFL values.

```c
int64_t float_compare(int64_t float1, int64_t float2, uint32_t mode);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| float1 | int64_t | First value |
| float2 | int64_t | Second value |
| mode | uint32_t | Comparison mode (bitmask) |

**Mode Flags:**
- `0b001`: Equal (EQUAL)
- `0b010`: Less than (LESS)
- `0b100`: Greater than (GREATER)
- `0b110`: Not equal (LESS | GREATER)

**Return Value:**
- `1`: Condition is satisfied
- `0`: Condition is not satisfied
- `INVALID_FLOAT (-10024)`: Invalid input value
- `INVALID_ARGUMENT (-7)`: Invalid mode (e.g., mode=0 or mode=0b111)
- `XFL_OVERFLOW (-30)`: Overflow during comparison

---

## float_sum

Add two XFL values.

```c
int64_t float_sum(int64_t float1, int64_t float2);
```

**Return Value:**
- Success: float1 + float2
- `INVALID_FLOAT (-10024)`: Invalid input value
- `XFL_OVERFLOW (-30)`: Overflow
- `0`: Underflow

---

## float_sto

Convert an XFL value to STO (Amount) format.

```c
int64_t float_sto(
    uint32_t write_ptr, uint32_t write_len,
    uint32_t cread_ptr, uint32_t cread_len,
    uint32_t iread_ptr, uint32_t iread_len,
    int64_t float1, uint32_t field_code);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| write_ptr | uint32_t | Output buffer pointer |
| write_len | uint32_t | Output buffer size |
| cread_ptr | uint32_t | Currency code pointer |
| cread_len | uint32_t | Currency code length (0, 3, or 20) |
| iread_ptr | uint32_t | Issuer ID pointer |
| iread_len | uint32_t | Issuer ID length (0 or 20) |
| float1 | int64_t | XFL value |
| field_code | uint32_t | Field code |

**field_code:**
- `0`: XRP amount (8 bytes)
- `0xFFFFFFFF`: Non-XRP amount without header (8 bytes)
- Other: Standard STO format

**Return Value:**
- Success: Number of bytes written
- `OUT_OF_BOUNDS (-1)`: Buffer out of bounds
- `INVALID_ARGUMENT (-7)`: Invalid argument
- `INVALID_FLOAT (-10024)`: Invalid XFL value
- `TOO_SMALL (-4)`: Output buffer too small
- `XFL_OVERFLOW (-30)`: Overflow

---

## float_sto_set

Convert an STO format Amount to XFL value.

```c
int64_t float_sto_set(uint32_t read_ptr, uint32_t read_len);
```

**Return Value:**
- Success: XFL value
- `OUT_OF_BOUNDS (-1)`: Buffer out of bounds
- `NOT_AN_OBJECT (-23)`: Invalid STO format

---

## float_invert

Get the reciprocal of an XFL value.

```c
int64_t float_invert(int64_t float1);
```

**Return Value:**
- Success: 1 / float1
- `INVALID_FLOAT (-10024)`: Invalid input value
- `DIVISION_BY_ZERO (-25)`: float1 = 0

---

## float_divide

Divide two XFL values.

```c
int64_t float_divide(int64_t float1, int64_t float2);
```

**Return Value:**
- Success: float1 / float2
- `INVALID_FLOAT (-10024)`: Invalid input value
- `DIVISION_BY_ZERO (-25)`: float2 = 0

---

## float_one

Get the XFL representation of constant 1.0.

```c
int64_t float_one();
```

**Return Value:**
- Always: XFL representation of 1.0

---

## float_mantissa

Get the mantissa of an XFL value.

```c
int64_t float_mantissa(int64_t float1);
```

**Return Value:**
- Success: Mantissa (0 to 9999999999999999)
- `INVALID_FLOAT`: Invalid XFL

---

## float_sign

Get the sign of an XFL value.

```c
int64_t float_sign(int64_t float1);
```

**Return Value:**
- `0`: Positive or zero
- `1`: Negative
- `INVALID_FLOAT`: Invalid XFL

---

## float_int

Convert an XFL value to an integer.

```c
int64_t float_int(int64_t float1, uint32_t decimal_places, uint32_t absolute);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| float1 | int64_t | XFL value |
| decimal_places | uint32_t | Number of decimal places (0 to 15) |
| absolute | uint32_t | Absolute value flag |

**Return Value:**
- Success: Integer value
- `INVALID_FLOAT (-10024)`: Invalid input value
- `INVALID_ARGUMENT (-7)`: decimal_places > 15
- `CANT_RETURN_NEGATIVE (-33)`: Negative number without absolute flag
- `TOO_BIG (-3)`: Value out of range
- `0`: Underflow (shift > 15)

---

## float_log

Common logarithm (log10) of an XFL value.

```c
int64_t float_log(int64_t float1);
```

**Return Value:**
- Success: XFL value of log10(float1)
- `INVALID_FLOAT (-10024)`: Invalid input value
- `INVALID_ARGUMENT (-7)`: float1 = 0
- `COMPLEX_NOT_SUPPORTED (-39)`: float1 < 0

---

## float_root

N-th root of an XFL value.

```c
int64_t float_root(int64_t float1, uint32_t n);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| float1 | int64_t | XFL value |
| n | uint32_t | Root degree (>= 2) |

**Return Value:**
- Success: XFL value of float1^(1/n)
- `INVALID_FLOAT (-10024)`: Invalid input value
- `INVALID_ARGUMENT (-7)`: n < 2
- `COMPLEX_NOT_SUPPORTED (-39)`: float1 < 0
