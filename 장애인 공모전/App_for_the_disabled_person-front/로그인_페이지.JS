function handleCredentialResponse(response) {
  console.log("구글 토큰:", response.credential);
  alert("로그인 된 것처럼 보이지만 실제 로그인 아님");
}

Kakao.init("YOUR_APP_KEY");

function loginWithKakao() {
  Kakao.Auth.login({
    success: function(authObj) {
      console.log("카카오 토큰:", authObj.access_token);
      alert("로그인 된 것처럼 보이지만 실제 로그인 아님");
    },
    fail: function(err) {
      console.error(err);
    }
  });
}