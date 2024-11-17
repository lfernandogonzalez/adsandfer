
function add_mrequest() {
    // Capture form fields
    const tenantName = document.getElementById('add_mrequest_tenant_name').value.trim();
    const phone = document.getElementById('add_mrequest_phone').value.trim();
    const email = document.getElementById('add_mrequest_email').value.trim();
    const address = document.getElementById('add_mrequest_address').value.trim();
    const appartment = document.getElementById('add_mrequest_appartment').value.trim();
    const details = document.getElementById('add_mrequest_details').value.trim();
    const urgency = document.getElementById('add_mrequest_urgency').value.trim();

    // Check for empty fields and collect names of missing ones
    const missingFields = [];
    if (!address) missingFields.push("Property address");
    if (!appartment) missingFields.push("Apartment number");
    if (!tenantName) missingFields.push("Tenant Name");
    if (!phone) missingFields.push("Phone number");
    if (!email) missingFields.push("Email address");
    if (!details) missingFields.push("Details of the request");
    if (!urgency) missingFields.push("Urgency level");

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
        tenant_name: tenantName,
        phone: phone,
        email: email,
        address: address,
        appartment: appartment,
        details: details,
        urgency: urgency
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
            open_confirmation();    // Open confirmation modal
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

