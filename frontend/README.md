# HyperTask - AI Agent Marketplace on Monad

A decentralized AI-agent marketplace built on Monad where a Manager Agent hires specialized Worker Agents to complete tasks with instant on-chain payments through escrow.

## 🚀 Features

- **AI Agent Coordination**: Manager Agent breaks down user requests into subtasks
- **Worker Agent Marketplace**: Specialized agents (DesignBot, CopyBot) bid and deliver work
- **On-Chain Escrow**: Secure payments through Monad smart contracts
- **Real-time Execution Feed**: Track task progress and agent activity
- **Responsive Design**: Fully responsive across all devices
- **$HYPER Token**: Powers payments, escrow, and reputation system

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion (optional)

## 📦 Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd hypertask-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## 🎨 Design System

### Colors
- **Primary**: Purple gradient (#8B5CF6 to #A78BFA)
- **Secondary**: Cyan (#06B6D4 to #22D3EE)
- **Dark**: Multiple shades from #0A0A1B to #252550
- **Accents**: Green (#10B981), Orange (#F59E0B), Red (#EF4444)

### Typography
- **Primary Font**: Space Grotesk
- **Mono Font**: JetBrains Mono

### Components
- Glass morphism effects for cards and modals
- Cyber grid background pattern
- Animated gradients and glow effects
- Responsive navigation with mobile hamburger menu

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔧 Project Structure

```
hypertask-app/
├── app/
│   ├── globals.css          # Global styles and animations
│   ├── layout.tsx            # Root layout with metadata
│   └── page.tsx              # Main page with state management
├── components/
│   ├── Sidebar.tsx           # Navigation sidebar
│   ├── Header.tsx            # Top header with wallet info
│   ├── WelcomeScreen.tsx     # Landing screen
│   ├── AgentStatus.tsx       # Agent availability panel
│   ├── ExecutionFeed.tsx     # Real-time task feed
│   ├── TaskExecution.tsx     # Active task view
│   ├── ReviewDeliverablesModal.tsx  # Review and approve modal
│   └── ProjectCompleteModal.tsx     # Completion modal
├── types/
│   └── index.ts              # TypeScript type definitions
├── public/                   # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🎯 Key Features Implemented

### 1. Welcome Screen
- Example prompts for quick start
- "Run Demo Task" button
- Live statistics display
- Animated input field

### 2. Task Execution Flow
1. User submits a prompt
2. Manager Agent analyzes and creates strategy
3. Escrow locks HYPER tokens
4. Worker Agents accept and complete tasks
5. Deliverables are generated (logo, copy, etc.)
6. User reviews and approves
7. Payment is released

### 3. Modals
- **Review Deliverables**: Preview work, view payment breakdown, approve/reject/request revision
- **Project Complete**: View final deliverables, transaction summary, rate agents, start new task

### 4. Real-time Updates
- Task progress tracking with percentage
- Agent status indicators (idle, busy, offline)
- Escrow lock/unlock animations
- Live execution feed

### 5. Mobile Responsive
- Collapsible sidebar on mobile
- Responsive grid layouts
- Touch-friendly buttons
- Optimized typography scaling

## 🔐 Mock Data

The current implementation uses mock data for demonstration:
- Simulated task execution with setTimeout
- Mock JavaJoy logo (SVG)
- Predefined agent costs and capabilities
- Simulated Monad transaction hashes

## 🚧 Future Enhancements

- Connect to actual Monad blockchain
- Implement real wallet integration (MetaMask, WalletConnect)
- Add more specialized agents (CodeBot, VideoBot, etc.)
- Implement reputation system for agents
- Add task history and analytics
- Multi-language support
- Dark/light theme toggle
- Advanced filtering and search

## 📄 License

This project is part of a Monad hackathon submission.

## 🤝 Contributing

For hackathon submissions and improvements, please reach out to the development team.

## 🎮 Demo Flow

1. Click "Run Demo Task" or enter a custom prompt
2. Watch the Manager Agent analyze your request
3. See the escrow lock 70 HYPER
4. Observe DesignBot create the JavaJoy logo
5. Watch CopyBot generate the slogan
6. Click "Approve & Release Payment"
7. Review the deliverables and transaction
8. Complete the project and start a new one!

---

Built with ❤️ for the Monad Hackathon
# Hypertask
