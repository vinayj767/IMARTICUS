# 🎓 IMARTICUS Learning Management System# Imarticus LMS Project



A modern, full-stack Learning Management System (LMS) built with React and Node.js, designed to provide an exceptional online learning experience. This platform offers a comprehensive solution for course management, student enrollment, and interactive learning.A full-stack Learning Management System (LMS) built with the MERN stack, featuring AI-powered document summarization and integrated payment gateway.



![IMARTICUS LMS](https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&q=80)## 🚀 Features



## ✨ Features### Part 1: Online Classroom (LMS)

- **Dynamic Course Structure**: Modules and lessons loaded from MongoDB database

### For Students- **Video Player**: Integrated video player for course content

- 📚 **Interactive Dashboard** - Modern, intuitive dashboard inspired by leading EdTech platforms- **Responsive Design**: Bootstrap-based UI that works on all devices

- 🎯 **Course Exploration** - Browse courses by categories (Finance, Technology, Analytics, Marketing, Management)- **No Hard-Coding**: All content fetched from database

- 📊 **Progress Tracking** - Track your learning progress with visual indicators

- 👥 **Group Learning** - Join learning groups and collaborate with peers### Part 2: AI Document Summarization

- 🎥 **Video Learning** - High-quality video content with module-based structure- **Admin Upload**: Simple interface for uploading PDF documents to lessons

- 💳 **Secure Payments** - Integrated payment gateway for course enrollment- **AI-Powered Summary**: Uses Azure OpenAI GPT-4 to summarize documents

- 📱 **Responsive Design** - Seamless experience across all devices- **Student Interface**: One-click document summarization for learners



### For Administrators### Part 3: Landing Page

- 📤 **Course Upload** - Easy-to-use interface for uploading courses and materials- **Exact Replica**: Top 50% of Imarticus Digital Marketing course page

- 📝 **Content Management** - Manage course modules, videos, and PDF resources- **Fully Responsive**: Pixel-perfect on desktop and mobile

- 👨‍🎓 **Student Management** - Track enrollments and student progress- **CTA Integration**: "Apply Now" button connected to payment flow

- 📈 **Analytics Dashboard** - Monitor platform performance and engagement

### Brownie Points: Payment Integration

## 🚀 Tech Stack- **Razorpay Integration**: Secure payment gateway (test mode)

- **₹500 Course Fee**: Test payment before accessing LMS

### Frontend- **Payment Verification**: Server-side payment validation

- **React 18.2.0** - Modern UI library

- **React Router v6** - Client-side routing## 🛠️ Tech Stack

- **Bootstrap 5** - Responsive UI components

- **CSS3** - Custom styling with modern design patterns### Backend

- **Axios** - HTTP client for API calls- **Node.js** & **Express.js**: RESTful API server

- **MongoDB Atlas**: Cloud database for course data

### Backend- **Mongoose**: ODM for MongoDB

- **Node.js** - Runtime environment- **Multer**: File upload handling

- **Express.js** - Web application framework- **pdf-parse**: PDF text extraction

- **MongoDB** - NoSQL database- **Azure OpenAI**: AI document summarization

- **Mongoose** - MongoDB object modeling- **Razorpay**: Payment gateway integration

- **JWT** - Secure authentication

- **Multer** - File upload handling### Frontend

- **BCrypt** - Password encryption- **React.js**: Component-based UI

- **React Router**: Client-side routing

## 📦 Project Structure- **Bootstrap 5**: Responsive design

- **Axios**: HTTP requests

```- **React Player**: Video playback

imarticus-lms-project/

│## 📁 Project Structure

├── frontend/                   # React frontend application

│   ├── public/                # Static files```

│   ├── src/imarticus-lms-project/

│   │   ├── pages/             # Page components├── backend/

│   │   │   ├── LandingPage.js│   ├── models/

│   │   │   ├── CoursesPage.js│   │   ├── Course.js

│   │   │   ├── StudentDashboard.js│   │   └── Payment.js

│   │   │   ├── LMSPage.js│   ├── routes/

│   │   │   ├── AuthPage.js│   │   ├── courseRoutes.js

│   │   │   ├── PaymentPage.js│   │   ├── paymentRoutes.js

│   │   │   └── AdminDashboard.js│   │   └── adminRoutes.js

│   │   ├── services/          # API services│   ├── uploads/          # PDF documents storage

│   │   ├── assests/           # Images and assets│   ├── .env              # Environment variables

│   │   └── App.js             # Main app component│   ├── server.js         # Express server

│   └── package.json│   └── seed.js           # Database seeder

│└── frontend/

└── backend/                    # Node.js backend    ├── public/

    ├── models/                # Database models    ├── src/

    │   ├── User.js    │   ├── components/   # React components

    │   ├── Course.js    │   ├── pages/        # Page components

    │   └── Payment.js    │   ├── services/     # API services

    ├── routes/                # API routes    │   └── App.js

    │   ├── authRoutes.js    └── package.json

    │   ├── courseRoutes.js```

    │   ├── paymentRoutes.js

    │   └── adminRoutes.js## 🚦 Getting Started

    ├── uploads/               # User uploaded files

    ├── public/                # Static video files### Prerequisites

    ├── server.js              # Express server- Node.js (v16 or higher)

    └── package.json- MongoDB Atlas account

```- Azure OpenAI API access (optional)

