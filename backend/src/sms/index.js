const axios = require('axios')
const FormData = require('form-data')

const { ALIGO_SECRET_KEY, ALIGO_USER_ID, ALIGO_SEND_NUMBER } = process.env

const auth = {
  // 이곳에 발급받으신 api key를 입력하세요
  key: ALIGO_SECRET_KEY,
  // 이곳에 userid를 입력하세요
  user_id: ALIGO_USER_ID,
}

const formParse = (obj, auth, uri) => {
  return new Promise((resolve, reject) => {
      // 그외 (application/json)
      let postData = {};
      for (let key in auth) {
        // 인증정보
        postData[key] = auth[key]
      }
      for (let key in obj.body) {
        // json데이터
        postData[key] = obj.body[key]
      }
      postData.uri = uri
      return resolve(postData)
  })
}

const postRequest = (data) => {
  // request 발송하기
  let uri = data.uri

  let form = new FormData()
  for (let key in data) {
    form.append(key, data[key])
  }
  // formData로 변환
  let formHeaders = form.getHeaders();
  return new Promise((resolve, reject) => {
    axios.post(uri, form, {
      headers: {
        ...formHeaders
      }
    })
    .then((res) => {
      return resolve(res.data)
    })
    .catch((err) => {
      console.log(err)
      return reject(new Error(err.data))
    })
  });
}

const onError = (error) => {
  // 에러처리
  return new Promise((resolve, reject) => {
    return reject(new Error(error))
  });
}

const send = (receiver, verificationCode) => {
  // 문자보내기
  const obj = {
    body: {
      sender: ALIGO_SEND_NUMBER,
      receiver,
      msg: `허니픽에서 보낸 인증번호입니다. [${verificationCode}] 인증번호를 정확하게 입력해주세요.`,
      msg_type: 'SMS'
    }
  }

  return formParse(obj, auth, 'https://apis.aligo.in/send/')
    .then(postRequest)
    .catch(onError)
}

module.exports = {
  send
}