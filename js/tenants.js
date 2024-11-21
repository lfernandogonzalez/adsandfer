
document.addEventListener('DOMContentLoaded', function() {
    get_tenants();
});


function get_tenants() {
    const api_url = 'https://91g2v0hbu6.execute-api.us-east-1.amazonaws.com/prod/get_tenants';
    const tbody = document.getElementById('all_tenants').querySelector('tbody');
    const loadingBar = document.getElementById('loading-bar');
    loadingBar.style.display = 'flex';

    fetch(api_url)
        .then(response => response.json())
        .then(tenants => {
            const fragment = document.createDocumentFragment();
            tenants.forEach(tenant => {
                const row = document.createElement('tr');

                // Extract utilities from tenant data
                const utilities = [];
                if (tenant.water?.BOOL) utilities.push('Water');
                if (tenant.electricity?.BOOL) utilities.push('Electricity');
                if (tenant.hydro?.BOOL) utilities.push('Hydro');
                if (tenant.gas?.BOOL) utilities.push('Gas');
                if (tenant.heat?.BOOL) utilities.push('Heat');
                const utilitiesText = utilities.length > 0 ? utilities.join(', ') : 'None'; // Join utilities with commas

                // Create and append cells for each tenant field
                const fields = [
                    tenant.address?.S, tenant.apartment?.S,
                    tenant.first_name?.S && tenant.last_name?.S ? `${tenant.first_name.S} ${tenant.last_name.S}` : '',
                    tenant.phone_number?.S, tenant.tenant_email?.S,
                    tenant.lease_start?.S, tenant.lease_end?.S,
                    tenant.deposit?.S, tenant.monthly?.S,
                    utilitiesText // Add utilities info to the row
                ];

                fields.forEach(field => {
                    const cell = document.createElement('td');
                    cell.textContent = field || ''; // Use empty string for undefined fields
                    row.appendChild(cell);
                });

                // Contract column - modify this to show image with link
                const contractCell = document.createElement('td');
                if (tenant.contract?.S) {  // If contract URL exists
                    const contractUrl = tenant.contract.S;
                    const link = document.createElement('a');
                    link.href = contractUrl;
                    link.target = "_blank";  // Open the link in a new tab
                    const img = document.createElement('img');
                    img.src = 'img/download.png';  // Replace with your actual image path
                    img.alt = 'Download contract';
                    img.style.width = '24px';  // Adjust the size as needed
                    link.appendChild(img);
                    contractCell.appendChild(link);
                } else {
                    contractCell.textContent = 'No contract';  // Display a message if no contract exists
                }
                row.appendChild(contractCell);

                // Append notes cell at the end
                const notesCell = document.createElement('td');
                notesCell.textContent = tenant.notes?.S || '';  // Show notes
                row.appendChild(notesCell);

                // Append actions
                const actionCell = document.createElement('td');

                // Create the edit button as an image
                const editButton = document.createElement('img');
                editButton.src = 'img/edit_icon.png';  // Replace with your actual edit icon path
                editButton.alt = 'Edit';
                editButton.style.width = '24px';  // Adjust the size as needed
                editButton.style.marginRight = '10px';  // Add some spacing between buttons
                editButton.style.cursor = 'pointer';  // Change cursor to indicate it's clickable
                editButton.onclick = () => open_edit_tenant_modal(tenant);
                actionCell.appendChild(editButton);

                // Create the delete button as an image
                const deleteButton = document.createElement('img');
                deleteButton.src = 'img/delete_icon.png';  // Replace with your actual delete icon path
                deleteButton.alt = 'Delete';
                deleteButton.style.width = '24px';  // Adjust the size as needed
                deleteButton.style.cursor = 'pointer';  // Change cursor to indicate it's clickable
                deleteButton.onclick = () => delete_tenant(tenant.tenant_email?.S);
                actionCell.appendChild(deleteButton);

                row.appendChild(actionCell);

                fragment.appendChild(row);
            });

            // Clear and append new rows in one operation
            tbody.innerHTML = '';
            tbody.appendChild(fragment);

            // Log success message
            console.log("Tenants loaded successfully");
        })
        .catch(error => console.error('Error fetching tenants:', error))
        .finally(() => {
            // Hide the loading bar
            loadingBar.style.display = 'none';
        });
}






function open_add_tenant() {
    document.getElementById("modal_overlay").style.display = "block";
    document.getElementById("add_tenant_modal").style.display = "block";
    document.body.style.overflow = "hidden"; 
}

