/* eslint no-console: off */
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { usernameValid } from '../modules/valid';
import {
  BaseButton,
  BaseInput,
  FlexColumn,
  FlexRow,
  Img,
  Text12,
} from '../styles/global-styles';
import { textLogoImg } from '../styles/imges';

const Container = styled.main`
  ${FlexColumn}
  justify-content: center;
  align-items: center;
  width: 80%;
  gap: 15px;
`;

const InfoContainer = styled.section`
  width: 100%;
  ${FlexRow}
  justify-content: space-between;
`;

const FormContainer = styled.section`
  width: 100%;
  ${FlexColumn}
  gap: 10px;
`;

const Figure = styled.figure`
  width: 100%;
`;

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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

  const clickSubmit = useCallback(() => {
    console.log(`username : ${username}`);
    console.log(`password : ${password}`);
  }, [username, password]);

  const memoUsernameInput = useMemo(
    () => <BaseInput type="text" value={username} onChange={changeUsername} />,
    [username, changeUsername],
  );

  const memoPasswordInput = useMemo(
    () => (
      <BaseInput type="password" value={password} onChange={changePassword} />
    ),
    [password, changePassword],
  );

  const memoSubmitButton = useMemo(
    () => <BaseButton onClick={clickSubmit}>로그인</BaseButton>,
    [clickSubmit],
  );

  return (
    <FormContainer>
      {memoUsernameInput}
      {memoPasswordInput}
      {memoSubmitButton}
    </FormContainer>
  );
}

function Signin(): JSX.Element {
  const navigate = useNavigate();

  const clickBeginner = useCallback(() => {
    // 첫 방문인 사람을 위한 안내 페이지 제작 필요
  }, []);

  const clickSignUp = useCallback(() => {
    navigate('/signup');
  }, [navigate]);

  return (
    <Container>
      <Figure>
        <Img src={textLogoImg} />
      </Figure>
      <LoginForm />
      <InfoContainer>
        <Text12 onClick={clickBeginner}>허니픽이 처음이신가요?</Text12>
        <Text12 onClick={clickSignUp}>회원가입</Text12>
      </InfoContainer>
    </Container>
  );
}

export default Signin;
