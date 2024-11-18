
function add_viewing() {
   // Capture form fields
   const full_name = document.getElementById('request_viewing_full_name').value.trim();
   const move_in_date = document.getElementById('request_viewing_move_in_date').value.trim();
   const phone_number = document.getElementById('request_viewing_phone_number').value.trim();
   const email = document.getElementById('request_viewing_email').value.trim();
   const current_address = document.getElementById('request_viewing_current_address').value.trim();
   const length_at_address = document.getElementById('request_viewing_length_at_address').value.trim();
   const reason_for_leaving = document.getElementById('request_viewing_reason_for_leaving').value.trim();
   const employment_status = document.getElementById('request_viewing_employment_status').value.trim();
   const approximate_income = document.getElementById('request_viewing_approximate_income').value.trim();
   const occupants = document.getElementById('request_viewing_occupants').value.trim();
   const additional_info = document.getElementById('request_viewing_additional_info').value.trim();

   // Check for empty fields and collect names of missing ones
   const missingFields = [];
   if (!full_name) missingFields.push("Full Name");
   if (!move_in_date) missingFields.push("Move-in Date");
   if (!phone_number) missingFields.push("Phone Number");
   if (!email) missingFields.push("Email Address");
   if (!current_address) missingFields.push("Current Address");
   if (!length_at_address) missingFields.push("Length at Current Address");
   if (!reason_for_leaving) missingFields.push("Reason for Leaving");
   if (!employment_status) missingFields.push("Employment Status");
   if (!approximate_income) missingFields.push("Approximate Income");
   if (!occupants) missingFields.push("Occupants Information");

   // If there are missing fields, display a message and stop execution
   const messageContainer = document.getElementById('form-message');
   if (missingFields.length > 0) {
       messageContainer.innerText = `The following fields are missing: ${missingFields.join(", ")}. Please fill them out.`;
       return; // Stop execution
   }

   // Clear any previous messages
   messageContainer.innerText = "";


   // Structure the form data
   const formData = {
       full_name: full_name,
       move_in_date: move_in_date,
       phone_number: phone_number,
       email: email,
       current_address: current_address,
       length_at_address: length_at_address,
       reason_for_leaving: reason_for_leaving,
       employment_status: employment_status,
       approximate_income: approximate_income,
       occupants: occupants,
       additional_info: additional_info
   };

    // Send the data to the API
    fetch('https://vwq97non9k.execute-api.us-east-1.amazonaws.com/prod/add_viewing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)  // Send the form data as JSON
    })
    .then(response => response.ok ? response.json() : Promise.reject('Failed to add'))
    .then(response => {
        const { message } = response.body ? JSON.parse(response.body) : response;
        if (message === "Added viewing successfully") {
            console.log(message);
            open_confirmation();    // Open confirmation modal
        } else {
            console.error('Failed to add. Error:', response);
        }
    })
    .catch(error => console.error('Error:', error));
}


function open_confirmation() {
    document.getElementById("modal_overlay").style.display = "block";
    document.getElementById("confirmation_modal").style.display = "block";
    document.body.style.overflow = "hidden"; 
}


function close_confirmation() {
    window.location.href = '../index.html';
}

