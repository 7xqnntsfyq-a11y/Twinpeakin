# iOS Deployment Guide for Twinpeakin

This guide covers how to deploy Twinpeakin to the iOS App Store. Since Replit doesn't have Xcode, you have two options for building and deploying your iOS app.

## Prerequisites

- **Apple Developer Account** ($99/year) - Required for both options
- **Capacitor Configuration** ✅ Already set up in this project

## Option A: Using Expo Application Services (EAS) ⭐ **Recommended for Replit Users**

EAS provides cloud-based iOS builds without needing a Mac or Xcode.

### Why Use EAS?

- ✅ No Mac or Xcode required
- ✅ Cloud-based builds
- ✅ Built-in Replit support
- ✅ Automated build process
- ✅ Easy App Store submission

### Steps to Deploy with EAS:

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure EAS**
   ```bash
   eas build:configure
   ```

4. **Build for iOS**
   ```bash
   eas build --platform ios
   ```

5. **Submit to App Store**
   ```bash
   eas submit --platform ios
   ```

### Additional Resources:

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Replit EAS Integration](https://docs.replit.com/hosting/deployments/expo-application-services)

---

## Option B: Local Xcode Build 💻 **For Users with Mac**

If you have a Mac with Xcode, you can build locally.

### Requirements:

- macOS (Monterey or later recommended)
- Xcode 14+ (download from Mac App Store)
- CocoaPods (install via `sudo gem install cocoapods`)

### Steps to Deploy with Xcode:

1. **Build the Web App**
   
   First, build your web application:
   ```bash
   npm run build
   ```
   
   This creates the production build in `dist/public/`

2. **Add iOS Platform** ⚠️ **Do this on your Mac, not on Replit**
   
   ```bash
   npx cap add ios
   ```
   
   This creates the `ios/` directory with your Xcode project.

3. **Sync Your Web App to iOS**
   
   Whenever you update your web app, sync the changes:
   ```bash
   npx cap sync ios
   ```
   
   Or use the combined build + sync command:
   ```bash
   npm run cap:build
   ```

4. **Open in Xcode**
   
   ```bash
   npx cap open ios
   ```
   
   Or use the npm script:
   ```bash
   npm run cap:open:ios
   ```

5. **Configure Your App in Xcode**
   
   - Select your development team (your Apple Developer account)
   - Update bundle identifier if needed (currently: `com.connorbelanger.twinpeakin`)
   - Configure app icons and launch screens
   - Set up signing certificates

6. **Build and Run**
   
   - Select a target device (simulator or physical device)
   - Click the "Play" button to build and run
   - Test thoroughly on both simulator and real devices

7. **Archive and Submit to App Store**
   
   - Product → Archive
   - Once archived, click "Distribute App"
   - Follow the prompts to submit to App Store Connect
   - Complete app metadata in App Store Connect
   - Submit for review

### Testing on Physical Devices:

1. Connect your iPhone via USB
2. Select it as the build target in Xcode
3. Build and run
4. Trust the developer certificate on your iPhone (Settings → General → Device Management)

---

## Current Project Configuration

Your Capacitor configuration is already set up in `capacitor.config.ts`:

```typescript
{
  appId: 'com.connorbelanger.twinpeakin',
  appName: 'Twinpeakin',
  webDir: 'dist/public',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  }
}
```

## Available NPM Scripts

- `npm run cap:sync` - Sync web app to native projects
- `npm run cap:build` - Build web app and sync to native projects
- `npm run cap:open:ios` - Open iOS project in Xcode

## Important Notes

⚠️ **Do NOT run `npx cap add ios` on Replit** - It requires Xcode and won't work in the Replit environment.

✅ **Development Workflow:**
1. Develop and test your web app on Replit
2. When ready to build for iOS:
   - **EAS Route**: Push to Git, use EAS to build
   - **Local Route**: Download code to Mac, run `npx cap add ios`, then build

## App Store Requirements

Before submitting to the App Store, ensure you have:

- [ ] App icons (required sizes)
- [ ] Launch screens
- [ ] Privacy policy URL
- [ ] App description and screenshots
- [ ] Support URL
- [ ] App category selection
- [ ] Age rating questionnaire completed
- [ ] Testing on multiple iOS versions
- [ ] Compliance with App Store Review Guidelines

## Troubleshooting

### Build Fails on EAS
- Check your `capacitor.config.ts` configuration
- Ensure all dependencies are properly listed in `package.json`
- Review EAS build logs for specific errors

### Xcode Build Issues
- Clean build folder: Product → Clean Build Folder
- Delete `ios/App/Pods/` and run `npx cap sync ios` again
- Update CocoaPods: `pod repo update`
- Ensure you're using the latest Xcode version

### App Rejected by Apple
- Review the rejection reason carefully
- Common issues: missing privacy descriptions, broken links, crashes
- Address the issues and resubmit

## Next Steps

1. Choose your deployment method (EAS or Xcode)
2. Prepare your Apple Developer account
3. Build your web app with `npm run build`
4. Follow the appropriate deployment steps above
5. Test thoroughly before App Store submission

## Additional Resources

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple Developer Program](https://developer.apple.com/programs/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
