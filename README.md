# 🔄 PeerFlow

<div align="center">

![PeerFlow Banner](https://img.shields.io/badge/PeerFlow-Campus%20Marketplace-6366f1?style=for-the-badge&logo=react&logoColor=white)

**A peer-to-peer campus marketplace & skill barter platform for NIT Patna students**

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.7.0-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.1.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-Rolldown-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)

[Live Demo](https://flow-peer.web.app/) • [Features](#-features) • [Getting Started](#-getting-started) • [Tech Stack](#-tech-stack)

</div>

---

## 📖 About

**PeerFlow** is a campus-exclusive marketplace that connects NIT Patna students for buying, selling, and exchanging products and skills. Built with a focus on trust and community, PeerFlow enables students to: 

- 🛍️ **Buy & Sell** unused items within the campus community
- 🤝 **Barter Skills** - teach what you know, learn what you need
- 🔒 **Trade Safely** with verified campus users (@nitp.ac. in emails only)
- 📍 **Meet on Campus** with secure PIN verification for transactions

> *Building a circular economy that reduces waste while creating community.*

---

## ✨ Features

### 🏪 Marketplace
- **Product Listings** - List items with images, descriptions, pricing, and condition
- **Category Filtering** - Browse Electronics, Books, Furniture, Clothing, Sports, and more
- **Search & Discovery** - Find exactly what you need from fellow students
- **Shopping Cart** - Add multiple items and checkout seamlessly

### 💱 Skill Barter
- **Skill Exchange** - Offer your skills and find peers to learn from
- **Proficiency Levels** - From beginner to expert, find the right match
- **Time-based Exchange** - Fair trading with hours-based barter system
- **Barter Requests** - Send and manage skill exchange requests

### 🤝 P2P Campus Meetup System
- **Delivery PIN Verification** - Unique 4-digit PIN for secure identity verification
- **Two-Step Handshake** - Seller confirms handover → Buyer confirms receipt
- **Campus Meetup Locations** - Predefined spots (Main Gate, Library, Canteen, Hostels)
- **Order Tracking** - Real-time status updates throughout the transaction

### 💳 Flexible Payments
- **Cash on Meetup** - Pay directly when you meet the seller
- **Online Payments** - UPI and Card payment options
- **Payment Retry** - Failed payments can be completed later from Orders page

### 👤 User Features
- **Campus-Verified Accounts** - Only @nitp.ac. in email addresses
- **Seller Dashboard** - Manage products, orders, and track revenue
- **Buyer Orders** - Track purchases and confirm receipts
- **User Profiles** - Build reputation within the community

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x or **yarn**
- **Firebase Project** (for authentication & database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mdcreator-2/peerflow.git
   cd peerflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
   VITE_FIREBASE_APP_ID=your-app-id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library with latest features
- **React Router 7** - Client-side routing
- **Tailwind CSS 3** - Utility-first CSS framework
- **React Hot Toast** - Beautiful toast notifications

### Backend & Database
- **Firebase Authentication** - Secure user authentication
- **Cloud Firestore** - Real-time NoSQL database
- **Firebase Hosting** - Fast & secure hosting

### Build Tools
- **Vite** (Rolldown) - Next-generation frontend tooling
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

---

## 📁 Project Structure

```
peerflow/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── Auth/          # Login, Signup, ProtectedRoute
│   │   ├── Cart/          # Cart, Checkout
│   │   ├── Common/        # Navbar, Footer, Loaders
│   │   ├── Marketplace/   # Products, SellerDashboard
│   │   ├── Orders/        # MyOrders
│   │   ├── Payment/       # PaymentPage, PaymentResult
│   │   ├── Profile/       # UserProfile, EditProfile
│   │   └── SkillBarter/   # Skills, BarterRequests
│   ├── context/           # React Context (Auth, Cart)
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # Firebase services
│   │   ├── authService.js
│   │   ├── orderService.js
│   │   ├── productService.js
│   │   ├── skillService. js
│   │   └── firebase.config.js
│   ├── utils/             # Utilities & constants
│   ├── App.jsx            # Main App component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── . env                   # Environment variables
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README. md
```

---

## 🔐 Firebase Setup

### Firestore Collections

| Collection | Description |
|------------|-------------|
| `users` | User profiles and seller stats |
| `products` | Marketplace product listings |
| `skills` | Skill barter offerings |
| `orders` | Purchase orders with meetup details |
| `barter_requests` | Skill exchange requests |

### Authentication

PeerFlow uses Firebase Authentication with: 
- Email/Password authentication
- Google Sign-In
- Email domain restriction (`@nitp.ac.in`)

### Security Rules

Ensure your Firestore security rules allow:
- Authenticated users to read/write their own data
- Public read access to products and skills
- Order access restricted to buyer and seller

---

## 📱 Screenshots

<div align="center">

| Home | Marketplace | Skill Barter |
|:<img width="1900" height="994" alt="image" src="https://github.com/user-attachments/assets/4d0e24c7-191e-41be-a9b2-b1f2688d9d35" />
:|:<img width="1893" height="992" alt="image" src="https://github.com/user-attachments/assets/4c34956d-5071-497e-a467-11840ce00c1f" />
:|:<img width="1896" height="990" alt="image" src="https://github.com/user-attachments/assets/273626a5-5fe0-476e-96c2-d28719fb3aaa" />
:|
| Landing page with features | Browse & filter products | Exchange skills with peers |

| Checkout | Order Tracking | Seller Dashboard |
|:<img width="1895" height="991" alt="image" src="https://github.com/user-attachments/assets/9fdf3531-6101-4dd9-8e4f-5f1de9d674af" />
:|:<img width="1890" height="990" alt="image" src="https://github.com/user-attachments/assets/ef6a0679-f82c-4b86-812f-c7a6b02c4e48" />
:|<img width="1892" height="985" alt="image" src="https://github.com/user-attachments/assets/9ef7d7f6-21e7-481e-8803-05915d431533" />
:|
| Cart & payment options | PIN verification & status | Manage products & orders |

</div>

---

## 🗺️ Roadmap

- [ ] Real-time chat between buyers and sellers
- [ ] Push notifications for order updates
- [ ] Rating & review system
- [ ] Advanced search with filters
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration (Razorpay/Stripe)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**mdcreator-2**

- GitHub: [@mdcreator-2](https://github.com/mdcreator-2)

---

<div align="center">

Made with ❤️ for NIT Patna students

**[⬆ Back to Top](#-peerflow)**

</div>
