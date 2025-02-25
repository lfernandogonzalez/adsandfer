let cachedTransactions = []; // Global cache for transactions

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch and display transactions, caching them globally
        await get_accounts(); // Load accounts using cached transactions
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

const actions_url = 'https://gx6m7ok39h.execute-api.us-east-1.amazonaws.com/prod';
const transactions_url = 'https://xheeg8h25d.execute-api.us-east-1.amazonaws.com/prod';

function toggle_modal(modalId, show = true) {
    document.getElementById(modalId).style.display = show ? 'block' : 'none';
    document.getElementById('modal_overlay').style.display = show ? 'block' : 'none';
    document.body.style.overflow = show ? 'hidden' : '';
}

function createOptions(dropdown, data) {
    if (dropdown.id === 'transaction_filter_account') {
        dropdown.innerHTML = '<option value="all_accounts" selected>All Accounts</option>';
    } else {
        dropdown.innerHTML = '<option value="" disabled selected>Select</option>';
    }
    data.forEach(item => {
        const option = document.createElement('option');
        // Set value to account_id for use in transaction
        option.value = item.account_id;  // Assuming account_id exists
        option.textContent = item.account_name;
        dropdown.appendChild(option);
    });
}


function submit_form(url, data, formFields, messageId) {
    const missingFields = Object.entries(data).filter(([key, value]) => !value).map(([key]) => key);
    if (missingFields.length) {
        document.getElementById(messageId).innerText = `Missing fields: ${missingFields.join(', ')}`;
        return;
    }

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
        .then(response => {
            if (!response.ok) throw new Error('Request failed.');
            return response.json();
        })
        .then(({ message }) => {
            if (message.includes('successfully')) {
                get_transactions();
                get_accounts();
                clear_form(formFields, messageId); 
            } else {
                document.getElementById(messageId).innerText = `Error: ${message}`;
            }
        })
        .catch(error => {
            console.error('Request failed:', error);
            document.getElementById(messageId).innerText = 'Request failed. Please try again.';
        });
}


function clear_form(fields, messageId) {
    fields.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = ''; 
        }
    });

    // Clear the message
    if (messageId) {
        document.getElementById(messageId).innerText = '';
    }

}


async function get_transactions() {
    const tbody = document.querySelector('#all_transactions tbody');
    const filter_timeframe = document.getElementById('transaction_filter_timeframe').value;  // Get selected timeframe filter
    const filter_account = document.getElementById('transaction_filter_account').value; // Get selected account filter
    const filter_search = document.getElementById('transaction_filter_search').value; // Get selected account filter
    document.getElementById('loading-bar').style.display = 'flex';

    try {
        // Append both filters to the API call
        const response = await fetch(`${transactions_url}/get_transactions?timeframe=${filter_timeframe}&account=${encodeURIComponent(filter_account)}&search=${encodeURIComponent(filter_search)}`);
        if (!response.ok) throw new Error('Failed to fetch transactions.');
        const { transactions = [] } = await response.json();
        cachedTransactions = transactions;

       // Sorting by date (newest first), then by "transaction_from"
        const sortedTransactions = transactions.sort((a, b) => {
            const dateComparison = b.transaction_date.localeCompare(a.transaction_date); // Reversed comparison for newest first
            if (dateComparison !== 0) return dateComparison;
            return a.transaction_from.localeCompare(b.transaction_from);
        });


        // Render the transactions
        tbody.innerHTML = sortedTransactions.map(transaction => {
            // Look up the account names for 'transaction_from' and 'transaction_to'
            const fromAccount = accountNamesMap[transaction.transaction_from] || { name: transaction.transaction_from, type: '' };
            const toAccount = accountNamesMap[transaction.transaction_to] || { name: transaction.transaction_to, type: '' };

            // Check if the transaction is from an Income account
            const isIncome = fromAccount.type === 'Income';

            return `
                <tr>
                    <td>${transaction.transaction_date || ''}</td> <!-- Date -->
                    <td>${fromAccount.name}</td>  <!-- Account 'from' name -->
                    <td>${toAccount.name}</td>    <!-- Account 'to' name -->
                    <td>${transaction.transaction_amount || ''}</td> <!-- Amount -->
                    <td>${transaction.transaction_tax || ''}</td>    <!-- Tax -->
                    <td>${transaction.transaction_memo || ''}</td>   <!-- Memo -->
                    <td>
                         ${isIncome ? `<span style="cursor:pointer;font-size:24px;" onclick='generate_receipt(${JSON.stringify(transaction)})'>🧾</span>` : ''}
                    </td>
                    <td style="width:24px; border:none"><img src="img/edit_icon.png" alt="Edit" style="width:24px;cursor:pointer;" onclick='open_edit_transaction(${JSON.stringify(transaction)})'></td>
                </tr>`;
        }).join('');
    } catch (error) {
        console.error('Error fetching transactions:', error);
    } finally {
        document.getElementById('loading-bar').style.display = 'none';
        console.log('Transactions loaded');
    }
}





