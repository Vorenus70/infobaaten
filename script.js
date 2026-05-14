* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    background-color: #eef7ff;
    margin: 0;
    padding: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.page-container {
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    background-color: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

/* Header */
.dashboard-header {
    background: linear-gradient(135deg, #0b5e7e, #1b8cae);
    color: white;
    padding: 16px 20px;
    text-align: center;
    flex-shrink: 0;
}

.dashboard-header h1 {
    margin: 0;
    font-size: 22px;
}

.dashboard-header p {
    margin: 6px 0 0;
    font-size: 12px;
    opacity: 0.9;
}

/* Filter bar */
.filter-bar {
    padding: 8px 12px;
    background-color: #f8fafc;
    border-bottom: 1px solid #cde4f0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-shrink: 0;
}

.filter-left {
    display: flex;
    align-items: center;
    gap: 6px;
}

.filter-left label {
    font-size: 12px;
    font-weight: 600;
    color: #0b5e7e;
    white-space: nowrap;
}

.filter-left select {
    padding: 4px 8px;
    font-size: 12px;
    border: 1px solid #cde4f0;
    border-radius: 6px;
    background-color: white;
    cursor: pointer;
    max-width: 80px;
}

/* Scrollable table container */
.table-wrapper {
    flex: 1;
    overflow-x: auto;
    overflow-y: auto;
    max-height: 60vh;
    min-height: 300px;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.data-table th,
.data-table td {
    padding: 10px 6px;
    border: 1px solid #d0d8e0;
    text-align: left;
    vertical-align: top;
}

.data-table th {
    background-color: #e9f2f9;
    font-weight: 600;
    color: #0b5e7e;
    position: sticky;
    top: 0;
    z-index: 10;
}

.data-table td:nth-child(4),
.data-table th:nth-child(4) {
    text-align: center;
}

.data-table tr:nth-child(even) {
    background-color: #f8fafc;
}

.data-table tr:hover {
    background-color: #eef2f7;
}

.month-divider td {
    background-color: #d9eaf3;
    font-weight: bold;
    text-align: center;
    padding: 6px;
    border: 1px solid #cde4f0;
}

.col-timestamp { width: 15%; }
.col-date { width: 15%; }
.col-waterlevel { width: 20%; }
.col-change-raw { width: 25%; }
.col-change-cm { width: 25%; }

/* Footer */
.footer {
    background-color: #f8fafc;
    border-top: 1px solid #cde4f0;
    padding: 16px 20px;
    flex-shrink: 0;
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    max-width: 100%;
    margin: 0 auto;
}

.footer-copyright {
    font-size: 11px;
    color: #9aa0a6;
    font-family: 'Segoe UI', Roboto, sans-serif;
}

.facebook-btn {
    background: linear-gradient(135deg, #1877f2, #0e63b0);
    color: white;
    padding: 8px 20px;
    border-radius: 40px;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: transform 0.2s ease, background 0.2s ease;
    white-space: nowrap;
}

.facebook-btn:hover {
    transform: scale(1.02);
    background: linear-gradient(135deg, #1b7ef5, #0e63b0);
}

/* Desktop styles */
@media (min-width: 769px) {
    body {
        padding: 24px;
        background-color: #eef7ff;
    }
    .page-container {
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        min-height: auto;
    }
    .table-wrapper {
        max-height: 65vh;
    }
}

/* Mobile styles */
@media (max-width: 768px) {
    .hide-on-mobile {
        display: none;
    }
    .dashboard-header h1 {
        font-size: 18px;
    }
    .dashboard-header {
        padding: 12px 16px;
    }
    .data-table th,
    .data-table td {
        padding: 8px 4px;
        font-size: 11px;
    }
    .filter-bar {
        padding: 6px 10px;
    }
    .filter-left label {
        font-size: 11px;
    }
    .filter-left select {
        padding: 3px 6px;
        font-size: 11px;
        max-width: 70px;
    }
    .footer {
        padding: 12px 16px;
    }
    .footer-content {
        flex-direction: column;
        text-align: center;
        gap: 12px;
    }
    .facebook-btn {
        padding: 6px 16px;
        font-size: 12px;
    }
    .table-wrapper {
        max-height: 50vh;
        min-height: 250px;
    }
}
