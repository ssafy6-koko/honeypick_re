/* eslint-disable @typescript-eslint/no-unused-vars */
import { memo, useState, useCallback } from 'react';
import styled from 'styled-components';

import {
  onlyNumber,
  // Alert - 새롭게 구현 필요
  // onlyNumberAlert,
  phoneValid,
} from '../../modules/valid';
import { BaseButton, BaseInput, FlexRow } from '../../styles/global-styles';
// import { useAppDispatch } from '../../../store/types';
// import {
//   requestPhoneVerify,
//   requestPhoneVerifyCheck,
// } from '../../../store/slices/user/asyncThunk';

// 명명규칙이 strict하게 미리 지정되어 있어서 인터페이스 이름 규칙을 새로 정해야 할듯?
export interface Props {
  setValidPhone: (text: string) => void;
}

const HorizontalView = styled.section`
  ${FlexRow}
  justify-content: space-between;
`;

function PhoneForm({ setValidPhone }: Props) {
  // const dispatch = useAppDispatch();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneId, setPhoneId] = useState('');
  const [phoneEditable, setPhoneEditable] = useState(true);
  const [status, setStatus] = useState<'idle' | 'request' | 'success' | 'fail'>(
    'idle',
  );

  const phoneNumberChanged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPhoneNumber(phoneValid(event.target.value));
    },
    [],
  );

  const verificationCodeChanged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setVerificationCode(onlyNumber(event.target.value));
    },
    [],
  );

  // const phoneSubmit = useCallback(() => {
  //   if (status === 'idle') {
  //     setStatus('request');
  //     setPhoneEditable(false);
  //     dispatch(requestPhoneVerify({ phoneNumber }))
  //       .unwrap()
  //       .then((response) => {
  //         console.log(response);
  //         setPhoneId(response.phone._id);
  //       })
  //       .catch(() => {
  //         Alert.alert('실패');
  //         setStatus('idle');
  //         setPhoneEditable(true);
  //       });
  //   } else if (status === 'request') {
  //     setStatus('idle');
  //     setPhoneEditable(true);
  //   }
  // }, [phoneNumber, status]);

  // const verificationCodeSubmit = useCallback(() => {
  //   dispatch(requestPhoneVerifyCheck({ phoneId, verificationCode }))
  //     .unwrap()
  //     .then((response) => {
  //       setStatus('success');
  //       setValidPhone(phoneNumber);
  //     })
  //     .catch(() => {
  //       setStatus('fail');
  //     });
  // }, [verificationCode, phoneId]);

  return (
    <div>
      <HorizontalView>
        <BaseInput
          value={phoneNumber}
          onChange={phoneNumberChanged}
          // onSubmit={phoneSubmit}
          // onKeyPress={onlyNumberAlert}
          placeholder="휴대전화번호"
          maxLength={13}
        />
        {status !== 'success' ? (
          <BaseButton
            // onClick={phoneSubmit}
            disabled={phoneNumber.length < 12}
          >
            {status === 'idle' ? '인증번호 요청' : '인증번호 재요청'}
          </BaseButton>
        ) : null}
      </HorizontalView>
      {status === 'request' || status === 'fail' ? (
        <HorizontalView>
          <BaseInput
            value={verificationCode}
            onChange={verificationCodeChanged}
            // onSubmit={verificationCodeSubmit}
            // onKeyPress={onlyNumberAlert}
            placeholder="인증번호"
            maxLength={6}
          />
          <BaseButton
            // onClick={verificationCodeSubmit}
            disabled={verificationCode.length < 6}
          >
            인증번호 확인
          </BaseButton>
        </HorizontalView>
      ) : null}
    </div>
  );
}

export default PhoneForm;