- Razorpay account (optional, test mode works without)

## 🛠️ Installation & Setup

### Installation

### Prerequisites

- Node.js (v14 or higher)1. **Clone the repository**

- MongoDB (local or Atlas)```bash

- npm or yarn package managergit clone <your-repo-url>

cd imarticus-lms-project

### Backend Setup```



1. Navigate to the backend directory:2. **Backend Setup**

```bash```bash

cd backendcd backend

```npm install

```

2. Install dependencies:

```bash3. **Configure Environment Variables**

npm install

```Create a `.env` file in the backend directory:

```env

3. Create a `.env` file in the backend directory:MONGO_URI=mongodb+srv://vinaywbackup_db_user:vinayjain@priject.6tsvkwd.mongodb.net/imarticus-lms?retryWrites=true&w=majority&appName=Priject

```envPORT=5000

MONGODB_URI=your_mongodb_connection_stringAZURE_OPENAI_ENDPOINT=<your-endpoint>

JWT_SECRET=your_jwt_secret_keyAZURE_OPENAI_API_KEY=<your-api-key>

PORT=5000AZURE_OPENAI_CHATGPT_DEPLOYMENT=gpt-4.1

```AZURE_OPENAI_API_VERSION=2025-01-01-preview

RAZORPAY_KEY_ID=<your-key-id>

4. Seed the database with sample courses:RAZORPAY_KEY_SECRET=<your-key-secret>

```bashFRONTEND_URL=http://localhost:3000

node seed-multiple-courses.js```

```

4. **Seed the Database**

5. Start the backend server:```bash

```bashnpm run seed

npm start```

```

5. **Start Backend Server**

The backend will run on `http://localhost:5000````bash

npm start

### Frontend Setup# or for development with auto-reload

npm run dev

1. Navigate to the frontend directory:```

```bash

cd frontend6. **Frontend Setup**

``````bash

cd ../frontend

2. Install dependencies:npm install

```bashnpm start

npm install```

```

The application will open at `http://localhost:3000`

3. Create a `.env` file in the frontend directory:

```env## 🌐 API Endpoints

REACT_APP_API_URL=http://localhost:5000/api

```### Courses

- `GET /api/courses` - Get all courses

4. Start the development server:- `GET /api/courses/:id` - Get single course

```bash- `GET /api/courses/:courseId/modules/:moduleId/lessons/:lessonId` - Get specific lesson

npm start

```### Payment

- `POST /api/payment/create-order` - Create Razorpay order

The frontend will run on `http://localhost:3000`- `POST /api/payment/verify-payment` - Verify payment signature

- `GET /api/payment/status/:orderId` - Check payment status

## 🎯 Usage Guide

### Admin

### For Students- `GET /api/admin/courses` - Get all courses (admin view)

- `POST /api/admin/upload-document` - Upload PDF to lesson

1. **Registration/Login**- `POST /api/admin/summarize-document` - Generate AI summary

   - Visit the homepage at `http://localhost:3000`

   - Click on "Login" to create an account or sign in## 🎯 User Journey

   - Fill in your details (name, email, password)

1. **Landing Page** → User sees course advertisement

2. **Browsing Courses**2. **Apply Now** → User clicks CTA button

   - Navigate to the "Explore Our Courses" section3. **Payment Gateway** → User pays ₹500 via Razorpay (test mode)

   - Filter courses by category (Finance, Technology, Analytics, etc.)4. **Payment Success** → User redirected to LMS

   - Click on any course to view details5. **Course Access** → User can view all modules and lessons

6. **Watch Videos** → User watches course content

3. **Enrolling in Courses**7. **AI Summary** → User can summarize PDF documents with one click

   - Click "Enroll Now" on your desired course

   - Complete the payment process## 🚀 Deployment

   - Access your enrolled courses from the Dashboard

### Backend (Render.com)

4. **Learning Experience**

   - Access your dashboard at `/dashboard`1. Create a new Web Service on Render

   - View your recent activity and progress2. Connect your GitHub repository

   - Continue learning from where you left off3. Configure:

   - Join study groups and collaborate with peers   - **Build Command**: `npm install`

   - **Start Command**: `npm start`

### For Administrators   - **Environment Variables**: Add all variables from `.env`



1. **Admin Access**### Frontend (Render.com or Netlify)

   - Login with admin credentials

   - Navigate to the Admin Dashboard1. Build the React app:

```bash

2. **Upload Courses**cd frontend

   - Go to `/admin-upload`npm run build

   - Fill in course details (title, description, category, price)```

   - Upload course thumbnail

   - Add course modules and video content2. Deploy the `build` folder to your hosting service

   - Submit to publish the course