function add_transaction() {
    const fields = ['transaction_date', 'transaction_from', 'transaction_to', 'transaction_amount', 'transaction_tax', 'transaction_memo'];
    const data = {};
    fields.forEach(field => {
        data[field] = document.getElementById(`add_${field}`).value.trim();
    });

    submit_form(`${transactions_url}/add_transaction`, data, ['add_transaction_date', 'add_transaction_from', 'add_transaction_to', 'add_transaction_memo', 'add_transaction_amount', 'add_transaction_tax'], 'add_transaction_form_message');
}



function open_edit_transaction(transaction) {
    const fields = ['transaction_id', 'transaction_date', 'transaction_from', 'transaction_to', 'transaction_amount', 'transaction_tax', 'transaction_memo'];
    fields.forEach(field => {
        document.getElementById(`edit_${field}`).value = transaction[field];
    });
    toggle_modal('edit_transaction_modal', true);
}


function edit_transaction() {
    const fields = ['transaction_id', 'transaction_date', 'transaction_from', 'transaction_to', 'transaction_amount', 'transaction_tax', 'transaction_memo'];
    const data = {};
    fields.forEach(field => {
        data[field] = document.getElementById(`edit_${field}`).value.trim();
    });

    submit_form(`${transactions_url}/edit_transaction`, data, ['edit_transaction_date', 'edit_transaction_from', 'edit_transaction_to', 'edit_transaction_amount'], 'edit_transaction_form_message');
    toggle_modal('edit_transaction_modal', false);
}

