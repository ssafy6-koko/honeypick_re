/* eslint-disable @typescript-eslint/no-unused-vars */
import { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import PhoneForm from '../components/signup/PhoneForm';
import { usernameValid, passwordCompare } from '../modules/valid';
import {
  BaseButton,
  BaseInput,
  FlexColumn,
  // FlexRow,
  Img,
  TextMd,
} from '../styles/global-styles';
import { textLogoImg } from '../styles/imges';

const Container = styled.main`
  ${FlexColumn}
  justify-content: center;
  align-items: center;
  width: 80%;
  gap: 15px;
`;

const FormContainer = styled.section`
  width: 100%;
  ${FlexColumn}
  gap: 10px;
`;

const Figure = styled.figure`
  width: 100%;
`;

function SignupForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [passwordIsSame, setPasswordIsSame] = useState(false);

  const buttonDisabled = !(username && password === passwordConfirm && phone);
  const passwordConfirmError = !passwordIsSame && passwordConfirm.length > 0;

  const changeUsername = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(usernameValid(event.target.value));
    },
    [],
  );

  const changePassword = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
    },
    [],
  );

  const changePasswordConfirm = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordConfirm(event.target.value);
      setPasswordIsSame(passwordCompare(password, event.target.value));
    },
    [password],
  );

  // 나중에 phoneForm으로 변경
  const changePhone = useCallback((text: string) => {
    setPhone(text);
  }, []);

  const changeNickname = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setNickname(event.target.value);
    },
    [],
  );

  const signupSubmit = useCallback(() => {
    console.log(`username : ${username}`);
    console.log(`password : ${password}`);
    console.log(`passwordConfirm : ${passwordConfirm}`);
    console.log(`phone : ${phone}`);
    console.log(`nickname : ${nickname}`);
  }, [username, password, passwordConfirm, phone, nickname]);

  const memoUsernameInput = useMemo(
    () => (
      <BaseInput
        type="text"
        value={username}
        placeholder="아이디"
        onChange={changeUsername}
      />
    ),
    [username, changeUsername],
  );

  const memoPasswordInput = useMemo(
    () => (
      <BaseInput
        type="password"
        value={password}
        placeholder="비밀번호"
        onChange={changePassword}
      />
    ),
    [password, changePassword],
  );

  const memoPasswordConfirmInput = useMemo(
    () => (
      <BaseInput
        type="password"
        value={passwordConfirm}
        placeholder="비밀번호 확인"
        onChange={changePasswordConfirm}
      />
    ),
    [passwordConfirm, changePasswordConfirm],
  );

  const memoNicknameInput = useMemo(
    () => (
      <BaseInput
        type="text"
        value={nickname}
        placeholder="닉네임"
        onChange={changeNickname}
      />
    ),
    [nickname, changeNickname],
  );

  const memoSubmitButton = useMemo(
    () => (
      <BaseButton onClick={signupSubmit} disabled={buttonDisabled}>
        회원가입
      </BaseButton>
    ),
    [signupSubmit, buttonDisabled],
  );

  return (
    <FormContainer>
      {memoUsernameInput}
      {memoPasswordInput}
      {memoPasswordConfirmInput}
      {passwordConfirmError ? (
        <TextMd>비밀번호가 일치하지 않습니다.</TextMd>
      ) : null}
      <PhoneForm setValidPhone={changePhone} />
      {memoNicknameInput}
      {memoSubmitButton}
    </FormContainer>
  );
}

function Signup(): JSX.Element {
  const navigate = useNavigate();

  const clickSignIn = useCallback(() => {
    navigate('/signin');
  }, [navigate]);

  return (
    <Container>
      <Figure>
        <Img src={textLogoImg} />
      </Figure>
      <SignupForm />
      <TextMd onClick={clickSignIn}>로그인 하러가기</TextMd>
    </Container>
  );
}

export default memo(Signup);
