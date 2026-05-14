import fs from 'node:fs'
import {
  clearAllHooksV3,
  clearHookStateV3,
  hexNamespace,
  type iHook,
  readHookBinaryHexFromNS,
  type SetHookParams,
  setHooksV3,
  Xrpld,
} from '@transia/hooks-toolkit'
import {
  serverUrl,
  setupClient,
  teardownClient,
  type XrplIntegrationTestContext,
} from '@transia/hooks-toolkit/dist/npm/src/libs/xrpl-helpers'
import { compile } from 'jz-hook'
import { calculateHookOn, SetHookFlags } from 'xahau'

const namespace = 'namespace'

describe('test', () => {
  let testContext: XrplIntegrationTestContext

  beforeAll(async () => {
    const hookCode = fs.readFileSync('./contracts/index.js', 'utf8')
    const wasmBuffer = await compile(hookCode, { host: 'hook' })
    fs.writeFileSync('build/index.wasm', wasmBuffer)
    testContext = await setupClient(serverUrl)
    const hook: iHook = {
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
    console.log(JSON.stringify(response.meta?.AffectedNodes, null, 2))
    expect(response.meta).toHaveProperty('HookExecutions')
  })
})
