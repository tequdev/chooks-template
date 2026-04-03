import { SetHookFlags, calculateHookOn } from 'xahau'

import {
  serverUrl,
  type XrplIntegrationTestContext,
  setupClient,
  teardownClient,
} from '@transia/hooks-toolkit/dist/npm/src/libs/xrpl-helpers'
import { compileC } from '@xahau/hooks-cli'

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

const namespace = 'namespace'

describe('test', () => {
  let testContext: XrplIntegrationTestContext

  beforeAll(async () => {
    await compileC('./contracts/index.c', 'build/', {
      headers: './contracts',
    })
    testContext = await setupClient(serverUrl)
    const hook: iHook =  {
      CreateCode: readHookBinaryHexFromNS('../build/index', 'wasm'),
      Flags: SetHookFlags.hsfOverride,
      HookOn: calculateHookOn(['Invoke']),
      HookNamespace: hexNamespace(namespace),
      HookApiVersion: 0,
    } 
    await setHooksV3({
      client: testContext.client,
      seed: testContext.hook1.seed,
      hooks: [{ Hook: hook }],
    } as SetHookParams)
  })

  afterAll(async () => {
    const clearHook: iHook = {
      Flags: SetHookFlags.hsfNSDelete,
      HookNamespace: hexNamespace(namespace),
    }
    await clearHookStateV3({
      client: testContext.client,
      seed: testContext.hook1.seed,
      hooks: [{ Hook: clearHook }],
    } as SetHookParams)
    await clearAllHooksV3({
      client: testContext.client,
      seed: testContext.hook1.seed,
    } as SetHookParams)
    await teardownClient(testContext)
  })

  it('', async () => {
    const response = await Xrpld.submit(testContext.client, {
      tx: {
        TransactionType: 'Invoke',
        Account: testContext.alice.address,
        Destination: testContext.hook1.address,
      },
      wallet: testContext.alice,
    })
    console.log(response.meta)
    expect(response.meta).toHaveProperty('HookExecutions')
  })
})
