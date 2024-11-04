window.onload = function() {
  // Set up User Pool details
  const poolData = {
    UserPoolId: 'us-east-1_BHPZoFOKq', // Replace with your User Pool ID
    ClientId: 'oronbc9rqqtsamf8a60ndf6vd' // Replace with your Client ID
  };

  try {
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    function checkUserLoggedIn() {
      const cognitoUser = userPool.getCurrentUser();
      
      if (cognitoUser) {
        cognitoUser.getSession((err, session) => {
          if (err) {
            console.log("Error retrieving session:", err);
          } else if (session.isValid()) {
            console.log("User is logged in:", cognitoUser);
          } else {
            console.log("Session is invalid.");
          }
        });
      } else {
        console.log("No user is currently logged in.");
      }
    }

    // Call the function to check login status
    checkUserLoggedIn();
  } catch (error) {
    console.error("Error initializing Cognito User Pool:", error);
  }
};