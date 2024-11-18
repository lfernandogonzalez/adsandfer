document.addEventListener('DOMContentLoaded', function() {
   get_mrequests();
});

function get_mrequests() {
    const api_url = 'https://bvzzykj0n4.execute-api.us-east-1.amazonaws.com/prod/get_requests';
    const tbody = document.getElementById('all_mrequests').querySelector('tbody');

    fetch(api_url)
        .then(response => response.json())
        .then(mrequests => {
            const fragment = document.createDocumentFragment();
            mrequests.forEach(mrequest => {
                const row = document.createElement('tr');

                // Extract fields from mrequest data
                const fields = [
                    mrequest.tenant_name?.S || '',       // Tenant name (single field now)
                    mrequest.phone?.S,            // Phone number
                    mrequest.email?.S,            // Email address
                    mrequest.address?.S,          // Property address
                    mrequest.apartment?.S,             // apartment number
                    mrequest.details?.S,          // Description/Details
                    mrequest.urgency?.S          // Urgency
                    
                ];

                // Create table cells for each field
                fields.forEach(field => {
                    const cell = document.createElement('td');
                    cell.textContent = field || ''; // Use empty string for undefined fields
                    row.appendChild(cell);
                });


                // Append notes cell (if any)
                const notesCell = document.createElement('td');
                notesCell.textContent = mrequest.notes?.S || '';  // Show notes if available
                row.appendChild(notesCell);

                // Append actions (Edit and Delete buttons)
                const actionCell = document.createElement('td');

                // Edit button (as an image)
                const editButton = document.createElement('img');
                editButton.src = 'img/edit_icon.png';  // Replace with your actual edit icon path
                editButton.alt = 'Edit';
                editButton.style.width = '24px';  // Adjust size if necessary
                editButton.style.marginRight = '10px';  // Add spacing between buttons
                editButton.style.cursor = 'pointer';  // Pointer cursor to indicate clickable button
                editButton.onclick = () => open_edit_mrequest_modal(mrequest);  // Trigger the edit modal (implement this function)
                actionCell.appendChild(editButton);

                // Delete button (as an image)
                const deleteButton = document.createElement('img');
                deleteButton.src = 'img/delete_icon.png';  // Replace with your actual delete icon path
                deleteButton.alt = 'Delete';
                deleteButton.style.width = '24px';  // Adjust size if necessary
                deleteButton.style.cursor = 'pointer';  // Pointer cursor to indicate clickable button
                deleteButton.onclick = () => delete_mrequest(mrequest.request_id);  // Trigger the delete function
                actionCell.appendChild(deleteButton);

                row.appendChild(actionCell);  // Add the action buttons cell

                fragment.appendChild(row);  // Append row to the document fragment
            });

            // Clear and append new rows in one operation
            tbody.innerHTML = '';
            tbody.appendChild(fragment);

            // Log success message
            console.log("Maintenance requests loaded successfully");
        })
        .catch(error => console.error('Error fetching maintenance requests:', error));
}






function open_edit_mrequest_modal(mrequest) {
    console.log(mrequest);

    // Populate tenant details
    document.getElementById("edit_mrequest_id").value = mrequest.request_id?.S || "";
    document.getElementById("edit_mrequest_tenant_name").value = mrequest.tenant_name?.S || "";
    document.getElementById("edit_mrequest_phone").value = mrequest.phone?.S || "";
    document.getElementById("edit_mrequest_email").value = mrequest.email?.S || "";

    // Populate property details
    document.getElementById("edit_mrequest_address").value = mrequest.address?.S || "";
    document.getElementById("edit_mrequest_apartment").value = mrequest.apartment?.S || "";

    // Populate request details
    document.getElementById("edit_mrequest_details").value = mrequest.details?.S || "";
    document.getElementById("edit_mrequest_urgency").value = mrequest.urgency?.S || "";

    // Show the modal
    document.getElementById("modal_overlay").style.display = "block";
    document.getElementById("edit_mrequest_modal").style.display = "block";
    document.body.style.overflow = "hidden";
}


function close_edit_mrequest() {
    document.getElementById("modal_overlay").style.display = "none";
    document.getElementById("edit_mrequest_modal").style.display = "none";
    document.body.style.overflow = ""; 
}


function edit_mrequest() {
    // Collecting the form data
    const formData = {
        request_id: document.getElementById("edit_mrequest_id").value, // Assuming the request_id is included as a hidden field
        tenant_name: document.getElementById("edit_mrequest_tenant_name").value,
        phone: document.getElementById("edit_mrequest_phone").value,
        email: document.getElementById("edit_mrequest_email").value,
        address: document.getElementById("edit_mrequest_address").value,
        apartment: document.getElementById("edit_mrequest_apartment").value,
        details: document.getElementById("edit_mrequest_details").value,
        urgency: document.getElementById("edit_mrequest_urgency").value
    };

    // Sending data to API
    fetch('https://bvzzykj0n4.execute-api.us-east-1.amazonaws.com/prod/edit_mrequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.ok ? response.json() : Promise.reject(response))
    .then(response => {
        const parsedResponse = JSON.parse(response.body); // Parse the response body
        if (parsedResponse.message === "Request edited successfully") {
            console.log(parsedResponse.message);
            get_mrequests();
            close_edit_mrequest();
        } else {
            console.error('Request was not edited successfully:', parsedResponse);
        }
    })
    .catch(error => {
        error.json().then(err => console.error('Error:', err));
    });
}




function delete_mrequest(request_id) {
    if (window.confirm('Are you sure you want to delete this Maintenance request?')) {
        fetch('https://bvzzykj0n4.execute-api.us-east-1.amazonaws.com/prod/delete_mrequest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_id: request_id })
        })
        .then(response => response.ok ? response.json() : Promise.reject('Failed to delete mrequest'))
        .then(response => {
            const { message } = response.body ? JSON.parse(response.body) : response;
            if (message === "Maintenance request deleted successfully") {
                console.log(message);
                get_mrequests();
            } else {
                console.error('mrequest deletion failed:', response);
            }
        })
        .catch(error => console.error('Error:', error));
    } else {
        console.log("mrequest deletion canceled");
    }
}



