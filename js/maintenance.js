document.addEventListener('DOMContentLoaded', function () {
    get_mrequests();
  });
  
  function get_mrequests() {
    const api_url = 'https://bvzzykj0n4.execute-api.us-east-1.amazonaws.com/prod/get_requests';
    const tbody = document.getElementById('all_mrequests').querySelector('tbody');
    const loadingBar = document.getElementById('loading-bar');
  
    // Show loading bar
    loadingBar.style.display = 'flex';
  
    fetch(api_url)
      .then(response => response.json())
      .then(mrequests => {
        const fragment = document.createDocumentFragment();
  
        mrequests.forEach(mrequest => {
          const row = document.createElement('tr');
  
          const fields = [
            mrequest.tenant_name?.S || '', // Tenant name
            mrequest.phone?.S,            // Phone number
            mrequest.email?.S,            // Email address
            mrequest.address?.S,          // Property address
            mrequest.apartment?.S,        // Apartment number
            mrequest.details?.S,          // Details
            mrequest.urgency?.S           // Urgency
          ];
  
          fields.forEach(field => {
            const cell = document.createElement('td');
            cell.textContent = field || '';
            row.appendChild(cell);
          });
  
          const notesCell = document.createElement('td');
          notesCell.textContent = mrequest.notes?.S || '';
          row.appendChild(notesCell);
  
          const actionCell = document.createElement('td');
          const editButton = document.createElement('img');
          editButton.src = 'img/edit_icon.png';
          editButton.alt = 'Edit';
          editButton.style.width = '24px';
          editButton.style.marginRight = '10px';
          editButton.style.cursor = 'pointer';
          editButton.onclick = () => open_edit_mrequest_modal(mrequest);
          actionCell.appendChild(editButton);
  
          const deleteButton = document.createElement('img');
          deleteButton.src = 'img/delete_icon.png';
          deleteButton.alt = 'Delete';
          deleteButton.style.width = '24px';
          deleteButton.style.cursor = 'pointer';
          deleteButton.onclick = () => delete_mrequest(mrequest.request_id);
          actionCell.appendChild(deleteButton);
  
          row.appendChild(actionCell);
  
          fragment.appendChild(row);
        });
  
        tbody.innerHTML = '';
        tbody.appendChild(fragment);
  
        console.log("Maintenance requests loaded successfully");
      })
      .catch(error => console.error('Error fetching maintenance requests:', error))
      .finally(() => {
        // Hide loading bar
        loadingBar.style.display = 'none';
      });
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



