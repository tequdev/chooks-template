# Utility API

Utility functions for address conversion, hash calculation, signature verification, etc.

## util_raddr

Converts a 20-byte account ID to a Base58-encoded r-address.

```c
int64_t util_raddr(uint32_t write_ptr, uint32_t write_len, uint32_t read_ptr, uint32_t read_len);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| write_ptr | uint32_t | Output buffer pointer |
| write_len | uint32_t | Output buffer size |
| read_ptr | uint32_t | Account ID pointer (20 bytes) |
| read_len | uint32_t | Account ID size (must be 20) |

**Return Value:**
- Success: Length of the encoded address
- Error: Negative error code

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `INVALID_ARGUMENT (-7)`: read_len != 20
- `TOO_SMALL (-4)`: Output buffer too small

---

## util_accid

Decodes a Base58-encoded r-address to a 20-byte account ID.

```c
int64_t util_accid(uint32_t write_ptr, uint32_t write_len, uint32_t read_ptr, uint32_t read_len);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| write_ptr | uint32_t | Output buffer pointer (requires 20 bytes) |
| write_len | uint32_t | Output buffer size |
| read_ptr | uint32_t | r-address string pointer |
| read_len | uint32_t | r-address string length |

**Return Value:**
- Success: Number of bytes written (20)
- Error: Negative error code

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `TOO_SMALL (-4)`: write_len < 20
- `TOO_BIG (-3)`: read_len > 49
- `INVALID_ARGUMENT (-7)`: Invalid Base58 format

---

## util_verify

Verifies a secp256k1 or ed25519 signature.

```c
int64_t util_verify(
    uint32_t dread_ptr, uint32_t dread_len,
    uint32_t sread_ptr, uint32_t sread_len,
    uint32_t kread_ptr, uint32_t kread_len);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| dread_ptr | uint32_t | Data pointer to verify |
| dread_len | uint32_t | Data size |
| sread_ptr | uint32_t | Signature pointer |
| sread_len | uint32_t | Signature size (minimum 30 bytes) |
| kread_ptr | uint32_t | Public key pointer (compressed format) |
| kread_len | uint32_t | Public key size (must be 33 bytes) |

**Return Value:**
- `1`: Signature verification successful
- `0`: Signature verification failed
- Negative value: Error

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `INVALID_KEY (-41)`: kread_len != 33 or invalid public key
- `TOO_SMALL (-4)`: dread_len == 0 or sread_len < 30

---

## util_sha512h

Computes the first 32 bytes (SHA512Half) of a SHA-512 hash.

```c
int64_t util_sha512h(uint32_t write_ptr, uint32_t write_len, uint32_t read_ptr, uint32_t read_len);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| write_ptr | uint32_t | Output buffer pointer (requires 32 bytes) |
| write_len | uint32_t | Output buffer size |
| read_ptr | uint32_t | Data pointer to hash |
| read_len | uint32_t | Data size |

**Return Value:**
- Success: `32` (hash length)
- Error: Negative error code

**Error Codes:**
- `TOO_SMALL (-4)`: write_len < 32
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds

---

## util_keylet

Generates various types of Keylets.

```c
int64_t util_keylet(
    uint32_t write_ptr, uint32_t write_len,
    uint32_t keylet_type,
    uint32_t a, uint32_t b, uint32_t c,
    uint32_t d, uint32_t e, uint32_t f);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| write_ptr | uint32_t | Output buffer pointer (requires 34 bytes) |
| write_len | uint32_t | Output buffer size |
| keylet_type | uint32_t | Keylet type (KEYLET_* constant) |
| a-f | uint32_t | Parameters depending on keylet type |

**Keylet Types:**

| Type | Value | Parameters |
|------|-------|------------|
| KEYLET_HOOK | 1 | a=account_ptr, b=account_len(20) |
| KEYLET_HOOK_STATE | 2 | a=account_ptr(20B), b=20, c=key_ptr(32B), d=32, e=namespace_ptr(32B), f=32 |
| KEYLET_ACCOUNT | 3 | a=account_ptr, b=account_len(20) |
| KEYLET_AMENDMENTS | 4 | (no parameters, all must be 0) |
| KEYLET_CHILD | 5 | a=hash_ptr(32B), b=32 |
| KEYLET_SKIP | 6 | a=ledger_index (optional), b=0 or 1 |
| KEYLET_FEES | 7 | (no parameters, all must be 0) |
| KEYLET_NEGATIVE_UNL | 8 | (no parameters, all must be 0) |
| KEYLET_LINE | 9 | a=acc1_ptr(20B), b=20, c=acc2_ptr(20B), d=20, e=currency_ptr, f=currency_len |
| KEYLET_OFFER | 10 | a=account_ptr(20B), b=20, c=seq or hash_ptr, d=0 or 32 |
| KEYLET_QUALITY | 11 | a=dir_keylet_ptr(34B), b=34, c=quality_high, d=quality_low |
| KEYLET_EMITTED_DIR | 12 | (no parameters, all must be 0) |
| KEYLET_TICKET | 13 | a=account_ptr(20B), b=20, c=ticket_seq |
| KEYLET_SIGNERS | 14 | a=account_ptr, b=account_len(20) |
| KEYLET_CHECK | 15 | a=account_ptr(20B), b=20, c=seq or hash_ptr, d=0 or 32 |
| KEYLET_DEPOSIT_PREAUTH | 16 | a=owner_ptr(20B), b=20, c=authorized_ptr(20B), d=20 |
| KEYLET_UNCHECKED | 17 | a=hash_ptr(32B), b=32 |
| KEYLET_OWNER_DIR | 18 | a=account_ptr, b=account_len(20) |
| KEYLET_PAGE | 19 | a=root_ptr(32B), b=32, c=index_high, d=index_low |
| KEYLET_ESCROW | 20 | a=account_ptr(20B), b=20, c=seq or hash_ptr, d=0 or 32 |
| KEYLET_PAYCHAN | 21 | a=src_ptr(20B), b=20, c=dst_ptr(20B), d=20, e=seq or hash_ptr, f=0 or 32 |
| KEYLET_EMITTED_TXN | 22 | a=hash_ptr(32B), b=32 |
| KEYLET_NFT_OFFER | 23 | a=account_ptr(20B), b=20, c=seq or offer_id_ptr, d=0 or 32 |
| KEYLET_HOOK_DEFINITION | 24 | a=hash_ptr(32B), b=32 |
| KEYLET_HOOK_STATE_DIR | 25 | a=account_ptr(20B), b=20, c=namespace_ptr(32B), d=32 |
| KEYLET_CRON | 26 | a=account_ptr(20B), b=20, c=cron_seq |

**Return Value:**
- Success: `34` (Keylet size)
- Error: Negative error code

**Error Codes:**
- `OUT_OF_BOUNDS (-1)`: Memory out of bounds
- `TOO_SMALL (-4)`: write_len < 34
- `INVALID_ARGUMENT (-7)`: Invalid parameters
- `NO_SUCH_KEYLET (-21)`: Keylet generation failed
- `INTERNAL_ERROR (-14)`: Exception during keylet generation
