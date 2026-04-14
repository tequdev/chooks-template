# XFL (eXtended Fixed-point Ledger) Arithmetic

## Format

64-bit representation:
- **Mantissa**: 54 bits, 15 significant digits (10^15 to 10^16-1)
- **Exponent**: 8 bits, range -96 to +80
- **Sign**: bit 62 (0=negative, 1=positive)
- **Special**: 0 = canonical zero

## Creation

```c
int64_t one = float_one();                    // 1.0
int64_t val = float_set(0, 1000000);          // 1,000,000
int64_t neg = float_set(-6, -5);              // -0.000005
int64_t zero = float_set(0, 0);              // 0
```

## Arithmetic

```c
int64_t sum  = float_sum(a, b);               // a + b
int64_t prod = float_multiply(a, b);          // a * b
int64_t quot = float_divide(a, b);            // a / b
int64_t neg  = float_negate(a);               // -a
int64_t inv  = float_invert(a);               // 1/a
```

## Comparison

```c
// Mode flags: COMPARE_EQUAL(1), COMPARE_LESS(2), COMPARE_GREATER(4)
int64_t eq = float_compare(a, b, COMPARE_EQUAL);           // a == b
int64_t lt = float_compare(a, b, COMPARE_LESS);            // a < b
int64_t gt = float_compare(a, b, COMPARE_GREATER);         // a > b
int64_t le = float_compare(a, b, COMPARE_LESS | COMPARE_EQUAL);  // a <= b
int64_t ge = float_compare(a, b, COMPARE_GREATER | COMPARE_EQUAL); // a >= b

// Returns 1 if true, 0 if false
```

## Conversion

```c
// XFL -> integer
int64_t drops = float_int(xfl, 6, 0);        // 6 decimal places, signed
int64_t abs_val = float_int(xfl, 0, 1);      // 0 decimals, absolute

// Components
int64_t mantissa = float_mantissa(xfl);
int64_t sign = float_sign(xfl);              // 0=negative, 1=positive

// XFL -> serialized amount field
uint8_t amt[48];
int64_t len = float_sto(
    SBUF(amt),          // output buffer
    currency, 20,       // currency code (20 bytes, 0 for XAH)
    issuer, 20,         // issuer account (20 bytes, 0 for XAH)
    xfl,                // XFL value
    sfAmount            // field code
);

// Serialized amount -> XFL
int64_t xfl = float_sto_set(amt, len);
```

## Advanced

```c
// Multiply by ratio (with rounding control)
int64_t result = float_mulratio(xfl, 0, 3, 4);   // xfl * 3/4 (round down)
int64_t result = float_mulratio(xfl, 1, 3, 4);   // xfl * 3/4 (round up)

// Math functions
int64_t ln = float_log(xfl);                      // natural log
int64_t sqrt = float_root(xfl, 2);                // square root
int64_t cbrt = float_root(xfl, 3);                // cube root
```

## Error Codes

| Code | Name | Value |
|------|------|-------|
| INVALID_FLOAT | Invalid XFL | -10024 |
| DIVISION_BY_ZERO | Division by zero | -25 |
| MANTISSA_OVERSIZED | Mantissa too large | -26 |
| MANTISSA_UNDERSIZED | Mantissa too small | -27 |
| EXPONENT_OVERSIZED | Exponent too large | -28 |
| EXPONENT_UNDERSIZED | Exponent too small | -29 |
| XFL_OVERFLOW | Arithmetic overflow | -30 |

## Common Patterns

### Percentage Calculation
```c
int64_t amount = float_set(0, 1000);
int64_t pct = float_mulratio(amount, 0, 5, 100);   // 5% of 1000 = 50
```

### Amount Comparison
```c
int64_t min_amount = float_set(6, 1);  // 1,000,000 drops = 1 XAH
int64_t actual = slot_float(amount_slot);
if (float_compare(actual, min_amount, COMPARE_LESS)) {
    rollback(SBUF("Amount too small"), 1);
}
```
