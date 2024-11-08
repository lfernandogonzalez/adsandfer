// Function to open the modal
function open_add_tenant() {
    document.getElementById("add_tenant_modal").style.display = "block";
    document.getElementById("add_tenant_modal").style.display = "block";
}


  // Function to close the modal
  function close_add_tenant() {
    document.getElementById("add_tenant_modal").style.display = "none";
    document.getElementById("modal").style.display = "none";
  }
  
function add_tenant() {
    const formData = Object.fromEntries([
        'address','unit','email', 'first_name', 'last_name', 'phone_number','lease_start','lease_end','notes'
    ].map(field => {
        return [field, document.getElementById(`add_tenant_${field}`).value];
    }));
    
    fetch('https://yg5db2uq93.execute-api.us-east-1.amazonaws.com/prod/employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.ok ? response.json() : Promise.reject('Failed to add member'))
    .then(response => (console.log(response)))
    .catch(error => console.error('Error:', error));
}
