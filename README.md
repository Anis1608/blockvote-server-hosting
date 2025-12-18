# 🗳️ BlockVote - Blockchain Voting System

<div align="center">

![BlockVote Banner](https://wallpaperaccess.com/full/4578765.jpg)

**A secure, transparent, and immutable voting platform powered by Stellar blockchain technology**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.3.1-61dafb)](https://reactjs.org/)
[![Stellar](https://img.shields.io/badge/blockchain-Stellar-7D00FF)](https://stellar.org/)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Docker Deployment](#-docker-deployment)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**BlockVote** is a modern, blockchain-based voting system that ensures election integrity through the power of distributed ledger technology. Built on the Stellar blockchain, every vote is recorded as an immutable transaction, providing unprecedented transparency and security for democratic processes.

### Why BlockVote?

- **🔒 Secure**: End-to-end encryption with blockchain-backed immutability
- **👁️ Transparent**: All votes are verifiable on the public Stellar blockchain
- **⚡ Real-time**: Live election results and vote tracking
- **🎯 Accurate**: Eliminates double voting and fraud
- **📊 Analytics**: Comprehensive dashboards and activity logs
- **🌐 Accessible**: Modern web interface with responsive design

---

## ✨ Features

### For Administrators

- **🔐 Secure Authentication**: OTP-based two-factor authentication via email
- **👥 Voter Management**: Register voters individually or via bulk CSV/Excel upload
- **🎭 Candidate Management**: Add, edit, and manage election candidates with photos
- **📅 Election Phases**: Control election lifecycle (Registration → Voting → Results)
- **📈 Real-time Dashboard**: Monitor voting statistics, hourly trends, and participation rates
- **📊 Result Analytics**: View detailed results with charts and export capabilities
- **🔍 Activity Logs**: Track all system activities with timestamps and user details
- **💾 Data Export**: Download voter lists, results, and blockchain transactions as CSV
- **🔄 Multi-device Management**: Manage logged-in devices and sessions

### For Voters

- **🎫 Simple Login**: Secure voter ID-based authentication
- **🗳️ Easy Voting**: Intuitive ballot interface with candidate information
- **✅ Vote Confirmation**: Review and confirm vote before submission
- **🔗 Blockchain Receipt**: Receive transaction hash as proof of vote
- **🚫 Fraud Prevention**: System prevents double voting automatically
- **📱 Public Access**: View candidates and results without login

### Blockchain Integration

- **⛓️ Stellar Network**: Votes recorded as transactions on Stellar testnet
- **🔐 Wallet Management**: Automatic wallet creation for each admin
- **📝 Transaction Memos**: Vote data stored in transaction memos
- **🔍 Verifiable**: All transactions publicly verifiable on Stellar
- **💰 Minimal Fees**: Extremely low transaction costs

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.1
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS 3.4.11
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM 6.26.2
- **Charts**: Recharts 2.15.2
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios

### Backend

- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.21.2
- **Database**: MongoDB 8.9.6 (Mongoose ODM)
- **Cache**: Redis (ioredis 5.6.0)
- **Queue**: Bull 4.16.5 (for background jobs)
- **Blockchain**: Stellar SDK 9.1.0
- **Authentication**: JWT + bcryptjs
- **Email**: Nodemailer 6.10.0
- **File Upload**: Multer + Cloudinary
- **Data Processing**: xlsx, csv-parser, json2csv

### DevOps & Tools

- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (for production)
- **Version Control**: Git
- **Package Manager**: npm

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Admin Portal │  │ Voter Portal │  │ Public Pages │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/REST API
┌────────────────────────▼────────────────────────────────────┐
│                    Backend (Express.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Service │  │ Vote Service │  │ Admin Service│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────┬──────────────────┬──────────────────┬────────────────┘
      │                  │                  │
┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐
│  MongoDB  │     │   Redis   │     │  Stellar  │
│ (Database)│     │  (Cache)  │     │Blockchain │
└───────────┘     └───────────┘     └───────────┘
```

### Data Flow

1. **Admin Registration**: Admin registers → OTP sent → Stellar wallet created
2. **Voter Registration**: Admin adds voters → Credentials generated → Email sent
3. **Voting Process**: Voter logs in → Selects candidate → Vote recorded on Stellar
4. **Result Calculation**: Blockchain transactions fetched → Votes tallied → Results displayed

---

## 🚀 Installation

### Prerequisites

- **Node.js**: v20.0.0 or higher
- **MongoDB**: v7.0 or higher (local or cloud)
- **Redis**: v7.0 or higher
- **Git**: Latest version

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/Anis1608/BlockVote.git
cd BlockVote
```

#### 2. Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# Required variables:
# - MONGO_URI
# - REDIS_URL
# - SECRET_KEY
# - EMAIL_USER
# - EMAIL_PASSWORD
# - STELLAR_SERVER

# Start the backend server
npm start
# or for development with auto-reload
nodemon index
```

The backend will run on `http://localhost:5000`

#### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with backend URL
# VITE_BACKEND_BASE_URL=http://localhost:5000

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:8080`

#### 4. Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000/api
- **Admin Panel**: http://localhost:8080/login
- **Voter Portal**: http://localhost:8080/voter/login

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `Backend` directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/blockvote
# or MongoDB Atlas
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/blockvote

# Redis Cache
REDIS_URL=redis://localhost:6379
# or Redis Cloud
# REDIS_URL=redis://default:password@host:port

# JWT Secret
SECRET_KEY=your-super-secret-key-change-this

# Email Configuration (Gmail example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Stellar Blockchain
STELLAR_SERVER=https://horizon-testnet.stellar.org
# For production, use: https://horizon.stellar.org

# Server Port (optional)
PORT=5000
```

### Frontend Environment Variables

Create a `.env` file in the `Frontend` directory:

```env
VITE_BACKEND_BASE_URL=http://localhost:5000
```

### Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated password
3. Use this password in `EMAIL_PASSWORD`

---

## 📖 Usage

### Admin Workflow

1. **Register as Admin**
   - Navigate to `/admin/register`
   - Enter admin details (name, email, ID number)
   - Verify OTP sent to email
   - Stellar wallet automatically created

2. **Login**
   - Go to `/login`
   - Enter credentials
   - Verify OTP

3. **Manage Voters**
   - Navigate to Admin Dashboard → Voter Management
   - Add voters individually or bulk upload CSV/Excel
   - Voters receive credentials via email

4. **Manage Candidates**
   - Go to Candidate Management
   - Add candidates with photos and details
   - Edit or delete as needed

5. **Control Election Phases**
   - Dashboard → Election Settings
   - Switch between: Registration → Voting → Results
   - Only voting phase allows vote casting

6. **View Results**
   - Navigate to Results page
   - View real-time vote counts
   - Export results as CSV
   - Download blockchain transaction records

### Voter Workflow

1. **Receive Credentials**
   - Admin registers voter
   - Voter receives Voter ID via email

2. **Login**
   - Navigate to `/voter/login`
   - Enter Voter ID

3. **Cast Vote**
   - View candidate list
   - Select preferred candidate
   - Confirm vote
   - Receive blockchain transaction hash

4. **Verification**
   - Use transaction hash to verify vote on Stellar blockchain
   - Visit: https://stellar.expert/explorer/testnet

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All admin routes require JWT token in headers:
```
Authorization: Bearer <token>
device-id: <device-id>
```

### Admin Endpoints

#### Authentication
```http
POST /api/admin/register          # Register new admin
POST /api/admin/verify-register   # Verify registration OTP
POST /api/admin/login             # Admin login
POST /api/admin/verify-login      # Verify login OTP
POST /api/admin/logout            # Logout from device
GET  /api/admin/devices           # Get all logged-in devices
```

#### Voter Management
```http
POST /api/voter/register          # Register single voter
POST /api/voters/bulk-upload      # Bulk upload voters (CSV/Excel)
GET  /api/voters                  # Get all voters
GET  /api/voters/search?query=    # Search voters
GET  /api/voters/total            # Get total voter count
```

#### Candidate Management
```http
POST /api/candidate/register      # Add new candidate
GET  /api/candidates              # Get all candidates
PUT  /api/candidate/:id           # Update candidate
DELETE /api/candidate/:id         # Delete candidate
```

#### Voting
```http
POST /api/voter/login             # Voter login
POST /api/vote/cast               # Cast vote (blockchain transaction)
```

#### Results
```http
GET  /api/results                 # Get election results
GET  /api/results/public          # Public results (no auth)
GET  /api/results/hourly          # Hourly vote trends
GET  /api/results/total           # Total votes count
GET  /api/results/download-csv    # Download blockchain transactions
```

#### Election Management
```http
GET  /api/election/phase          # Get current phase
PUT  /api/election/phase          # Update election phase
```

#### Activity Logs
```http
GET  /api/activity-logs           # Get all activity logs
```

### Response Format

Success:
```json
{
  "Success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error:
```json
{
  "Success": false,
  "message": "Error description",
  "error": "Detailed error"
}
```

---

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# Create environment file
cp .env.example .env
# Edit .env with your credentials

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Services Included

- **MongoDB**: Database (port 27017)
- **Redis**: Cache (port 6379)
- **Backend**: API server (port 5000)
- **Frontend**: Web app (port 80)

### Production Deployment

For detailed Docker deployment instructions, see [README.Docker.md](README.Docker.md)

---

## 📸 Screenshots

### Landing Page
![Landing Page](https://via.placeholder.com/800x400?text=Landing+Page)

### Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/800x400?text=Admin+Dashboard)

### Voter Management
![Voter Management](https://via.placeholder.com/800x400?text=Voter+Management)

### Voting Interface
![Voting Interface](https://via.placeholder.com/800x400?text=Voting+Interface)

### Results Dashboard
![Results](https://via.placeholder.com/800x400?text=Results+Dashboard)

---

## 🔐 Security Features

- **OTP Authentication**: Two-factor authentication for admin access
- **JWT Tokens**: Secure session management with expiration
- **Password Hashing**: bcrypt encryption for all passwords
- **Device Tracking**: Multi-device login management
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive validation using Zod schemas
- **XSS Protection**: Sanitized inputs and outputs
- **CORS**: Configured for secure cross-origin requests
- **Blockchain Immutability**: Votes cannot be altered once recorded

---

## 🧪 Testing

### Run Backend Tests
```bash
cd Backend
npm test
```

### Run Frontend Tests
```bash
cd Frontend
npm test
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Coding Standards

- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Anis Khan**

- GitHub: [@Anis1608](https://github.com/Anis1608)
- Email: anis1098imcc@gmail.com

---

## 🙏 Acknowledgments

- [Stellar Development Foundation](https://stellar.org/) for blockchain infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [MongoDB](https://www.mongodb.com/) for database solutions
- [Redis](https://redis.io/) for caching capabilities

---

## 📞 Support

For support, email anis1098imcc@gmail.com or open an issue on GitHub.

---

## 🗺️ Roadmap

- [ ] Mobile application (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics and reporting
- [ ] Integration with government ID systems
- [ ] Mainnet deployment option
- [ ] Biometric authentication
- [ ] Live election broadcasting
- [ ] Voter notification system (SMS/Push)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ using Stellar Blockchain

</div>
