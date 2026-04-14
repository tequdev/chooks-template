# SetHook Transaction Operations

## Operation Types

| Operation | Value | Description |
|-----------|-------|-------------|
| hsoNOOP | 0 | No operation (slot unchanged) |
| hsoCREATE | 1 | Upload new WASM and create hook definition |
| hsoINSTALL | 2 | Install existing hook definition by hash |
| hsoDELETE | 3 | Delete hook from slot |
| hsoNSDELETE | 4 | Delete all state in a namespace |
| hsoUPDATE | 5 | Update hook parameters only |

## SetHook Flags

| Flag | Value | Purpose |
|------|-------|---------|
| hsfOVERRIDE | 0x01 | Allow overwrite/deletion of existing hook |
| hsfNSDELETE | 0x02 | Delete namespace on hook removal |
| hsfCOLLECT | 0x04 | Allow collect calls (weak TSH) |

## HookOn Bitmask

Controls which transaction types trigger the hook:
- Each bit position = transaction type number
- Bit = 0: hook triggers for this type
- Bit = 1: hook skips this type
- Default (all zeros) = trigger on everything

## Hook Parameters

Parameters are key-value pairs stored with the hook:
- Key: max 32 bytes (`sfHookParameterName`)
- Value: max 256 bytes (`sfHookParameterValue`)
- Set during hsoCREATE, hsoINSTALL, or hsoUPDATE
- Read at runtime via `hook_param()`
- Overridable per-transaction via `sfHookParameters` in tx

## Hook Grants

Grants allow other accounts' hooks to write to your state:

```json
{
    "HookGrants": [{
        "HookGrant": {
            "Authorize": "rGrantedAccount",
            "HookHash": "AABB...CCDD"
        }
    }]
}
```

Without a grant, `state_foreign_set()` fails with NOT_AUTHORIZED.

## Hook Definition Reference Counting

- `hsoCREATE` uploads WASM: creates HookDefinition (ltHOOK_DEFINITION) with refcount=1
- `hsoINSTALL` by another account: increments refcount
- `hsoDELETE`: decrements refcount; definition deleted when refcount=0
- Same WASM binary = same hash = shared definition

## Server-Side Validation

SetHook transaction processing in `src/xrpld/app/tx/detail/SetHook.cpp`:
- `validateHookSetEntry()`: validates each hook in the array
- `validateHookGrants()`: validates grant entries
- `validateHookParams()`: validates parameter entries
- `inferOperation()`: determines hso* operation from HookSet object fields
