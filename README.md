# 💰 SpendSense - AI-Powered Finance Tracker

<div align="center">

![SpendSense Logo](src/assets/images/logo-app.png)

**A beautiful, feature-rich personal finance management app built with React Native**

[![React Native]](https://reactnative.dev/)
[![TypeScript]](https://www.typescriptlang.org/)
[![License]](LICENSE)
[![Open Source]](https://github.com)

</div>

---

## 📱 Overview

**SpendSense** is a comprehensive, open-source personal finance management application designed to help you take control of your financial life. With an intuitive interface, powerful analytics, and robust features, SpendSense makes tracking your income, expenses, and financial goals effortless and enjoyable.

### ✨ Key Highlights

- 🎨 **Beautiful Modern UI** - Clean, intuitive design with dark/light theme support
- 📊 **Advanced Analytics** - Comprehensive insights with interactive charts and visualizations
- 🎯 **Goal Tracking** - Set and monitor financial goals with real-time progress updates
- 🔒 **Privacy First** - All data encrypted and stored locally on your device
- 🌍 **Multi-Currency** - Support for multiple currencies with automatic formatting
- 📈 **Streak System** - Gamified experience to encourage consistent financial tracking
- 🔔 **Smart Notifications** - Daily reminders to help you stay on top of your finances
- 💾 **Backup & Restore** - Secure encrypted backups to protect your financial data

---

## 🚀 Features

### 💵 Transaction Management
- **Add, Edit, Delete** transactions with ease
- **Income & Expense** tracking with detailed categorization
- **Quick Entry** with intuitive calculator interface
- **Transaction History** with search and filtering capabilities
- **Date-based Organization** for easy navigation

### 📊 Analytics & Insights
- **Monthly, Yearly, and All-Time** analytics views
- **Interactive Charts** showing spending patterns and trends
- **Category Breakdown** to identify top spending areas
- **Year-over-Year Comparison** to track financial progress
- **Net Income Calculations** with visual indicators
- **Monthly Savings Tracking** to monitor your financial health

### 🎯 Financial Goals
- **Set Custom Goals** with target amounts and timeframes
- **Progress Tracking** with visual progress bars
- **Multiple Timeframes** - Monthly, Yearly, or Custom periods
- **Goal Prioritization** - See which goals are closest to completion
- **Motivational Insights** - Calculate how long until you reach your goals

### 📈 Statistics Dashboard
- **Monthly Overview** with income, expense, and net totals
- **Transaction Lists** organized by date
- **Category-wise Breakdown** for detailed analysis
- **Date Navigation** to explore different time periods
- **Quick Edit** functionality directly from the stats view

### 🏦 Account Management
- **Multiple Accounts** support for different financial accounts
- **Account Organization** to separate personal, business, or savings accounts
- **Easy Account Management** with add, edit, and delete functionality

### 🏷️ Category Management
- **Custom Categories** for both income and expenses
- **Separate Income/Expense** category management
- **Flexible Organization** to match your spending habits
- **Quick Category Creation** for personalized tracking

### 🔔 Notifications & Reminders
- **Daily Transaction Reminders** to build consistent tracking habits
- **Customizable Notification Settings** to suit your preferences
- **Firebase Cloud Messaging** integration for reliable delivery
- **Streak Preservation** through timely reminders

### 🔒 Security & Privacy
- **Encrypted Storage** - All sensitive data encrypted at rest
- **Local-First Architecture** - Your data stays on your device
- **Secure Backup System** - Encrypted backups with passphrase protection
- **No Cloud Sync** - Complete privacy and control over your data

### 💾 Backup & Restore
- **Encrypted Backups** with AES-256 encryption
- **Export/Import** functionality for data portability
- **JSON Backup Format** for easy data migration
- **Passphrase Protection** for backup security
- **Complete Data Restoration** including transactions, goals, accounts, and settings

### 🎨 Personalization
- **Dark/Light Theme** support with automatic system detection
- **User Profile** with name and profile picture
- **Currency Selection** from a wide range of supported currencies
- **Customizable Categories** and accounts
- **Personalized Dashboard** with greeting and streak counter

### 🏆 Gamification
- **Streak Tracking** - Build a daily habit of tracking transactions
- **Streak Counter** - Visual indicator of your consistency
- **Motivational Elements** - Encouragement to maintain your streak

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0
- **npm** or **yarn**
- **React Native CLI**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Java Development Kit (JDK)** 11 or higher
- **Android SDK** with API level 21+

---

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JoshuaCotee/SpendSense.git
   cd SpendSense
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **iOS Setup** (macOS only)
   ```bash
   cd ios
   pod install
   cd ..
   ```

### Running the App

#### Android

1. **Start an Android emulator** or connect a physical device
   ```bash
   # List available emulators
   emulator -list-avds
   
   # Start an emulator (replace with your emulator name)
   emulator -avd Pixel_7_Pro
   ```

2. **Run the app**
   ```bash
   npm run android
   # or
   npx react-native run-android
   ```

#### iOS (macOS only)

```bash
npm run ios
# or
npx react-native run-ios
```

#### Start Metro Bundler

If you need to start the Metro bundler separately:

```bash
npm start
# or
npx react-native start
```

### Building for Production

#### Android APK

```bash
npm run build:android
# or
cd android && ./gradlew assembleRelease
```

The APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

#### Android App Bundle (AAB)

```bash
npm run build:android:bundle
# or
cd android && ./gradlew bundleRelease
```

---

## 📁 Project Structure

```
SpendSense/
├── src/
│   ├── assets/           # Images, fonts, and static assets
│   ├── components/       # Reusable UI components
│   │   ├── menus/       # Navigation components
│   │   ├── modal/       # Modal components
│   │   ├── navigation/  # Navigation setup
│   │   └── ui/          # UI components
│   ├── constants/       # App constants
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── screens/         # Screen components
│   ├── services/        # Business logic and services
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── android/             # Android native code
├── ios/                 # iOS native code
├── App.tsx              # Root component
└── package.json         # Dependencies and scripts
```

---

## 🎨 Key Features in Detail

### Transaction Management
- Add transactions with amount, category, account, date, and notes
- Edit or delete existing transactions
- Filter transactions by date, category, or account
- View transaction history with intuitive list interface

### Analytics Dashboard
- **Monthly View**: Track your finances month by month
- **Yearly View**: See annual trends and patterns
- **All-Time View**: Comprehensive lifetime financial overview
- **Interactive Charts**: Visual representation of spending patterns
- **Category Analysis**: Identify where your money goes
- **Comparison Tools**: Compare periods to track progress

### Goals System
- Create financial goals with target amounts
- Set timeframes (monthly, yearly, or custom)
- Track progress with visual indicators
- Calculate time to reach goals based on current savings rate
- Multiple goals support with prioritization

### Security Features
- AES-256 encryption for sensitive data
- Encrypted storage for all financial information
- Secure backup system with passphrase protection
- Local-first architecture ensuring data privacy

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, documentation improvements, or UI enhancements, your contributions make SpendSense better for everyone.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** and test thoroughly
4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add comments for complex logic
- Test your changes on both Android and iOS if possible
- Update documentation as needed
- Be respectful and constructive in discussions

### Areas for Contribution

- 🐛 **Bug Fixes** - Help us squash bugs
- ✨ **New Features** - Propose and implement new functionality
- 📝 **Documentation** - Improve docs and add examples
- 🎨 **UI/UX Improvements** - Enhance the user experience
- ⚡ **Performance** - Optimize app performance
- 🌍 **Internationalization** - Add support for more languages
- 🧪 **Testing** - Add unit and integration tests

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ using React Native
- Icons and graphics created with React Native SVG
- Special thanks to all contributors and the open-source community

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/JoshuaCotee/SpendSense/issues)
- **Discussions**: [GitHub Discussions](https://github.com/JoshuaCotee/SpendSense/discussions)
- **Portfolio**: [Website URL](https://joshuacote.net)

---

## 📰 Release Notes

- **[v1.0.0 Release Notes](RELEASE_NOTES.md)** - Check out what's new in the first release!
- **[Changelog](CHANGELOG.md)** - Detailed list of all changes

---

## 🗺️ Todo list

- [ ] Budget planning and alerts
- [ ] Recurring transactions
- [ ] Export to CSV/PDF reports
- [ ] Widget support for home screen
- [ ] Biometric authentication
- [ ] More chart types and visualizations
- [ ] Multi-language support
- [ ] Receipt scanning with OCR
- [ ] Investment tracking

---

<div align="center">

**Originally made with ❤️ by the JoshuaCote**

⭐ Star this repo if you find it helpful!

</div>
