<<<<<<< HEAD
# Contract Management System

A modern web application built with Next.js for managing contracts with features like data visualization, CRUD operations, and advanced table functionality.

## 🚀 Features

- **Contract Management**: Create, read, update, and delete contracts
- **Advanced Data Table**: Sortable columns, pagination, and search functionality
- **Thai Localization**: Full Thai language support including date formatting
- **Soft Delete**: Safe deletion with recovery options
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Instant feedback with SweetAlert2 notifications

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Data Table**: TanStack Table (React Table)
- **Database**: MySQL with custom connection pooling
- **Icons**: Lucide React, Font Awesome
- **Notifications**: SweetAlert2

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- MySQL database server
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd contract-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   ```

4. **Set up the database**
   Create a MySQL table with the following structure:
   ```sql
   CREATE TABLE contract (
     id INT PRIMARY KEY AUTO_INCREMENT,
     recorder VARCHAR(255),
     description TEXT,
     amountcontract DECIMAL(10,2),
     end_date DATE,
     project_name VARCHAR(255),
     division_name VARCHAR(255),
     status INT DEFAULT 1,
     isdelete TINYINT DEFAULT 0,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── contracts/
│   │   │   └── route.tsx          # GET contracts API
│   │   └── delete/
│   │       └── [id]/
│   │           └── route.tsx      # DELETE contract API
│   ├── contract/
│   │   ├── columns.tsx            # Table column definitions
│   │   ├── data-table.tsx         # Main data table component
│   │   ├── data-table-pagination.tsx # Pagination component
│   │   └── page.tsx               # Contract management page
│   └── layout.tsx
├── components/
│   └── ui/                        # shadcn/ui components
├── lib/
│   └── db.ts                      # Database connection
└── README.md
```

## 🎯 Usage

### Viewing Contracts
- Navigate to `/contract` to view all contracts
- Use the search bar to filter by project name
- Sort columns by clicking on column headers
- Use pagination controls to navigate through pages

### Deleting Contracts
- Click the delete button (❌) in the "ยกเลิก" column
- Confirm deletion in the SweetAlert2 dialog
- The contract will be soft-deleted (marked as deleted, not permanently removed)

### Status Mapping
The system maps numeric status values to Thai labels:
- `1` → "ทดสอบ" (Test)
- `2` → "อนุมัติ" (Approved)
- `3` → "ปิด" (Closed)

### Date Formatting
Dates are automatically converted to Thai Buddhist calendar format:
- Input: `2024-03-15`
- Output: `15 มีนาคม 2567`

## 🔌 API Endpoints

### GET /api/contracts
Retrieves all active contracts (not soft-deleted)

**Response:**
```json
[
  {
    "id": 1,
    "recorder": "John Doe",
    "end_date": "15 มีนาคม 2567",
    "status": "ทดสอบ",
    "project_name": "Sample Project"
  }
]
```

### DELETE /api/delete/[id]
Soft deletes a contract by ID

**Parameters:**
- `id`: Contract ID to delete

**Response:**
```json
{
  "success": true,
  "message": "Contract deleted successfully"
}
```

## 🎨 Customization

### Adding New Columns
1. Update the `Contract` type in `columns.tsx`
2. Add new column definition to the `columns` array
3. Update the database query in the API routes

### Changing Status Labels
Modify the `statusMap` object in `page.tsx`:
```typescript
const statusMap: { [key: number]: string } = {
  1: "Your Custom Label",
  2: "Another Label",
  3: "Third Label"
}
```

### Styling
The project uses Tailwind CSS. Modify classes in components or update the global styles.

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
1. Build the project: `npm run build`
2. Start the production server: `npm start`
3. Configure your hosting platform accordingly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
- Check your `.env.local` file
- Ensure MySQL server is running
- Verify database credentials

**Table Not Loading**
- Check browser console for errors
- Verify API endpoints are working
- Check database table structure

**Delete Function Not Working**
- Ensure SweetAlert2 is installed
- Check API route configuration
- Verify database permissions

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section
2. Search existing issues on GitHub
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [TanStack Table](https://tanstack.com/table) for powerful table functionality
- [SweetAlert2](https://sweetalert2.github.io/) for elegant alerts
=======
# Contract Management System

A modern web application built with Next.js for managing contracts with features like data visualization, CRUD operations, and advanced table functionality.

## 🚀 Features

- **Contract Management**: Create, read, update, and delete contracts
- **Advanced Data Table**: Sortable columns, pagination, and search functionality
- **Thai Localization**: Full Thai language support including date formatting
- **Soft Delete**: Safe deletion with recovery options
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Instant feedback with SweetAlert2 notifications

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Data Table**: TanStack Table (React Table)
- **Database**: MySQL with custom connection pooling
- **Icons**: Lucide React, Font Awesome
- **Notifications**: SweetAlert2

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- MySQL database server
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd contract-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   ```

4. **Set up the database**
   Create a MySQL table with the following structure:
   ```sql
   CREATE TABLE contract (
     id INT PRIMARY KEY AUTO_INCREMENT,
     recorder VARCHAR(255),
     description TEXT,
     amountcontract DECIMAL(10,2),
     end_date DATE,
     project_name VARCHAR(255),
     division_name VARCHAR(255),
     status INT DEFAULT 1,
     isdelete TINYINT DEFAULT 0,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── contracts/
│   │   │   └── route.tsx          # GET contracts API
│   │   └── delete/
│   │       └── [id]/
│   │           └── route.tsx      # DELETE contract API
│   ├── contract/
│   │   ├── columns.tsx            # Table column definitions
│   │   ├── data-table.tsx         # Main data table component
│   │   ├── data-table-pagination.tsx # Pagination component
│   │   └── page.tsx               # Contract management page
│   └── layout.tsx
├── components/
│   └── ui/                        # shadcn/ui components
├── lib/
│   └── db.ts                      # Database connection
└── README.md
```

## 🎯 Usage

### Viewing Contracts
- Navigate to `/contract` to view all contracts
- Use the search bar to filter by project name
- Sort columns by clicking on column headers
- Use pagination controls to navigate through pages

### Deleting Contracts
- Click the delete button (❌) in the "ยกเลิก" column
- Confirm deletion in the SweetAlert2 dialog
- The contract will be soft-deleted (marked as deleted, not permanently removed)

### Status Mapping
The system maps numeric status values to Thai labels:
- `1` → "ทดสอบ" (Test)
- `2` → "อนุมัติ" (Approved)
- `3` → "ปิด" (Closed)

### Date Formatting
Dates are automatically converted to Thai Buddhist calendar format:
- Input: `2024-03-15`
- Output: `15 มีนาคม 2567`

## 🔌 API Endpoints

### GET /api/contracts
Retrieves all active contracts (not soft-deleted)

**Response:**
```json
[
  {
    "id": 1,
    "recorder": "John Doe",
    "end_date": "15 มีนาคม 2567",
    "status": "ทดสอบ",
    "project_name": "Sample Project"
  }
]
```

### DELETE /api/delete/[id]
Soft deletes a contract by ID

**Parameters:**
- `id`: Contract ID to delete

**Response:**
```json
{
  "success": true,
  "message": "Contract deleted successfully"
}
```

## 🎨 Customization

### Adding New Columns
1. Update the `Contract` type in `columns.tsx`
2. Add new column definition to the `columns` array
3. Update the database query in the API routes

### Changing Status Labels
Modify the `statusMap` object in `page.tsx`:
```typescript
const statusMap: { [key: number]: string } = {
  1: "Your Custom Label",
  2: "Another Label",
  3: "Third Label"
}
```

### Styling
The project uses Tailwind CSS. Modify classes in components or update the global styles.

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
1. Build the project: `npm run build`
2. Start the production server: `npm start`
3. Configure your hosting platform accordingly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
- Check your `.env.local` file
- Ensure MySQL server is running
- Verify database credentials

**Table Not Loading**
- Check browser console for errors
- Verify API endpoints are working
- Check database table structure

**Delete Function Not Working**
- Ensure SweetAlert2 is installed
- Check API route configuration
- Verify database permissions

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section
2. Search existing issues on GitHub
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [TanStack Table](https://tanstack.com/table) for powerful table functionality
- [SweetAlert2](https://sweetalert2.github.io/) for elegant alerts
>>>>>>> 3bc981af51bf14c6475f6c338492e14a42df8463
