# صحابي

Arabic e-commerce landing page with Google Sheets order capture and an Arabic
admin dashboard for managing orders, inventory, and storefront content.

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in the server-side secrets before
testing order submission or the admin dashboard.

## Google Sheets setup

1. Create a Google Cloud project, enable the Google Sheets API, and create a
   service account with a JSON key.
2. Create a spreadsheet and add a tab named `Orders`.
3. Share the spreadsheet with the service account email and grant Editor access.
   The app creates `Inventory` and `StoreSettings` tabs automatically.
4. Set these environment variables in `.env.local` and in the deployment
   environment. Do not expose them with a `NEXT_PUBLIC_` prefix or commit keys:

   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: the service account email.
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: its private key. In `.env.local`,
     use a quoted value with `\n` between key lines.
   - `GOOGLE_SHEETS_SPREADSHEET_ID`: the ID between `/d/` and `/edit` in the
     spreadsheet URL.
   - `ADMIN_PASSWORD`: a strong password for `/admin`.
   - `ADMIN_SESSION_SECRET`: a separate, long random secret used to sign the
     admin session cookie.

Sign in at `/admin`. The overview summarizes order statuses and stock alerts;
the orders tab supports search, status filtering, and workflow updates; inventory
lets you edit each size, price, stock quantity, and availability; and storefront
content lets you edit the landing-page copy, FAQ, and reviews. Leave stock
quantity blank for unlimited/untracked stock. Otherwise, stock is deducted when
an order is confirmed, marked for delivery, or completed, and restored when a
committed order is cancelled. New orders do not reserve stock.

`Orders` columns are order ID, created time, customer name, phone, city, size,
and status. `Inventory` stores size, price, stock, and availability.
`StoreSettings` stores the editable storefront text. FAQ lines use
`question|answer`; review lines use `name|role or city|review text`. Keep the
spreadsheet private; it contains customer contact details.