## 📝 Course Content

## 🎨 Key Features Explained

The database is seeded with a sample "Introduction to Machine Learning" course featuring:

### Student Dashboard- 5 Modules

The dashboard provides three main views:- 15 Lessons

- Video content from provided Google Drive link

- **Dashboard View**: Shows recent activity and all enrolled courses with progress tracking- Complete course structure matching Imarticus format

- **My Groups View**: Displays learning groups with course details and discussion forums

- **Explore View**: Browse all available courses with filtering options## 🎨 Design Features



### Smart Image Handling- ✅ No hard-coded content

The platform intelligently handles both:- ✅ Fully responsive (mobile & desktop)

- External image URLs (Unsplash)- ✅ Bootstrap 5 styling

- Locally uploaded images- ✅ Loading states and error handling

- Automatic fallback for missing images- ✅ Professional UI/UX

- ✅ Clean and maintainable code

### Course Structure

Each course includes:## 🔒 Security

- Course thumbnail and cover image

- Detailed description- Environment variables for sensitive data

- Multiple modules- Server-side payment verification

- Video content for each module- File upload validation (PDF only, 10MB limit)

- PDF resources and materials- CORS configuration

- Progress tracking- Error handling and logging



### Payment Integration## 🤝 Contributing

- Secure payment processing

- Course enrollment after successful paymentThis is a demonstration project. For improvements:

- Payment history tracking1. Fork the repository

2. Create a feature branch

## 🔒 Authentication & Security3. Commit your changes

4. Push to the branch

- JWT-based authentication5. Open a pull request

- Bcrypt password hashing

- Protected routes for authenticated users## 📄 License

- Role-based access control (Student/Admin)

- Secure file upload handlingThis project is created as part of a job assignment for Imarticus Learning.



## 🌐 API Endpoints## 👨‍💻 Author



### Authentication**Vinay Jain**

- `POST /api/auth/register` - Register new user- Email: [Your Email]

- `POST /api/auth/login` - User login- GitHub: [Your GitHub Profile]



### Courses## 🙏 Acknowledgments

- `GET /api/courses` - Get all courses

- `GET /api/courses/:id` - Get single course- Imarticus Learning for the assignment

- `POST /api/courses` - Create course (Admin)- Azure OpenAI for AI capabilities

- `PUT /api/courses/:id` - Update course (Admin)- Razorpay for payment integration

- MongoDB Atlas for database hosting

### Payments

- `POST /api/payments/enroll` - Process payment and enrollment---

- `GET /api/payments/user/:userId` - Get user payment history

**Note**: This project demonstrates proficiency in full-stack development, API integration, AI features, and deployment practices.

### Admin
- `POST /api/admin/upload` - Upload course materials
- `GET /api/admin/courses` - Manage all courses

## 🎓 Sample Courses

The platform comes pre-seeded with 15 courses across 5 categories:

**Finance**: Investment Banking, Financial Modeling, Chartered Accountancy
**Technology**: Full Stack Development, Data Science, Cloud Computing
**Analytics**: Business Analytics, Data Visualization, Predictive Analytics
**Marketing**: Digital Marketing, Content Marketing, SEO Mastery
**Management**: Project Management, Operations Management, Strategic Management

## 📱 Responsive Design

The platform is fully responsive and works seamlessly on:
- Desktop computers (1920px and above)
- Laptops (1366px - 1920px)
- Tablets (768px - 1366px)
- Mobile devices (320px - 768px)

## 🚀 Deployment

### Frontend Deployment (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Backend Deployment (Render/Railway)
1. Push code to GitHub
2. Connect to hosting platform
3. Set environment variables
4. Deploy with auto-scaling

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Future Enhancements

- [ ] Live video classes integration
- [ ] Real-time chat between students and instructors
- [ ] Quiz and assessment system
- [ ] Certificate generation upon course completion
- [ ] Mobile app (React Native)
- [ ] AI-powered course recommendations
- [ ] Discussion forums with threading
- [ ] Gamification with badges and leaderboards
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

## 🐛 Known Issues & Troubleshooting

### Issue: Images not loading
**Solution**: Check if MongoDB has correct Unsplash URLs in course thumbnails

### Issue: CORS errors
**Solution**: Ensure backend CORS configuration allows frontend URL

### Issue: Login not working
**Solution**: Clear localStorage and cookies, then try again

### Issue: Video not playing
**Solution**: Check if video file exists in `backend/public/videos/`

## 📧 Support

For support, email vinayj767@gmail.com or open an issue on GitHub.

## 👨‍💻 Author

**Vinay Jain**
- GitHub: [@vinayj767](https://github.com/vinayj767)
- LinkedIn: [Vinay Jain](https://linkedin.com/in/vinay-jain)

## 🙏 Acknowledgments

- Inspired by leading EdTech platforms like Coursera and Udemy
- Design inspiration from Eckovation
- Icons from Heroicons
- Images from Unsplash

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ by Vinay Jain

**⭐ Star this repo if you found it helpful!**
