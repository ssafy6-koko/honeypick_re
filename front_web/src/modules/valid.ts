/* 입력 데이터 검증 관련된 변수 및 함수 */

/* 공백 관련 */
// 공백 입력이 있는 경우, 공백을 모두 제거해서 반환
export const noSpace = (text: string): string => {
  const covertText = text;
  return covertText.replace(' ', '');
};

/* username 관련 */
// username 가능한 문자 정규표현식
const usernameRegex = /[^a-z|A-Z|0-9|_]/g;

// 특수문자 입력시 모두 제거해서 반환
export const usernameValid = (text: string): string => {
  const converted = text;
  return converted.replace(usernameRegex, '');
};

/* nickname 관련 */
// nickname 가능한 문자 정규표현식
const nicknameRegex = /[^a-z|A-Z|0-9|ㄱ-ㅎ|가-힣]/g;

// 특수문자 입력시 모두 제거해서 반환
export const nicknameValid = (text: string): string => {
  return text.replace(nicknameRegex, '');
};

/* 비밀번호 관련 */
// 비밀번호와 비밀번호 확인이 일치하지 않는 경우
export const passwordCompare = (
  password1: string,
  password2: string,
): boolean => {
  return password1 === password2;
};

/* 휴대전화 번호 관련 */
// 휴대전화 번호 3자리-4자리-4자리
export const phoneValid = (text: string): string => {
  const converted = text;
  return converted
    .replace(/[^0-9]/g, '')
    .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, '$1-$2-$3')
    .replace(/(\\-{1,2})$/g, '');
};

// 휴대전화 번호 인증 코드 숫자만 입력 가능하도록
export const onlyNumber = (text: string): string => {
  const converted = text;
  return converted.replace(/\D/g, '');
};
