# 📋 Contract Management System (ระบบทะเบียนคุมสัญญา)

A modern web application for managing contracts at the Office of the Attorney General, Thailand (สำนักงานอัยการสูงสุด).

## 🌟 Features

### 📄 Contract Management

- ✅ Create, edit, and delete contracts
- ✅ Upload contract files (PDF) and optional attachments
- ✅ View and download contract documents
- ✅ Track contract status and expiration dates
- ✅ Search and filter contracts
- ✅ Export contract data

### 👥 User Management

- ✅ User registration and authentication
- ✅ Role-based access control (Admin/User)
- ✅ User approval system
- ✅ Profile management
- ✅ Password reset functionality

### 🔐 Security

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected routes and API endpoints
- ✅ File upload validation
- ✅ SQL injection prevention

### 📱 User Interface

- ✅ Responsive design for all devices
- ✅ Modern UI with Tailwind CSS
- ✅ Thai language support
- ✅ Dark/Light theme toggle
- ✅ Interactive data tables
- ✅ File drag-and-drop upload

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI components
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **TanStack Query** - Data fetching and caching
- **Lucide React** - Icon library

### Backend

- **Next.js API Routes** - Server-side API
- **MySQL** - Database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email functionality

### Development Tools

- **Docker** - Containerization
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Docker (optional)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/vongsathon-k/Contract-tsx.git
cd Contract-tsx
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` file:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=contract

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
```

4. **Set up database**

Using Docker:

```bash
docker-compose up -d
```

Or manually create MySQL database and import schema:

```sql
CREATE DATABASE contract;
-- Import your SQL schema file
```

5. **Run the development server**

```bash
npm run dev
```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── admin/             # Admin pages
│   ├── api/               # API routes
│   ├── contract/          # Contract management pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # UI components (Shadcn)
│   └── contract/         # Contract-specific components
├── contexts/             # React contexts
├── lib/                  # Utility functions
├── public/               # Static files
│   └── uploads/          # File uploads
├── middleware.ts         # Next.js middleware
└── docker-compose.yml    # Docker configuration
```

## 🔧 Configuration

### Database Schema

The application uses MySQL with the following main tables:

- `users` - User accounts and profiles
- `contract` - Contract records
- `divisions` - Organization divisions

### File Upload

- **Supported formats**: PDF only
- **Max file size**: 10MB per file
- **Storage**: Local filesystem (`public/uploads/`)
- **Contract file**: Required
- **Attachment file**: Optional

### User Roles

- **Admin**: Full system access, user management
- **User**: Contract management only
- **Pending**: Awaiting admin approval

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production

```env
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
DATABASE_HOST=your-production-db-host
# ... other production configs
```

## 📖 API Documentation

### Authentication Endpoints

- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/forgot-password` - Password reset request

### Contract Endpoints

- `GET /api/contracts` - Get all contracts
- `GET /api/contracts/[id]` - Get contract by ID
- `POST /api/contracts` - Create new contract
- `PUT /api/contracts/[id]` - Update contract
- `DELETE /api/contracts/[id]` - Delete contract
- `POST /api/contracts/[id]/upload` - Upload contract files

### Admin Endpoints

- `GET /api/admin/users` - Get all users (Admin only)
- `PUT /api/admin/users/[id]` - Update user status (Admin only)

## 🔒 Security Features

### Authentication

- JWT tokens with expiration
- Secure HTTP-only cookies
- Password hashing with bcrypt
- Protected routes middleware

### File Upload Security

- File type validation (PDF only)
- File size limits (10MB)
- Secure file naming
- Path traversal prevention

### Database Security

- Prepared statements
- Connection pooling
- SQL injection prevention
- Input validation with Zod

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add comments for complex logic

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**

```bash
# Check if MySQL is running
sudo systemctl status mysql

# Check environment variables
echo $DATABASE_HOST
```

**File Upload Issues**

```bash
# Check upload directory permissions
chmod 755 public/uploads
```

**Build Errors**

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## 📞 Support

For support and questions:

- 📧 Email: l2omeol3oat@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/vongsathon-k/Contract-tsx/issues)
- 📖 Documentation: [Wiki](https://github.com/vongsathon-k/Contract-tsx/wiki)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Office of the Attorney General, Prachinburi Province
- Next.js team for the amazing framework
- Shadcn for the beautiful UI components
- All contributors and testers

## 📊 Project Status

- ✅ **Version**: 1.0.0
- ✅ **Status**: Production Ready
- ✅ **Last Updated**: December 2024
- ✅ **Maintenance**: Active

---

Made with ❤️ for the Office of the Attorney General, Thailand
