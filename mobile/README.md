# PowerStream Mobile

React Native mobile app for PowerStream platform.

## Tech Stack

- **React Native** with Expo
- **TypeScript**
- **Redux Toolkit** for state management
- **React Navigation** for routing
- **Axios** for API requests
- **Socket.IO** for real-time features

## Project Structure

```
mobile/
├── App.tsx                    # App entry point
├── package.json
├── tsconfig.json
│
└── src/
    ├── api/                   # API layer (mirrors web client)
    │   ├── httpClient.ts      # Axios instance + interceptors
    │   ├── authApi.ts         # /api/auth/*
    │   ├── feedApi.ts         # /api/powerfeed/*, /api/stories/*
    │   ├── chatApi.ts         # /api/powerline/*
    │   └── tvApi.ts           # /api/tv-stations/*, /api/ps-tv/*
    │
    ├── context/
    │   └── AuthContext.tsx    # Auth context provider
    │
    ├── navigation/
    │   ├── RootNavigator.tsx  # Auth flow + main navigator
    │   ├── AuthNavigator.tsx  # Login, Register screens
    │   └── MainTabNavigator.tsx # Bottom tab navigator
    │
    ├── screens/
    │   ├── LoginScreen.tsx
    │   ├── RegisterScreen.tsx
    │   ├── FeedScreen.tsx     # PowerFeed
    │   ├── ChatScreen.tsx     # PowerLine
    │   ├── TVScreen.tsx       # PowerStream TV
    │   └── ProfileScreen.tsx
    │
    └── store/
        ├── index.ts           # Redux store configuration
        └── slices/
            ├── authSlice.ts
            ├── feedSlice.ts
            └── chatSlice.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
cd mobile
npm install
```

### Running the App

```bash
# Start Expo dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Environment Variables

Create a `.env` file:

```env
EXPO_PUBLIC_API_URL=http://localhost:5001/api
```

For device testing, use your machine's IP address instead of localhost.

## API Integration

The mobile API clients mirror the web client endpoint structure:

| API Module | Endpoints |
|------------|-----------|
| `authApi` | `/api/auth/login`, `/api/auth/register`, `/api/auth/me` |
| `feedApi` | `/api/powerfeed`, `/api/stories` |
| `chatApi` | `/api/powerline`, Socket.IO `/chat` |
| `tvApi` | `/api/tv-stations`, `/api/ps-tv`, `/api/vod` |

### Authentication

JWT tokens are stored securely using `expo-secure-store`:

```typescript
import { authApi } from './api';

// Login
const { user, accessToken } = await authApi.login({ email, password });

// Check auth status
const isLoggedIn = await authApi.isAuthenticated();

// Logout (clears tokens)
await authApi.logout();
```

### Protected Routes

The app uses a navigator-based auth flow:

1. `RootNavigator` checks authentication state
2. If authenticated → `MainTabNavigator` (Feed, Chat, TV, Profile)
3. If not authenticated → `AuthNavigator` (Login, Register)

### Real-time Chat

Socket.IO integration for PowerLine:

```typescript
import { chatApi } from './api';

// Connect socket
chatApi.connectSocket(token);

// Join conversation
chatApi.joinConversation(conversationId);

// Listen for messages
chatApi.onNewMessage((message) => {
  // Handle new message
});

// Send message
const message = await chatApi.sendMessage({ conversationId, content });
chatApi.emitMessage(message); // Broadcast via socket
```

## State Management

Redux Toolkit slices for:

- **authSlice**: User auth state, login/register/logout actions
- **feedSlice**: Posts, stories, pagination, like/unlike
- **chatSlice**: Conversations, messages, typing indicators

## Building for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Or use EAS Build
eas build --platform all
```

## Future Enhancements

- [ ] Push notifications
- [ ] Offline support
- [ ] Video player for PowerReel
- [ ] Camera integration for stories
- [ ] Studio integration
- [ ] Deep linking













