# Changelog

All notable changes to SpendSense will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2024-12-XX

### 🎉 Initial Release

#### Added

##### Core Features
- **Transaction Management**
  - Add, edit, and delete income and expense transactions
  - Transaction categorization with custom categories
  - Account association for transactions
  - Date-based transaction organization
  - Transaction history with filtering capabilities
  - Quick entry calculator interface

- **Analytics & Insights**
  - Monthly, yearly, and all-time analytics views
  - Interactive charts and visualizations
  - Category breakdown analysis
  - Year-over-year comparison
  - Net income calculations
  - Monthly savings tracking
  - Trend analysis with visual charts

- **Financial Goals**
  - Create custom financial goals with target amounts
  - Flexible timeframes (monthly, yearly, custom)
  - Progress tracking with visual indicators
  - Goal prioritization and sorting
  - Time-to-goal calculator
  - Multiple goals support

- **Statistics Dashboard**
  - Monthly financial overview
  - Income vs expense breakdown
  - Category-wise spending analysis
  - Date navigation for different periods
  - Transaction lists with quick edit

- **Account Management**
  - Multiple accounts support
  - Add, edit, and delete accounts
  - Account organization and categorization

- **Category Management**
  - Custom income and expense categories
  - Separate category management
  - Quick category creation

##### Security & Privacy
- AES-256 encryption for all sensitive data
- Encrypted local storage
- Secure backup system with passphrase protection
- Privacy-first architecture (no cloud sync)
- Local-only data storage

##### Backup & Restore
- Encrypted backup export functionality
- Backup import and restoration
- JSON backup format for portability
- Complete data restoration (transactions, goals, accounts, categories, settings)

##### Notifications
- Daily transaction reminders
- Customizable notification settings
- Firebase Cloud Messaging integration
- Local notifications support
- Streak preservation through reminders

##### Personalization
- Dark mode support
- Light mode support
- Automatic theme detection
- User profile with name and picture
- Profile picture from device gallery
- Multi-currency support
- Currency formatting

##### Gamification
- Streak tracking system
- Daily streak counter
- Streak preservation mechanics
- Motivational elements

##### User Experience
- Onboarding flow for new users
- Splash screen
- Smooth animations and transitions
- Haptic feedback
- Bottom tab navigation
- Modal system for actions
- Error boundaries and error handling
- Loading states and feedback

##### Platform Support
- Full Android support
- iOS project structure (in progress)
- Cross-platform codebase

#### Technical

- React Native 0.81.4 setup
- TypeScript 5.8.3 configuration
- React 19.1.0 integration
- React Navigation 7.x for routing
- Context API for state management
- Custom React hooks
- Encrypted storage implementation
- Firebase integration for notifications
- SVG iconography
- Performance optimizations
- Error boundary implementation
- Storage migration system

#### Documentation

- Comprehensive README.md
- Release notes for v1.0.0
- Contributing guidelines
- Project structure documentation
- Installation and setup instructions

---

## [Unreleased]

### Planned Features

- iOS full support
- Budget planning and alerts
- Recurring transactions
- Export to CSV/PDF reports
- Home screen widgets
- Biometric authentication
- Multi-language support
- Receipt scanning with OCR
- Investment tracking
- Cloud sync option (with user consent)
- Additional chart types
- More visualization options

---

[1.0.0]: https://github.com/JoshuaCotee/SpendSense/releases/tag/v1.0.0