function delete_transaction() {
    const transaction_id = document.getElementById('edit_transaction_id').value.trim();
    if (!transaction_id || !confirm('Are you sure you want to delete this transaction?')) return;

    fetch(`${transactions_url}/delete_transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id }),
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete transaction.');
            return response.json();
        })
        .then(({ message }) => {
            if (message.includes('successfully')) {
                get_transactions();
                get_accounts();
                toggle_modal('edit_transaction_modal', false);
            } else {
                console.error('Error deleting transaction:', message);
            }
        })
        .catch(error => {
            console.error('Error deleting transaction:', error);
        });
}


function generate_receipt(transaction) {
    const fields = ['transaction_id', 'transaction_date', 'transaction_amount', 'transaction_tax', 'transaction_memo'];
    fields.forEach(field => {
        document.getElementById(`receipt_${field}`).textContent = transaction[field];
    });
    toggle_modal('receipt_modal', true);
}



function print_receipt() {
    const printContents = document.getElementById('receipt_modal').innerHTML;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = `<div>${printContents}</div>`;
    window.print();
    document.body.innerHTML = originalContents;  // Restore the original page content
}



let accountNamesMap = {}; // Global map to store account_id -> { account_name, account_type }
async function get_accounts() {
    const accountsContainer = document.querySelector('#all_accounts');
    document.getElementById('loading-bar').style.display = 'flex';

    try {
        const accountsResponse = await fetch(`${actions_url}/get_accounts`);
        if (!accountsResponse.ok) throw new Error('Failed to fetch accounts.');
        const { accounts = [] } = await accountsResponse.json();

        // Define the order for account types
        const accountTypeOrder = {
            Asset: 1,
            Liability: 2,
            Income: 3,
            Expense: 4
        };

        // Create the account names map
        accountNamesMap = accounts.reduce((map, account) => {
            map[account.account_id] = {
                name: account.account_name,
                type: account.account_type
            };
            return map;
        }, {});

        // Sort accounts by type and then by name
        const sortedAccounts = accounts.sort((a, b) => {
            const typeComparison = (accountTypeOrder[a.account_type] || 5) - (accountTypeOrder[b.account_type] || 5);
            if (typeComparison !== 0) return typeComparison; // Sort by type first
            return a.account_name.localeCompare(b.account_name); // Then by name
        });

        // Group accounts by type
        const groupedAccounts = {
            Asset: [],
            Liability: [],
            Income: [],
            Expense: []
        };

        sortedAccounts.forEach(account => {
            groupedAccounts[account.account_type].push(account);
        });

        // Render the accounts grouped by type
        let htmlContent = '';
        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalIncome = 0;
        let totalExpenses = 0;

        Object.keys(groupedAccounts).forEach(type => {
            const accountsForType = groupedAccounts[type];
            if (accountsForType.length > 0) {
                // Add the section title (e.g., Assets, Liabilities)
                htmlContent += `<table class="table"><thead><tr><th colspan='2'><div style="font-family: 'Roboto', sans-serif; color: #857251;font-size:14pt; font-weight: 500;">${type === 'Liability' ? 'Liabilitie' : type}s</div></th></tr></thead><tbody>`;

                let totalBalance = 0;

                // Add rows for each account
                accountsForType.forEach(account => {
                    const formattedBalance = `$${Math.abs(parseFloat(account.account_balance) || 0).toFixed(2)}`;
                    htmlContent += `
                        <tr><td>${account.account_name}</td><td width=300>${formattedBalance}</td><td style="width:24px; border:none"><img src="img/edit_icon.png" alt="Edit" style="width:24px;cursor:pointer;" onclick='open_edit_account(${JSON.stringify(account)})'></td></tr>`;
                    totalBalance += Math.abs(parseFloat(account.account_balance) || 0);

                    // Accumulate totals for Assets, Liabilities, Income, and Expenses
                    if (type === 'Asset') totalAssets += Math.abs(parseFloat(account.account_balance) || 0);
                    if (type === 'Liability') totalLiabilities += Math.abs(parseFloat(account.account_balance) || 0);
                    if (type === 'Income') totalIncome += Math.abs(parseFloat(account.account_balance) || 0);
                    if (type === 'Expense') totalExpenses += Math.abs(parseFloat(account.account_balance) || 0);
                });

                // Add the total row for this account type
                htmlContent += `
                    </tbody></table>
                    <div style="width:100%; text-align: right; padding:20px; margin-bottom:20px; padding-right:60px"><h3>Total: $${totalBalance.toFixed(2)}</h3></div>`;
            }
            
        });


        const equity = totalAssets - totalLiabilities;
        const profit = totalIncome - totalExpenses;
        
        document.getElementById('equity').innerHTML=`<p><div style="font-family: 'Roboto', sans-serif; color: #857251;font-size:18pt; font-weight: 500;">Equity: $${equity.toFixed(2)}</div><div style="font-size:10pt"> (Assets - Liabilities)</div></p>`;
        document.getElementById('profit').innerHTML=`<p><div style="font-family: 'Roboto', sans-serif; color: #857251;font-size:18pt; font-weight: 500;">Profit: $${profit.toFixed(2)}</div><div style="font-size:10pt">  (Income - Expenses)</div></p>`;
        


        // Add the generated HTML to the accounts container
        accountsContainer.innerHTML = htmlContent;

        // Populate dropdowns for adding/editing transactions
        ['add_transaction_from', 'add_transaction_to', 'edit_transaction_from', 'edit_transaction_to', 'transaction_filter_account']
            .forEach(id => createOptions(document.getElementById(id), sortedAccounts));

        // Fetch transactions after accounts are loaded
        console.log("Accounts loaded");
        await get_transactions();
    } catch (error) {
        console.error('Error fetching accounts:', error);
    } finally {
        document.getElementById('loading-bar').style.display = 'none';
        
    }
}



function calculate_account_balances(accounts, transactions) {
    const account_balances = {};
    accounts.forEach(account => account_balances[account.account_name] = 0);
    transactions.forEach(({ transaction_from, transaction_to, transaction_amount }) => {
        const amount = parseFloat(transaction_amount) || 0;
        if (transaction_from) account_balances[transaction_from] -= amount;
        if (transaction_to) account_balances[transaction_to] += amount;
    });
    return account_balances;
}

function add_account() {
    const fields = ['account_name', 'account_type', 'account_balance'];
    const data = {};
    fields.forEach(field => {
        data[field] = document.getElementById(`add_${field}`).value.trim();
    });
    submit_form(`${actions_url}/add_account`, data, ['add_account_name', 'add_account_type', 'account_balance'], 'add_account_form_message');
}

function open_edit_account(account) {
    const fields = ['account_id', 'account_name', 'account_type'];
    fields.forEach(field => {
        document.getElementById(`edit_${field}`).value = account[field];
    });
    toggle_modal('edit_account_modal', true);
}

function edit_account() {
    const fields = ['account_id', 'account_name', 'account_type'];
    const data = {};
    fields.forEach(field => {
        data[field] = document.getElementById(`edit_${field}`).value.trim();
    });
    submit_form(`${actions_url}/edit_account`, data, ['edit_account_name', 'edit_account_type'], 'edit_account_form_message');
    toggle_modal('edit_account_modal', false);
}


function delete_account() {
    const account_id = document.getElementById('edit_account_id').value.trim();
    if (!account_id || !confirm('Are you sure you want to delete this account?')) return;

    fetch(`${actions_url}/delete_account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id }),
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete account.');
            return response.json();
        })
        .then(({ message }) => {
            if (message.includes('successfully')) {
                get_accounts();
                toggle_modal('edit_account_modal', false);
            } else {
                console.error('Error deleting account:', message);
            }
        })
        .catch(error => {
            console.error('Error deleting account:', error);
        });
}


function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');

    tabs.forEach(tab => {
        tab.classList.add('hidden');
    });
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(tabId).classList.remove('hidden');
    document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('active');
}
