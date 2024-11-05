async function get_user(home) {
  var data = { UserPoolId: _config.cognito.userPoolId, ClientId: _config.cognito.clientId };
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
  var cognitoUser = userPool.getCurrentUser();

  if (cognitoUser != null) {
    cognitoUser.getSession(function (err, session) {
      if (err) { console.log(err); return; }
      console.log('session validity: ' + session.isValid());

      cognitoUser.getUserAttributes(function (err, result) {
        if (err) { console.log(err); return; }

        email = result[0].getValue();
        console.log("Logged in user:" + email);
        document.getElementById('member_email').innerHTML = email;
        document.body.classList.remove('invisible');
        
      });
    });
  } else {
    console.log("User is signed-out");
    if(!home) { window.location.href = './index.html';}
  }
}


// Sign in
function sign_in() {
      
  var email = document.getElementById("sign_in_email").value;
  var password = document.getElementById("sign_in_password").value;
  var authenticationData = { Username : email, Password : password, };
  var data = { UserPoolId : _config.cognito.userPoolId, ClientId : _config.cognito.clientId };
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
  var cognitoUser = userPool.getCurrentUser();
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
  var userData = { Username : email, Pool : userPool,};
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  
  cognitoUser.authenticateUser(authenticationDetails, {    
    onSuccess: function (result) {
      var accessToken = result.getAccessToken().getJwtToken();
      console.log(result);	

      cognitoUser.getUserAttributes(function(err, result) {
        if (err) { console.log(err); return;}
        window.location.href='./management.html';
      });

    },
      onFailure: function(err) { alert(err.message || JSON.stringify(err));},
  });
      
}


function sign_out() {
  const data = {
    UserPoolId: _config.cognito.userPoolId,
    ClientId: _config.cognito.clientId
  };
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
  const cognitoUser = userPool.getCurrentUser();

  if (cognitoUser != null) {
    cognitoUser.getSession(function (err, session) {
      if (err) {
        alert(err);
        return;
      }
      console.log('session validity: ' + session.isValid());

      // sign out
      cognitoUser.signOut();
      console.log("Sign out successful");
    });
  } else {
    console.log("Already signed-out")
  }
  window.location.href = './index.html';
}

