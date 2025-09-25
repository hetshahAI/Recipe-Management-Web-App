# Recipe Management Web App

A modern full-stack recipe management application with **AI-powered recipe generation**, built with React, Supabase, and deployed on Vercel.

![Recipe App](https://img.shields.io/badge/React-18.2.0-blue) ![Supabase](https://img.shields.io/badge/Supabase-Backend-green) ![AI](https://img.shields.io/badge/AI-Recipe_Generator-orange) ![Vercel](https://img.shields.io/badge/Vercel-Deployed-black)

## 🚀 Live Demo

**[https://recipe-management-web-app.vercel.app/](https://recipe-management-web-app.vercel.app/)**

## ✨ Features

- **🤖 AI Recipe Generator** - Generate recipes automatically using AI
- **📖 Browse Recipes** - View your entire recipe collection
- **➕ Add Recipes** - Simple form to add new recipes
- **✏️ Edit Recipes** - Update existing recipes
- **🗑️ Delete Recipes** - Remove unwanted recipes
- **🔍 Search** - Find recipes by name or ingredients
- **📱 Responsive** - Works on all devices

## 🛠️ Tech Stack

**Frontend:** React, CSS3  
**Backend:** Supabase (PostgreSQL)  
**AI Integration:** AI API for recipe generation  
**Deployment:** Vercel

## 🏃‍♂️ Quick Start

```bash
# Clone and install
git clone https://github.com/yourusername/recipe-management-web-app.git
cd recipe-management-web-app
npm install

# Environment setup (create .env file)
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_AI_API_KEY=your_ai_api_key

# Start development
npm start
```

## 🤖 AI Recipe Generator

The app includes an intelligent AI feature that:
- Generates unique recipes based on ingredients or themes
- Provides complete ingredients lists and cooking instructions
- Saves AI-generated recipes directly to your collection

## 🗄️ Database Schema

```sql
recipes table:
- id (UUID, Primary Key)
- title (Text)
- ingredients (Text[])
- instructions (Text)
- cooking_time (Integer)
- difficulty (Text)
- is_ai_generated (Boolean)
- created_at (Timestamp)
```

## 🚀 Deployment

Automatically deployed on Vercel. Push to main branch to update live site.
[vercel link](https://vercel.com/hetshahais-projects/recipe-management-web-app)
---

⭐ Love the AI recipe feature? Give this repo a star!

## 📞 Contact

Your Name - [het shah](hetshah1704@gmail.com)

Project Link: [https://github.com/hetshahAI/recipe-management-web-app](https://github.com/yourusername/recipe-management-web-app)

---

⭐ If you like this project, give it a star on GitHub!
