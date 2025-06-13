export const transactionReportTemplate = `
<!DOCTYPE html>
<html>
<head>
  <title>Transaction Report</title>
  <style>
    body { font-family: Arial, sans-serif; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px; border: 1px solid #ddd; }
    th { background-color: #f4f4f4; }
  </style>
</head>
<body>
  <div class="report-container">
    <h1>Transaction Report</h1>
    <p>Date: {{#if dateTo}}{{dateFrom}} to {{dateTo}}{{else}}{{dateFrom}}{{/if}}</p>
    
    <table>
      <thead>
        <tr>
          <th>Transaction ID</th>
          <th>Date</th>
          <th>Status</th>
          <th>Amount</th>
          <th>Provider</th>
          <th>Invoice</th>
          <th>Order Date</th>
          <th>Store</th>
          <th>Customer</th>
        </tr>
      </thead>
      <tbody>
        {{#each transactions}}
        <tr>
          <td>{{transaction_id}}</td>
          <td>{{transaction_date}}</td>
          <td>{{transaction_status}}</td>
          <td>{{transaction_amount}}</td>
          <td>{{transaction_provider}}</td>
          <td>{{invoice_number}}</td>
          <td>{{order_date_time}}</td>
          <td>{{store_name}}</td>
          <td>{{customer_name}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
  </div>
</body>
</html>
`; 