document.addEventListener('DOMContentLoaded', () => {
    get_accounts();
    get_transactions();
});

const actions_url = 'https://gx6m7ok39h.execute-api.us-east-1.amazonaws.com/prod';
const transactions_url = 'https://xheeg8h25d.execute-api.us-east-1.amazonaws.com/prod';

async function fetchApi(action, database, method = 'GET', body = null) {
    const options = { method, headers: { 'Content-Type': 'application/json' }, ...(body && { body: JSON.stringify(body) }) };
    const baseUrl = ['account', 'accounts'].includes(database) ? actions_url : ['transaction', 'transactions'].includes(database) ? transactions_url : null;
    const response = await fetch(`${baseUrl}/${action}_${database}`, options);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
}

function toggle_modal(modalId, show = true) {
    document.getElementById(modalId).style.display = show ? 'block' : 'none';
    document.getElementById('modal_overlay').style.display = show ? 'block' : 'none';
    document.body.style.overflow = show ? 'hidden' : '';
}

function createOptions(dropdown, data) {
    dropdown.innerHTML = '<option value="" disabled selected>Select Account</option>';
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.account_name;
        option.textContent = item.account_name;
        dropdown.appendChild(option);
    });
}

async function get_accounts() {
    const tbody = document.querySelector('#all_accounts tbody');
    document.getElementById('loading-bar').style.display = 'flex';
    try {
        const { accounts = [] } = await fetchApi('get', 'accounts');
        const sortedAccounts = accounts.sort((a, b) => a.account_name.localeCompare(b.account_name));
        tbody.innerHTML = sortedAccounts.map(account => `
            <tr>
                ${['account_name', 'account_type'].map(field => `<td>${account[field] || ''}</td>`).join('')}
                <td><img src="img/edit_icon.png" alt="Edit" style="width:24px;cursor:pointer;" onclick='open_edit_account(${JSON.stringify(account)})'></td>
            </tr>`).join('');
        ['add_transaction_from', 'add_transaction_to', 'edit_transaction_from', 'edit_transaction_to'].forEach(id => createOptions(document.getElementById(id), sortedAccounts));
    } catch (error) {
        console.error('Error fetching accounts:', error);
    } finally {
        document.getElementById('loading-bar').style.display = 'none';
    }
}

function open_edit_account(account) {
    Object.keys(account).forEach(field => document.getElementById(`edit_${field}`).value = account[field] || '');
    toggle_modal('edit_account_modal');
}

async function get_transactions() {
    const tbody = document.querySelector('#all_transactions tbody');
    document.getElementById('loading-bar').style.display = 'flex';
    try {
        const { transactions = [] } = await fetchApi('get', 'transactions');
        const sortedTransactions = transactions.sort((a, b) => a.transaction_date.localeCompare(b.transaction_date));
        tbody.innerHTML = sortedTransactions.map(transaction => `
            <tr>
                ${['transaction_date', 'transaction_from', 'transaction_to', 'transaction_memo', 'transaction_amount', 'transaction_tax']
                    .map(field => `<td>${transaction[field] || ''}</td>`).join('')}
                <td></td>
                <td><img src="img/edit_icon.png" alt="Edit" style="width:24px;cursor:pointer;" onclick='open_edit_transaction(${JSON.stringify(transaction)})'></td>
            </tr>`).join('');
    } catch (error) {
        console.error('Error fetching transactions:', error);
    } finally {
        document.getElementById('loading-bar').style.display = 'none';
    }
}

function open_edit_transaction(transaction) {
    Object.keys(transaction).forEach(field => document.getElementById(`edit_${field}`).value = transaction[field] || '');
    toggle_modal('edit_transaction_modal');
}

function validate_form(action, database, fieldIds, hide) {
    const data = Object.fromEntries(fieldIds.map(id => [id, document.getElementById(`${action}_${id}`).value.trim()]));
    const missingFields = Object.entries(data).filter(([_, v]) => !v).map(([k]) => k.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()));
    if (missingFields.length) return document.getElementById(`${action}_${database}_form_message`).innerText = `Missing fields: ${missingFields.join(', ')}`;
    document.getElementById(`${action}_${database}_form_message`).innerText = '';
    submit_form(action, database, data, hide);
}

async function submit_form(action, database, data, hide) {
    try {
        const { message } = await fetchApi(action, database, 'POST', data);
        if (message.includes('successfully')) {
            console.log(message);
            database === 'account' ? get_accounts() : get_transactions();
            if (hide) { if (action === "delete") action = "edit"; toggle_modal(`${action}_${database}_modal`, false); }
        } else {
            console.error(`${action} failed:`, message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function add_account() { validate_form('add', 'account', ['account_name', 'account_type'], true); }
function edit_account() { validate_form('edit', 'account', ['account_id', 'account_name', 'account_type'], true); }
function delete_account() {
    if (confirm('Are you sure you want to delete this Account?')) {
        submit_form('delete', 'account', { account_id: document.getElementById('edit_account_id').value }, true);
    }
}
function clear_add_account_form() { ['account_name', 'account_type'].forEach(id => document.getElementById(`add_${id}`).value = ''); document.getElementById('form-message').innerText = ''; }

function add_transaction() { validate_form('add', 'transaction', ['transaction_date', 'transaction_from', 'transaction_to', 'transaction_memo', 'transaction_amount', 'transaction_tax'], true); }
function edit_transaction() { validate_form('edit', 'transaction', ['transaction_id', 'transaction_date', 'transaction_from', 'transaction_to', 'transaction_memo', 'transaction_amount', 'transaction_tax'], true); }
function delete_transaction() {
    if (confirm('Are you sure you want to delete this transaction?')) {
        submit_form('delete', 'transaction', { transaction_id: document.getElementById('edit_transaction_id').value }, true);
    }
}
function clear_add_transaction_form() { ['transaction_name', 'transaction_type'].forEach(id => document.getElementById(`add_${id}`).value = ''); document.getElementById('form-message').innerText = ''; }
