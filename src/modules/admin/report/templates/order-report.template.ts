export const orderReportTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px; border: 1px solid #ddd; }
    th { background-color: #f4f4f4; }
  </style>
</head>
<body>
  <h2>Order Report</h2>
  <p>Date Range: {{dateFrom}} - {{dateTo}}</p>
  <table>
    <thead>
      <tr>
        <th>Order ID</th>
        <th>Invoice</th>
        <th>Date</th>
        <th>Store</th>
        <th>Customer</th>
        <th>Products</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      {{#each orders}}
      <tr>
        <td>{{order_id}}</td>
        <td>{{invoice_number}}</td>
        <td>{{order_date_time}}</td>
        <td>{{store_name}}</td>
        <td>{{customer_name}}</td>
        <td>
          {{#each items}}
          <div>{{product_name}} ({{quantity}})</div>
          {{/each}}
        </td>
        <td>{{total_amount}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
</body>
</html>
`; 