function close_add_tenant() {
    document.getElementById("modal_overlay").style.display = "none";
    document.getElementById("add_tenant_modal").style.display = "none";
    document.body.style.overflow = ""; 
}
function add_tenant() {
    const formData = ['address', 'apartment', 'tenant_email', 'first_name', 'last_name', 'phone_number', 'lease_start', 'lease_end', 'deposit', 'monthly', 'notes', 'contract']
        .reduce((acc, field) => ({ ...acc, [field]: document.getElementById(`add_tenant_${field}`).value }), {});

    // Directly add the utilities to formData in the same way
    formData.water = document.getElementById('add_tenant_water').checked;
    formData.electricity = document.getElementById('add_tenant_electricity').checked;
    formData.hydro = document.getElementById('add_tenant_hydro').checked;
    formData.gas = document.getElementById('add_tenant_gas').checked;
    formData.heat = document.getElementById('add_tenant_heat').checked;

    fetch('https://91g2v0hbu6.execute-api.us-east-1.amazonaws.com/prod/add_tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.ok ? response.json() : Promise.reject('Failed to add tenant'))
    .then(response => {
        const { message } = JSON.parse(response.body);
        if (message === "Tenant added successfully") {
            console.log(message);
            get_tenants();
            close_add_tenant();
        } else {
            console.error('Tenant was not added successfully:', response);
        }
    })
    .catch(error => console.error('Error:', error));
}













function open_edit_tenant_modal(tenant) {
    console.log(tenant);
    const fields = ['address', 'apartment', 'tenant_email', 'first_name', 'last_name', 'phone_number', 'lease_start', 'lease_end', 'deposit', 'monthly', 'contract', 'notes'];

    fields.forEach(field => {
        const input = document.getElementById(`edit_tenant_${field}`);
        if (input) {
            input.value = tenant[field]?.S || ''; // Populate the field or set it empty
        }
    });

    // Set utilities checkboxes based on the tenant data
    const utilities = ['water', 'electricity', 'hydro', 'gas', 'heat'];
    utilities.forEach(utility => {
        const checkbox = document.getElementById(`edit_tenant_${utility}`);
        if (checkbox) {
            checkbox.checked = tenant[utility]?.BOOL || false; // Check if utility is true, otherwise false
        }
    });

    document.getElementById("modal_overlay").style.display = "block";
    document.getElementById("edit_tenant_modal").style.display = "block";
    document.body.style.overflow = "hidden"; 
}

function close_edit_tenant() {
    document.getElementById("modal_overlay").style.display = "none";
    document.getElementById("edit_tenant_modal").style.display = "none";
    document.body.style.overflow = ""; 
}



function edit_tenant() {
    // Collecting the form data
    const formData = ['tenant_email', 'address', 'apartment', 'first_name', 'last_name', 'phone_number', 'lease_start', 'lease_end', 'deposit', 'monthly', 'notes']
        .reduce((acc, field) => ({ ...acc, [field]: document.getElementById(`edit_tenant_${field}`).value }), {});

    // Collecting utilities data (checkboxes)
    // Each utility is added as its own field (true or false)
    formData.water = document.getElementById('edit_tenant_water').checked;
    formData.electricity = document.getElementById('edit_tenant_electricity').checked;
    formData.hydro = document.getElementById('edit_tenant_hydro').checked;
    formData.gas = document.getElementById('edit_tenant_gas').checked;
    formData.heat = document.getElementById('edit_tenant_heat').checked;

    // Collecting contract URL
    formData.contract = document.getElementById('edit_tenant_contract').value;

    // Sending data to API
    fetch('https://91g2v0hbu6.execute-api.us-east-1.amazonaws.com/prod/edit_tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.ok ? response.json() : Promise.reject(response))
    .then(response => {
        const parsedResponse = JSON.parse(response.body); // Parse the response body
        if (parsedResponse.message === "Tenant edited successfully") {
            console.log(parsedResponse.message);
            get_tenants();
            close_edit_tenant();
        } else {
            console.error('Tenant was not edited successfully:', parsedResponse);
        }
    })
    .catch(error => error.json().then(err => console.error('Error:', err)));
}




function delete_tenant(email) {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
        fetch('https://91g2v0hbu6.execute-api.us-east-1.amazonaws.com/prod/delete_tenant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenant_email: email })
        })
        .then(response => response.ok ? response.json() : Promise.reject('Failed to delete tenant'))
        .then(response => {
            const responseBody = JSON.parse(response.body);
            if (responseBody.message === "Tenant deleted successfully") {
                console.log("Tenant deleted successfully");
                get_tenants();
            } else {
                console.error('Tenant deletion failed:', response);
            }
        })
        .catch(error => console.error('Error:', error));
    } else {
        console.log("Tenant deletion canceled");
    }
}



