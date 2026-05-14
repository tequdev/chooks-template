import {
  hook_account,
  ledger_last_time,
  otxn_field,
  otxn_type,
  sfAccount,
  sfSequence,
  state_set,
  trace,
  trace_num,
} from 'hook'

export const hook = () => {
  const tt = otxn_type()
  trace_num('tt', tt)

  const hook_acc = new Uint8Array(20)
  hook_account(hook_acc)
  trace('hook_acc', hook_acc, true)

  const otxn_acc = new Uint8Array(20)
  trace_num('otxn_field', otxn_field(otxn_acc, sfAccount))
  trace('otxn_acc', otxn_acc, true)

  trace_num('ledger_last_time', ledger_last_time())
  trace_num('otxn_seq', otxn_field(undefined, sfSequence))

  const result = state_set('value', 'key')
  trace_num('result', result)

  if (otxn_type() === 0) {
    // rollback
    throw 'error message'
  }

  // accept
  return 'success message'
}
