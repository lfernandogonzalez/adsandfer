
function add_mrequest() {
    // Capture form data and structure it accordingly
    const formData = {
        tenant_name: document.getElementById('add_mrequest_tenant_name').value,    // Tenant name
        phone: document.getElementById('add_mrequest_phone').value,  // Phone number
        email: document.getElementById('add_mrequest_email').value,  // Email address
        address: document.getElementById('add_mrequest_address').value,  // Property address
        appartment: document.getElementById('add_mrequest_appartment').value,    // appartment number
        details: document.getElementById('add_mrequest_details').value,  // Request details
        urgency: document.getElementById('add_mrequest_urgency').value  // Urgency level
    };

    // Send the data to the API
    fetch('https://bvzzykj0n4.execute-api.us-east-1.amazonaws.com/prod/add_mrequest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)  // Send the form data as JSON
    })
    .then(response => response.ok ? response.json() : Promise.reject('Failed to add mrequest'))
    .then(response => {
        const { message } = response.body ? JSON.parse(response.body) : response;
        if (message === "Maintenance request added successfully") {
            console.log(message);
            open_confirmation();    // Close the modal after successful submission
            
        } else {
            console.error('Mrequest was not added successfully:', response);
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
    window.location.href = './index.html';
}

