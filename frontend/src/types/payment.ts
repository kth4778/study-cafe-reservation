/** 화면에서 사용자가 선택하는 결제 수단 (5종) */
export type PaymentMethod = 'card' | 'cash' | 'kakao' | 'toss' | 'naver';

/** 백엔드 API에서 허용하는 결제 수단 (2종) */
export type ApiPaymentMethod = 'card' | 'cash';

/** PaymentMethod → ApiPaymentMethod 변환 (간편결제는 card로 처리) */
export function toApiMethod(method: PaymentMethod): ApiPaymentMethod {
  return method === 'cash' ? 'cash' : 'card';
}

/** 결제 수단 한국어 레이블 */
export const METHOD_LABEL: Record<PaymentMethod, string> = {
  card: '카드 결제',
  cash: '현금 결제',
  kakao: '카카오페이',
  toss: '토스페이',
  naver: '네이버페이',
};

export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

export interface PaymentResult {
  paymentId: string;
  approvalNumber: string;
  amount: number;
  method: ApiPaymentMethod;
}

export type PaymentErrorCode = 'E001' | 'E002' | 'E003' | 'E004' | 'E005' | 'E006';

export const PAYMENT_ERROR_MESSAGES: Record<PaymentErrorCode, string> = {
  E001: '잔액이 부족합니다. 다른 결제 수단을 이용해 주세요.',
  E002: '카드 유효기간이 만료되었습니다. 다른 카드를 사용해 주세요.',
  E003: '결제 한도를 초과하였습니다. 다른 결제 수단을 이용해 주세요.',
  E004: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도합니다.',
  E005: '서버 오류가 발생했습니다. 잠시 후 다시 시도합니다.',
  E006: '카드 인식에 실패했습니다. 카드를 다시 삽입해 주세요.',
};
