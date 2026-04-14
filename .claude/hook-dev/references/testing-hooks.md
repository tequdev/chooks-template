# Testing Hook Smart Contracts

## Building Test Hook WASM

```bash
mise run build-test-hook
```

This runs `src/test/app/build_test_hooks.sh` which:
1. Extracts C code from `R"[test.hook](...)[test.hook]"` markers in test files
2. Compiles via `wasmcc` -> `hook-cleaner` -> hex encoding
3. Generates `src/test/app/SetHook_wasm.h` with:
   ```cpp
   std::map<std::string, std::vector<uint8_t>> wasm;
   ```

## JTX Test Helpers

From `src/test/jtx/hook.h`:

```cpp
// Create SetHook transaction
Json::Value hook(Account const& account,
                 std::vector<Json::Value> hooks,
                 uint32_t flags);

// Create HookSetObject from WASM bytes
Json::Value hso(std::vector<uint8_t> const& wasm,
                void (*callback)(Json::Value&) = nullptr);

// Create hook deletion object
Json::Value hso_delete();
```

## Test Example

```cpp
#include <test/jtx.h>
#include <test/jtx/hook.h>
#include "SetHook_wasm.h"  // Generated WASM bytes

class MyHook_test : public beast::unit_test::suite
{
    void testHookInstall()
    {
        testcase("Install");
        using namespace jtx;

        Env env{*this, supported_amendments()};
        Account const alice{"alice"};
        env.fund(XRP(10000), alice);
        env.close();

        // Install hook
        env(hook(alice, {{hso(wasm["my_hook"])}}, 0),
            fee(XRP(1)),
            ter(tesSUCCESS));
        env.close();

        // Verify hook exists
        auto const hookSLE = env.le(keylet::hook(alice.id()));
        BEAST_EXPECT(hookSLE != nullptr);
    }

    void run() override
    {
        testHookInstall();
    }
};

BEAST_DEFINE_TESTSUITE(MyHook, app, ripple);
```

## Test Files

| File | Purpose |
|------|---------|
| `src/test/app/SetHook_test.cpp` | Hook installation and management |
| `src/test/app/HookAPI_test.cpp` | Hook API unit tests |
| `src/test/app/SetHookTSH_test.cpp` | Transactional Stake Holder tests |
| `src/test/protocol/Hooks_test.cpp` | Protocol-level hook tests |
| `src/test/jtx/hook.h` | JTX hook test helpers |
| `src/test/jtx/impl/hook.cpp` | Helper implementations |

## Running Hook Tests

```bash
mise test SetHook       # SetHook tests
mise test HookAPI       # Hook API tests
mise test Hooks         # Protocol hook tests
```

## Debugging Hook Execution

Server-side files for tracing hook issues:

| File | Content |
|------|---------|
| `src/xrpld/app/hook/detail/applyHook.cpp` | Execution engine, TSH determination |
| `src/xrpld/app/hook/detail/HookAPI.cpp` | All API function implementations |
| `src/xrpld/app/hook/Guard.h` | Guard validation logic |
| `src/xrpld/app/hook/Enum.h` | 50+ detailed log codes for diagnostics |

Hook execution log codes in Enum.h provide detailed error information for:
- WASM syntax and structure validation
- Function export validation (hook/cbak)
- Guard insertion validation
- Parameter and namespace limits
- Memory and instruction limits
