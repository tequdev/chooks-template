import { SetHookFlags, calculateHookOn, convertStringToHex, decode, decodeAccountID, encodeAccountID } from 'xahau'

import {
  serverUrl,
  type XrplIntegrationTestContext,
  setupClient,
  teardownClient,
} from '@transia/hooks-toolkit/dist/npm/src/libs/xrpl-helpers'

import {
  type SetHookParams,
  setHooksV3,
  hexNamespace,
  type iHook,
  readHookBinaryHexFromNS,
  clearAllHooksV3,
  clearHookStateV3,
  Xrpld,
} from '@transia/hooks-toolkit'
import { HookFunctionFlags } from 'xahau/dist/npm/models/transactions/setHook'

const namespace = 'namespace'

const TypeParameter = (name: string, type: string) => ({
  FunctionParameter: {
    FunctionParameterName: convertStringToHex(name),
    FunctionParameterType: { type },
  }
})
const ValueParameter = (type: string, value: any) => ({
  FunctionParameter: {
    FunctionParameterValue: { type, value: type === 'VL' ? convertStringToHex(value) : value },
  }
})

describe('test', () => {
  let testContext: XrplIntegrationTestContext

  beforeAll(async () => {
    testContext = await setupClient(serverUrl)
    const hook = {
      CreateCode: readHookBinaryHexFromNS('../build/index', 'wasm'),
      Flags: SetHookFlags.hsfOverride,
      HookOn: calculateHookOn(['Invoke']),
      HookNamespace: hexNamespace(namespace),
      HookApiVersion: 3,
      HookFunctions: [
        {
          HookFunction: {
            FunctionName: convertStringToHex('increment'),
            FunctionParameters: [
              TypeParameter('key', 'VL'),
              TypeParameter('amount', 'UINT8'),
            ]
          }
        },
        {
          HookFunction: {
            FunctionName: convertStringToHex('decrement'),
            FunctionParameters: [
              TypeParameter('key', 'VL'),
              TypeParameter('amount', 'UINT8'),
            ]
          }
        },
        {
          HookFunction: {
            FunctionName: convertStringToHex('queryValue'),
            Flags: HookFunctionFlags.hffQUERY,
            FunctionParameters: [
              TypeParameter('key', 'VL'),
            ]
          }
        }
      ]
    } as iHook
    await setHooksV3({
      client: testContext.client,
      wallet: testContext.alice,
      hooks: [{ Hook: hook }],
    } as SetHookParams)
  })

  afterAll(async () => {
    const clearHook = {
      Flags: SetHookFlags.hsfNSDelete,
      HookNamespace: hexNamespace(namespace),
    } as iHook
    await clearHookStateV3({
      client: testContext.client,
      wallet: testContext.alice,
      hooks: [{ Hook: clearHook }],
    } as SetHookParams)
    await clearAllHooksV3({
      client: testContext.client,
      wallet: testContext.alice,
    } as SetHookParams)
    await teardownClient(testContext)
  })

  it('test', async () => {
    await Xrpld.submit(testContext.client, {
      tx: {
        TransactionType: 'Invoke',
        Account: testContext.bob.address,
        Destination: testContext.alice.address,
        FunctionName: convertStringToHex('increment'),
        FunctionParameters: [
          ValueParameter('VL', 'my-value'),
          ValueParameter('UINT8', 25),
        ],
      },
      wallet: testContext.bob,
    })

    const response1 = await testContext.client.request({
      command: "hook_query",
      hook_account: testContext.alice.address,
      source_account: testContext.alice.address,
      function_name: 'queryValue',
      function_params: {
        key: { type: 'VL', value: convertStringToHex('my-value') },
      },
    })
    console.log(response1.result.query_results)

    await Xrpld.submit(testContext.client, {
      tx: {
        TransactionType: 'Invoke',
        Account: testContext.bob.address,
        Destination: testContext.alice.address,
        FunctionName: convertStringToHex('decrement'),
        FunctionParameters: [
          ValueParameter('VL', 'my-value'),
          ValueParameter('UINT8', 3),
        ],
      },
      wallet: testContext.bob,
    })

    const response2 = await testContext.client.request({
      command: "hook_query",
      hook_account: testContext.alice.address,
      source_account: testContext.alice.address,
      function_name: 'queryValue',
      function_params: {
        key: { type: 'VL', value: convertStringToHex('my-value') },
      },
    })
    console.log(response2.result.query_results)
  })
})
