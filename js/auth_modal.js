// Function to open the modal
function openModal(home) {
    if(home) {
      var data = { UserPoolId: _config.cognito.userPoolId, ClientId: _config.cognito.clientId };
      var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
      var cognitoUser = userPool.getCurrentUser();
    
      if (cognitoUser != null) {
        cognitoUser.getSession(function (err, session) {
          if (err) { console.log(err); return; }
          console.log('session validity: ' + session.isValid());
    
          cognitoUser.getUserAttributes(function (err, result) {
            if (err) { console.log(err); return; }
    
            console.log("User is logged in");
            window.location.href = './management.html';
            
          });
        });
      } 
    }  
    document.getElementById("modalOverlay").style.display = "block";
    document.getElementById("auth_modal").style.display = "block";
  }
  
  // Function to close the modal
  function closeModal() {
    document.getElementById("modalOverlay").style.display = "none";
    document.getElementById("auth_modal").style.display = "none";
  }
  