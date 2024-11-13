
function open_add_tenant() {
    document.getElementById("add_tenant_modal").style.display = "block";
    document.getElementById("modal").style.display = "block";
}

function close_add_tenant() {
    document.getElementById("add_tenant_modal").style.display = "none";
    document.getElementById("modal").style.display = "none";
}
function add_tenant() {
    const formData = Object.fromEntries([
        'address', 'unit', 'tenant_email', 'first_name', 'last_name', 'phone_number', 'lease_start', 'lease_end', 'notes'
    ].map(field => {
        return [field, document.getElementById(`add_tenant_${field}`).value];
    }));
    
    fetch('https://fuslerjn3k.execute-api.us-east-1.amazonaws.com/prod/add_tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.ok ? response.json() : Promise.reject('Failed to add tenant'))
    .then(response => {
        console.log(response);
        // Parse the body from the response
        const responseBody = JSON.parse(response.body);

        // Check if the message in the response is "Tenant added successfully"
        if (responseBody.message === "Tenant added successfully") {
            // Call the function to close the form
            console.log("Tenant added successfully");
            get_tenants();
            close_add_tenant();
        } else {
            console.error('Tenant was not added successfully:', response);
        }
            })
    .catch(error => console.error('Error:', error));
}


function delete_tenant(email) {
    
    fetch('https://fuslerjn3k.execute-api.us-east-1.amazonaws.com/prod/add_tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_email: email })
    })
    .then(response => response.ok ? response.json() : Promise.reject('Failed to delete tenant'))
    .then(response => {
        console.log(response);
        // Parse the body from the response
        const responseBody = JSON.parse(response.body);

        // Check if the message in the response is "Tenant added successfully"
        if (responseBody.message === "Tenant deleted successfully") {
            // Call the function to close the form
            console.log("Tenant deleted successfully");
            get_tenants();
            
        } else {
            console.error('Tenant was not deleted successfully:', response);
        }
            })
    .catch(error => console.error('Error:', error));
}




document.addEventListener('DOMContentLoaded', function() {
    get_tenants();
});

function get_tenants() {
    const api_url = 'https://fuslerjn3k.execute-api.us-east-1.amazonaws.com/prod/get_tenants';
    const tbody = document.getElementById('all_tenants').querySelector('tbody');
        
    // Clear the existing rows before adding new tenants
    tbody.innerHTML = '';

    fetch(api_url)
    .then(response => response.json())
    .then(response => {
        console.log(response);
        console.log('Tenants loaded');
        
        const tenants = response; // Assuming body contains the tenants data array
        
        // Loop through each tenant and create a table row
        tenants.forEach(tenant => {
            const row = document.createElement('tr');
            
            // Create the table data for each field and append to row
            const fields = [
                tenant.property?.S || '',                                  // Property
                tenant.unit?.S || '',                                      // Unit
                tenant.first_name?.S && tenant.last_name?.S ? `${tenant.first_name.S} ${tenant.last_name.S}` : '', // Name
                tenant.phone_number?.S || '',                              // Phone Number
                tenant.tenant_email?.S || '',                              // Email Address
                tenant.lease_start?.S || '',                               // Lease Start
                tenant.lease_end?.S || '',                                 // Lease End
                tenant.deposit?.S || '',                                   // Deposit
                tenant.rent?.S || '',                                      // Rent
                tenant.electricity_included?.S === 'true' ? 'Yes' : 'No',  // Electricity Included
                tenant.lease?.S || '',                                     // Lease
                tenant.notes?.S || ''                                      // Notes
            ];
            
            // Append each field in a <td> to the row
            fields.forEach(field => {
                const cell = document.createElement('td');
                cell.textContent = field;
                row.appendChild(cell);
            });
            
            // Create the Delete button and append it to the row
            const deleteCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = function() {
                delete_tenant(tenant.tenant_email.S);  // Call delete_tenant with the tenant's email
            };
            deleteCell.appendChild(deleteButton);
            row.appendChild(deleteCell);
            
            // Append the row to the table body
            tbody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error fetching tenants:', error);
    });
}
