# Emitting Transactions from Hooks

## Required Sequence

1. Reserve emission slots with `etxn_reserve(count)`
2. Build serialized transaction
3. Calculate fee with `etxn_fee_base()`
4. Emit with `emit()`

## Build Transaction

### 1. Basic Pattern

```c
// 1. Reserve (MUST be called before any emit)
etxn_reserve(1);

// 2. Build transaction buffer
uint8_t tx[PREPARE_PAYMENT_SIMPLE_SIZE];

// 3. Prepare a simple payment
PREPARE_PAYMENT_SIMPLE(
    tx,          // output buffer
    drops,       // amount in drops (XFL)
    dest,        // destination (20 bytes)
    dest_tag,    // destination tag (0 for none)
    src_tag      // source tag (0 for none)
);

// 4. Emit
uint8_t hash[32];
int64_t result = emit(SBUF(hash), SBUF(tx));
if (result < 0)
    rollback(SBUF("Emit failed"), result);
```

### 2. Template Pattern (preferred)

```c
// clang-format off
uint8_t txn[207] =
{
/* size, upto, field name               */
/*    3,    0, tt = Payment             */   0x12U, 0x00U, 0x00U,
/*    5,    3, flags                    */   0x22U, 0x00U, 0x00U, 0x00U, 0x00U,
/*    5,    8, sequence                 */   0x24U, 0x00U, 0x00U, 0x00U, 0x00U,
/*    6,   13, firstledgersequence      */   0x20U, 0x1AU, 0x00U, 0x00U, 0x00U, 0x00U,
/*    6,   19, lastledgersequence       */   0x20U, 0x1BU, 0x00U, 0x00U, 0x00U, 0x00U,
/*    9,   25, fee                      */   0x68U, 0x40U, 0x00U, 0x00U, 0x00U, 0x00U, 0x00U, 0x00U, 0x00U,
/*   35,   34, signingpubkey            */   0x73U, 0x21U, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
/*   22,   69, account                  */   0x81U, 0x14U, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
/*  116,   91, emit details             */ 
/*    0,  207,                          */ 
};
// clang-format on

// TX BUILDER
#define FLAGS_OUT (txn + 4U)
#define FLS_OUT (txn + 15U)
#define LLS_OUT (txn + 21U)
#define FEE_OUT (txn + 26U)
#define ACCOUNT_OUT (txn + 71U)
#define EMIT_OUT (txn + 91U)

#define FLIP_ENDIAN_32(value)                                                  \
  (uint32_t)(((value & 0xFFU) << 24) | ((value & 0xFF00U) << 8) |              \
             ((value & 0xFF0000U) >> 8) | ((value & 0xFF000000U) >> 24))

#define SET_UINT32(ptr, value) *((uint32_t *)(ptr)) = FLIP_ENDIAN_32(value);

#define SET_NATIVE_AMOUNT(ptr, amount)                                         \
  do {                                                                         \
    uint8_t *b = (ptr);                                                        \
    *b++ = 0b01000000 + ((amount >> 56) & 0b00111111);                         \
    *b++ = (amount >> 48) & 0xFFU;                                             \
    *b++ = (amount >> 40) & 0xFFU;                                             \
    *b++ = (amount >> 32) & 0xFFU;                                             \
    *b++ = (amount >> 24) & 0xFFU;                                             \
    *b++ = (amount >> 16) & 0xFFU;                                             \
    *b++ = (amount >> 8) & 0xFFU;                                              \
    *b++ = (amount >> 0) & 0xFFU;                                              \
  } while (0)

#define PREPARE_TXN()                                                          \
  do {                                                                         \
    etxn_reserve(1);                                                           \
    uint32_t fls = (uint32_t)ledger_seq() + 1;                                 \
    SET_UINT32(FLS_OUT, fls);                                                  \
    SET_UINT32(LLS_OUT, fls + 4);                                              \
    hook_account(ACCOUNT_OUT, 20);                                             \
    etxn_details(EMIT_OUT, 116U);                                              \
    int64_t fee = etxn_fee_base(SBUF(txn));                                    \
    SET_NATIVE_AMOUNT(FEE_OUT, fee);                                           \
    TRACEHEX(txn);                                                             \
  } while (0)

int32_t hook(uint32_t reserved) {
    GUARD(1);
    etxn_reserve(1);
    PREPARE_TXN(); 
    uint8_t emithash[32]; 
    int64_t emit_result = emit(SBUF(emithash), SBUF(txn)); 
    if (emit_result < 0)
        rollback(SBUF("Emit failed"), emit_result);
    return accept(SBUF("OK"), 0);
}
```

## API Functions

| Function | Purpose |
|----------|---------|
| `etxn_reserve(count)` | Declare number of emissions (required first) |
| `etxn_fee_base(tx, len)` | Calculate fee for serialized tx |
| `etxn_nonce(buf, len)` | Generate unique nonce (32 bytes) |
| `etxn_details(buf, len)` | Get EmitDetails field |
| `etxn_generation()` | Get generation counter (cascading depth) |
| `etxn_burden()` | Get burden value |
| `prepare(out, olen, in, ilen)` | Prepare tx for emission (HooksUpdate2+) |
| `emit(hash_out, hlen, tx, txlen)` | Emit prepared transaction |

## Building Custom Transactions

For non-simple transactions, build using STO operations:

```c
// Start with transaction type
uint8_t tx[1024];
int offset = 0;

// Add fields using sto_emplace
// ... (manual serialization)

// Or use prepare() to auto-fill system fields
uint8_t prepared[1024];
int64_t plen = prepare(SBUF(prepared), tx, offset);
```

## Callback (cbak)

When an emitted transaction settles, `cbak()` is called:

```c
int64_t cbak(uint32_t reserved) {
    // Check what type of transaction settled
    int64_t tt = otxn_type();

    // Load metadata to check result
    meta_slot(1);

    // Inspect the result...
    return 0;
}
```

## Limits

- Maximum emitted transactions per hook execution depends on `etxn_reserve()`
- Emitted transactions have escalating fees based on `etxn_burden()`
- Generation counter prevents infinite cascading
