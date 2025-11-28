# Employee Task Tracker

A full-stack web application for managing employee tasks within a company. Built with React, Express.js, and PostgreSQL.

## Live Demo

[View Live Application](https://your-replit-url.replit.app)

## Tech Stack

### Frontend
- **React 18** - UI library with TypeScript
- **Bootstrap 5** - Responsive CSS framework
- **React Query (TanStack Query)** - Server state management
- **Wouter** - Lightweight client-side routing
- **Lucide React** - Icon library
- **date-fns** - Date formatting utilities

### Backend
- **Express.js** - Node.js web framework
- **TypeScript** - Type-safe development
- **Drizzle ORM** - Type-safe database queries
- **Zod** - Runtime validation

### Database
- **PostgreSQL** - Relational database (via Neon serverless)

### Authentication
- **Replit Auth** - OpenID Connect authentication (Google, GitHub, etc.)

## Features

### Employee Management
- Add, edit, and delete employees
- Track department and position
- View employee task assignments

### Task Management
- Create, update, and delete tasks
- Assign tasks to employees
- Set priority levels (High, Medium, Low)
- Track status (Pending, In Progress, Completed)
- Filter tasks by employee or status
- Set due dates

### Dashboard
- View total tasks and completion rate
- See tasks by priority distribution
- Monitor employee workload
- Track overall team progress

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   │   ├── Dashboard.tsx   # Statistics overview
│   │   │   ├── Employees.tsx   # Employee management
│   │   │   ├── Tasks.tsx       # Task management
│   │   │   └── Landing.tsx     # Public landing page
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities
│   └── index.html
├── server/                 # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   └── auth.ts      # Authentication setup
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema & types
└── package.json
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/user` | Get current authenticated user |
| GET | `/api/login` | Initiate OAuth login |
| GET | `/api/logout` | Log out user |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | Get all employees |
| GET | `/api/employees/:id` | Get single employee |
| POST | `/api/employees` | Create new employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks (supports filters) |
| GET | `/api/tasks?employeeId=1` | Filter tasks by employee |
| GET | `/api/tasks?status=pending` | Filter tasks by status |
| GET | `/api/tasks/:id` | Get single task |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard statistics |

## Database Schema

### Employees Table
```sql
id            SERIAL PRIMARY KEY
name          VARCHAR(255) NOT NULL
email         VARCHAR(255) UNIQUE NOT NULL
department    VARCHAR(100)
position      VARCHAR(100)
created_at    TIMESTAMP DEFAULT NOW()
updated_at    TIMESTAMP DEFAULT NOW()
```

### Tasks Table
```sql
id            SERIAL PRIMARY KEY
employee_id   INTEGER REFERENCES employees(id) ON DELETE CASCADE
title         TEXT NOT NULL
description   TEXT
due_date      TIMESTAMP
priority      VARCHAR(10) DEFAULT 'medium'  -- high, medium, low
status        VARCHAR(20) DEFAULT 'pending' -- pending, in-progress, completed
created_at    TIMESTAMP DEFAULT NOW()
updated_at    TIMESTAMP DEFAULT NOW()
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/employee-task-tracker.git
   cd employee-task-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/database
   SESSION_SECRET=your-session-secret
   ```

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to `http://localhost:5000`

### Running on Replit
1. Fork or import the project to Replit
2. The database is automatically provisioned
3. Click "Run" to start the application
4. Authentication is handled by Replit Auth

## Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Employees Page
![Employees](./screenshots/employees.png)

### Tasks Page
![Tasks](./screenshots/tasks.png)

## Bonus Features Implemented

- **User Authentication** - Secure login via OAuth (Google, GitHub, etc.)
- **Role-based Access** - Admin users can manage all employees and tasks
- **Deployment** - Live demo available on Replit
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Updates** - UI updates immediately after CRUD operations
- **Filtering & Sorting** - Filter tasks by employee or status

## Assumptions & Limitations

- Only authenticated users (admins) can access the application
- Deleting an employee also deletes all their assigned tasks
- Task priorities are fixed to three levels (high, medium, low)
- Task statuses are fixed to three states (pending, in-progress, completed)

## Future Enhancements

- Role-based views (Admin vs Regular Employee)
- Employee self-service portal
- Task comments and attachments
- Email notifications for due dates
- Task history and audit logs
- Bulk task operations
- Export to CSV/PDF

## Author

Pujitha Mule

## License

MIT License
