const config = {
    tableOfRecentPurchases: {
        documentId: 'table-of-recent-purchases',
        url: 'https://api.thegraph.com/subgraphs/name/baseperp/friendtech',
        allowedCells: ['subject', 'shareAmount', 'blockTimestamp'],
        nameOfAllowedCells: {
            subject: 'Subject',
            shareAmount: 'Shares sold',
            blockTimestamp: 'Date',
        },
    },
    spinnerDocumentId: 'spinner',
}

async function getLatestPurchases() {
    try {
        const response = await fetch(config.tableOfRecentPurchases.url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: `
        query MyQuery {
          trades(
            where: { isBuy: true, trader: "0xdf68d1aD12F692fBBac6435AfDC5bD9C94a18f28" }
            orderBy: blockNumber
            orderDirection: desc
          ) {
            subject
            shareAmount
            transactionHash
            blockTimestamp
            }
          }
      `
            }),
        });
        const data = await response.json();

        return data && data.data && data.data.trades ? data.data.trades : [];
    } catch {
        return [];
    }
}



function insertDataIntoTable(data) {
    const table = document.getElementById(config.tableOfRecentPurchases.documentId);

    if (table && data && data.length) {
        const tableBodies = table.getElementsByTagName('tbody');
        const tableBody = tableBodies && tableBodies.length ? tableBodies[0] : null;

        if (tableBody) {
            data.forEach((purchaseDetails) => {
                const row = document.createElement('tr');

                config.tableOfRecentPurchases.allowedCells.forEach((allowedCell) => {
                    const cell = document.createElement('td');
                    const value = purchaseDetails[allowedCell];

                    cell.setAttribute('data-label', config.tableOfRecentPurchases.nameOfAllowedCells[allowedCell]);

                    if (allowedCell === 'subject') {
                        cell.classList.add('ellipsis');
                        cell.setAttribute('colspan', '2');
                    }

                    if (value) {
                        if (allowedCell === 'blockTimestamp') {
                            const timestamp = getTimestamp(value);

                            if (timestamp) {
                                cell.innerText = new Date(timestamp).toLocaleString();
                            }
                        } else {
                            cell.innerText = value;
                        }
                    }

                    row.appendChild(cell);
                });

                tableBody.appendChild(row);
            });
        }
    }

    spinnerVisibility(false);
}

function getTimestamp(value) {
    try {
        const number = Number(value);

        if (number && !Number.isNaN(number) && Number.isFinite(number) && Number.isInteger(number)) {
            return number * 1000;
        } else {
            return null;
        }
    } catch {
        return null;
    }
}

function spinnerVisibility(visible) {
    const spinner = document.getElementById(config.spinnerDocumentId);

    if (spinner) {
        spinner.style.display = visible ? 'block' : 'none';
    }
}

export default async function updateTable() {
    const tableData = await getLatestPurchases();

    if (tableData && tableData.length) {
        insertDataIntoTable(tableData);
    }
}
