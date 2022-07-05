/*
글자 원하는 길이 이상시 생략

text - 문자열
lenght - 원하는 길이 
*/
export const ellipsis = (text: string, length: number) => {
  return text.length >= length
    ? `${text.split('\n').join(' ').slice(0, length)}⋯`
    : text;
};

/*
숫자 3자리마다 콤마 찍기

price - 가격 (문자열 or 숫자)
*/
export const priceComma = (price: number | string) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
