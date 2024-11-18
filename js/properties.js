document.addEventListener('DOMContentLoaded', function() {
    get_viewings();
});

function get_viewings() {
    const api_url = 'https://vwq97non9k.execute-api.us-east-1.amazonaws.com/prod/get_viewings';
    const tbody = document.getElementById('all_viewings').querySelector('tbody');

    fetch(api_url)
        .then(response => response.json())
        .then(viewings => {
            const fragment = document.createDocumentFragment();
            viewings.forEach(viewing => {
                const row = document.createElement('tr');

                // Extract fields from viewing data
                const fields = [
                    viewing.full_name?.S || '',       // Full Name
                    viewing.move_in_date?.S || '',   // Move-in Date
                    viewing.phone_number?.S || '',   // Phone Number
                    viewing.email?.S || '',          // Email Address
                    viewing.current_address?.S || '', // Current Address
                    viewing.length_at_address?.S || '', // Length at Address
                    viewing.reason_for_leaving?.S || '', // Reason for Leaving
                    viewing.employment_status?.S || '', // Employment Status
                    viewing.approximate_income?.S || '', // Approximate Income
                    viewing.occupants?.S || '',       // Occupants
                    viewing.additional_info?.S || '',  // Additional Info
                    viewing.notes?.S || ''  
                ];

                // Create table cells for each field
                fields.forEach(field => {
                    const cell = document.createElement('td');
                    cell.textContent = field || ''; // Use empty string for undefined fields
                    row.appendChild(cell);
                });

                // Append actions (Edit and Delete buttons)
                const actionCell = document.createElement('td');

                // Edit button (as an image)
                const editButton = document.createElement('img');
                editButton.src = 'img/edit_icon.png';  // Replace with your actual edit icon path
                editButton.alt = 'Edit';
                editButton.style.width = '24px';  // Adjust size if necessary
                editButton.style.marginRight = '10px';  // Add spacing between buttons
                editButton.style.cursor = 'pointer';  // Pointer cursor to indicate clickable button
                editButton.onclick = () => open_edit_viewing_modal(viewing);  // Trigger the edit modal
                actionCell.appendChild(editButton);

                // Delete button (as an image)
                const deleteButton = document.createElement('img');
                deleteButton.src = 'img/delete_icon.png';  // Replace with your actual delete icon path
                deleteButton.alt = 'Delete';
                deleteButton.style.width = '24px';  // Adjust size if necessary
                deleteButton.style.cursor = 'pointer';  // Pointer cursor to indicate clickable button
                deleteButton.onclick = () => delete_viewing(viewing.viewing_id?.S);  // Trigger the delete function
                actionCell.appendChild(deleteButton);

                row.appendChild(actionCell);  // Add the action buttons cell

                fragment.appendChild(row);  // Append row to the document fragment
            });

            // Clear and append new rows in one operation
            tbody.innerHTML = '';
            tbody.appendChild(fragment);

            // Log success message
            console.log("Viewings loaded successfully");
        })
        .catch(error => console.error('Error fetching viewings:', error));
}

function open_edit_viewing_modal(viewing) {
    console.log(viewing);

    // Populate viewing details
    document.getElementById("edit_viewing_id").value = viewing.viewing_id?.S || "";
    document.getElementById("edit_full_name").value = viewing.full_name?.S || "";
    document.getElementById("edit_move_in_date").value = viewing.move_in_date?.S || "";
    document.getElementById("edit_phone_number").value = viewing.phone_number?.S || "";
    document.getElementById("edit_email").value = viewing.email?.S || "";
    document.getElementById("edit_current_address").value = viewing.current_address?.S || "";
    document.getElementById("edit_length_at_address").value = viewing.length_at_address?.S || "";
    document.getElementById("edit_reason_for_leaving").value = viewing.reason_for_leaving?.S || "";
    document.getElementById("edit_employment_status").value = viewing.employment_status?.S || "";
    document.getElementById("edit_approximate_income").value = viewing.approximate_income?.S || "";
    document.getElementById("edit_occupants").value = viewing.occupants?.S || "";
    document.getElementById("edit_additional_info").value = viewing.additional_info?.S || "";
    document.getElementById("edit_notes").value = viewing.notes?.S || "";

    // Show the modal
    document.getElementById("modal_overlay").style.display = "block";
    document.getElementById("edit_viewing_modal").style.display = "block";
    document.body.style.overflow = "hidden";
}

function close_edit_viewing() {
    document.getElementById("modal_overlay").style.display = "none";
    document.getElementById("edit_viewing_modal").style.display = "none";
    document.body.style.overflow = ""; 
}

function edit_viewing() {
    // Collecting the form data
    const formData = {
        viewing_id: document.getElementById("edit_viewing_id").value,
        full_name: document.getElementById("edit_full_name").value,
        move_in_date: document.getElementById("edit_move_in_date").value,
        phone_number: document.getElementById("edit_phone_number").value,
        email: document.getElementById("edit_email").value,
        current_address: document.getElementById("edit_current_address").value,
        length_at_address: document.getElementById("edit_length_at_address").value,
        reason_for_leaving: document.getElementById("edit_reason_for_leaving").value,
        employment_status: document.getElementById("edit_employment_status").value,
        approximate_income: document.getElementById("edit_approximate_income").value,
        occupants: document.getElementById("edit_occupants").value,
        additional_info: document.getElementById("edit_additional_info").value,
        notes: document.getElementById("edit_notes").value
    };

    // Sending data to API
    fetch('https://vwq97non9k.execute-api.us-east-1.amazonaws.com/prod/edit_viewing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.ok ? response.json() : Promise.reject(response))
    .then(response => {
        const parsedResponse = JSON.parse(response.body);
        if (parsedResponse.message === "Viewing edited successfully") {
            console.log(parsedResponse.message);
            get_viewings();
            close_edit_viewing();
        } else {
            console.error('Edit not successful: ', parsedResponse);
        }
    })
    .catch(error => {
        error.json().then(err => console.error('Error:', err));
    });
}


function delete_viewing(viewing_id) {
    if (window.confirm('Are you sure you want to delete this?')) {
        fetch('https://vwq97non9k.execute-api.us-east-1.amazonaws.com/prod/delete_viewing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ viewing_id: viewing_id })
        })
        .then(response => response.ok ? response.json() : Promise.reject('Failed to delete'))
        .then(response => {
            const { message } = response.body ? JSON.parse(response.body) : response;
            if (message === "Viewing deleted successfully") {
                console.log(message);
                get_viewings();
            } else {
                console.error('Deletion failed:', response);
            }
        })
        .catch(error => console.error('Error:', error));
    } else {
        console.log("Deletion canceled");
    }
}

