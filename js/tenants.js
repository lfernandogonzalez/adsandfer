
function add_tenant() {
    const formData = Object.fromEntries([
        'address','unit','email', 'first_name', 'last_name', 'phone_number','lease_start','lease_end','notes'
    ].map(field => {
            return [field, document.getElementById(`add_tenant_${field}`).value];
        }
    }));
    
    fetch('https://baf4kiept7.execute-api.us-east-1.amazonaws.com/prod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.ok ? response.json() : Promise.reject('Failed to add member'))
    .then(response => (console.log(response), open_add_member(), get_members()))
    .catch(error => console.error('Error:', error));
}
