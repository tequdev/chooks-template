/**
 * This hook just accepts any transaction coming through it
 */
#include "utils/hookapi.h"

#define UINT8 16
#define UINT16 1
#define UINT32 2
#define UINT64 3
#define UINT128 4
#define UINT256 5
#define AMOUNT 6
#define VL 7
#define ACCOUNT 8

int64_t increment(uint32_t reserved) {
  uint8_t key[256];
  uint32_t key_len = otxn_func_param(SBUF(key), 0, VL);

  uint8_t increment_amount;
  otxn_func_param(SVAR(increment_amount), 1, UINT8);

  uint32_t amount;
  state(SVAR(amount), key, key_len);
  amount += increment_amount;

  state_set(SVAR(amount), key, key_len);

  _g(1, 1);
  return accept(SBUF("accept"), __LINE__);
}

int64_t decrement(uint32_t reserved) {
  uint8_t key[256];
  uint32_t key_len = otxn_func_param(SBUF(key), 0, VL);

  uint8_t decrement_amount;
  otxn_func_param(SVAR(decrement_amount), 1, UINT8);

  uint32_t amount;
  state(SVAR(amount), key, key_len);
  amount -= decrement_amount;

  state_set(SVAR(amount), key, key_len);

  _g(1, 1);
  return accept(SBUF("accept"), __LINE__);
}

int64_t queryValue(uint32_t reserved) {
  uint8_t key[256];
  int32_t key_len = otxn_func_param(SBUF(key), 0, VL);
  TRACEVAR(key_len);

  uint32_t amount;
  trace_num(SBUF("state"), state(SVAR(amount), key, key_len));

  query_result_set(SBUF("current_amount"), SVAR(amount), UINT32);

  _g(1, 1);
  return accept(SBUF("accept"), __LINE__);
}
