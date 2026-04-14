# Slot-Based Data Access

## Concept

Slots are numbered memory regions that hold serialized ledger objects or transaction data. They provide efficient random access to fields without copying entire objects.

## Loading Data into Slots

```c
// Load originating transaction into slot 1
otxn_slot(1);

// Load a ledger entry by keylet into slot 2
uint8_t kl[34];
util_keylet(SBUF(kl), KEYLET_ACCOUNT, SBUF(account_id), 0, 0, 0, 0);
slot_set(SBUF(kl), 2);

// Load transaction metadata into slot 3
meta_slot(3);
```

## Navigating Slots

```c
// Extract a subfield into a new slot
// Field IDs are defined in sfcodes.h
slot_subfield(1, sfAmount, 10);    // slot 1's Amount -> slot 10

// Extract array element into a new slot
slot_subarray(1, 0, 11);          // slot 1's first element -> slot 11
```

## Reading from Slots

```c
// Read raw bytes
uint8_t buf[256];
int64_t len = slot(SBUF(buf), 10);

// Read as XFL float (for Amount fields)
int64_t amount_xfl = slot_float(10);

// Get data size without reading
int64_t size = slot_size(10);

// Get array element count
int64_t count = slot_count(1);

// Get slot data type
int64_t type = slot_type(10, 0);
```

## Cleanup

```c
slot_clear(10);  // Free slot 10
```

## Common Patterns

### Read Account Balance
```c
// Load account
uint8_t kl[34];
util_keylet(SBUF(kl), KEYLET_ACCOUNT, SBUF(account_id), 0, 0, 0, 0);
slot_set(SBUF(kl), 1);

// Extract Balance field
slot_subfield(1, sfBalance, 2);
int64_t balance = slot_float(2);
```

### Iterate Array in Slot
```c
otxn_slot(1);
slot_subfield(1, sfMemos, 5);
int64_t count = slot_count(5);
for (int i = 0; GUARD(10), i < count && i < 10; ++i) {
    slot_subarray(5, i, 6);
    // Process element in slot 6
    slot_subfield(6, sfMemoData, 7);
    uint8_t data[256];
    slot(SBUF(data), 7);
}
```

### Check Transaction Destination
```c
otxn_slot(1);
slot_subfield(1, sfDestination, 2);
uint8_t dest[20];
slot(SBUF(dest), 2);

uint8_t hook_acc[20];
hook_account(SBUF(hook_acc));

if (BUFFER_EQUAL_20(dest, hook_acc)) {
    // Transaction is incoming
}
```
