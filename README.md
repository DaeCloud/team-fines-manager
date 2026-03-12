# 🍺 Team Fines Manager

A fun web application for managing team "fines" — humorous penalties that result in drinks or shots at team events.

## Features

- 🔐 **Team password** for shared access (one password for everyone)
- 👮 **Admin panel** for managing members, admins, and settings
- 📝 **Anonymous fine submission** — no one knows who filed it
- 🎉 **Event mode** with live voting via WebSockets
- 📊 **Leaderboard stats** tracking who's the most fined
- ⚡ **Real-time updates** using Socket.IO

## Getting Started

### Option 1: Docker (Recommended)

```bash
# Clone / download the project
cd team-fines-manager

# Start everything
docker-compose up -d

# App runs at http://localhost:3000
```

**Default credentials:**
- Team password: `teampassword`
- Admin: `admin` / `admin123`

> ⚠️ **Change these in production!** Update them through the Admin Panel → Settings.

### Option 2: Local Development

**Prerequisites:** Node.js 20+, MariaDB or MySQL

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env
# Edit .env with your database URL

# Set up database
npm run db:push
npm run db:seed

# Start dev server
npm run dev
```

App runs at `http://localhost:3000`

---

## Usage

### Normal Day
1. Visit the site and enter the team password
2. Go to **Add Fine** to submit a fine anonymously
3. View **Current Fines** to see what's pending

### Event Night
1. Admin opens `/admin/event` (Event Controller)
2. Team opens `/event` on their phones (Event Screen)
3. Admin clicks **Start Event** to load the first fine
4. Team reads the fine and votes **Accept** or **Reverse**
5. Admin sees live votes and clicks **Accept** or **Reverse** to finalize
6. Repeat until all fines are processed

---

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── admin/         # Admin pages
│   ├── add-fine/      # Submit fine
│   ├── current-fines/ # View pending fines
│   ├── event/         # Public event screen
│   ├── history/       # Processed fines
│   ├── login/         # Team login
│   └── stats/         # Leaderboard
├── components/        # Shared components
├── hooks/             # Custom hooks (useSocket)
├── lib/               # Utilities (auth, prisma, socket)
└── types/             # TypeScript types
```

---

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **Socket.IO** for real-time event voting
- **Prisma ORM** + **MariaDB**
- **Docker** for deployment
- **JWT** + **httpOnly cookies** for auth

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MariaDB connection string |
| `JWT_SECRET` | Secret for admin JWT tokens |
| `GLOBAL_SESSION_SECRET` | Secret for team session tokens |
