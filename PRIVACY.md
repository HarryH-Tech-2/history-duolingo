# History Hero — Privacy Policy

**Effective date:** 9 June 2026
**Last updated:** 9 June 2026

This privacy policy applies to the **History Hero** mobile application ("History Hero", "the App", "we", "us", or "our"), published on the Google Play Store and the Apple App Store under the package / bundle identifier `com.historyhero.app`.

History Hero is operated by Harry H. ("the developer", "we"). If you have any questions about this policy, please contact us at:

> ✉️ **feedback@historyhero.app**

---

## 1. Summary (plain English)

We built History Hero to be a simple, self-contained learning app. We do **not** require you to create an account, we do **not** ask for your name or email to use the App, and we do **not** run any analytics, advertising, or tracking SDKs inside the App.

All of your progress (lessons completed, XP, streaks, hearts, settings) is stored **locally on your device**. We do not transmit it to any server we control. If you uninstall the App, that data is removed with it.

The only time data leaves your device because of something the App does is if you choose to use one of the following optional, user-initiated features:

- **Tapping "Leave a review"** — opens the Apple App Store or Google Play Store using their official deep-link, where the store handles your review under its own privacy policy.
- **Tapping "Send feedback"** — opens your device's email client with a pre-filled message addressed to `feedback@historyhero.app`. Whether you send the email, and what it contains, is entirely your choice.

That is the full extent of the data flow. The rest of this document spells out the same thing in more detail for completeness and to satisfy the Google Play and App Store Connect disclosure requirements.

---

## 2. Information we do not collect

We do not collect, process, store on a server, or share with any third party any of the following:

- Your name, email address, date of birth, gender, phone number, or any other personally identifying information.
- Your precise or approximate location.
- Your contacts, calendar, photos, media files, microphone, or camera input.
- Your device's advertising identifier (IDFA / GAID).
- Your IP address (we do not operate any backend server that would receive it).
- Any behavioural or analytics data (which screens you visited, how long you spent in a lesson, which answers you chose, etc.).
- Any crash logs or diagnostic reports beyond those that Apple and Google may collect at the operating-system level (see [section 5](#5-services-provided-by-apple-and-google)).

The App contains **no advertising SDKs**, **no third-party analytics SDKs**, and **no behavioural tracking** of any kind.

---

## 3. Information stored locally on your device

The App stores the following information in memory and/or in the operating system's app sandbox on your device only:

- Your selected avatar.
- Lesson progress (which lessons you have completed, your active lesson, XP, hearts, streak count, region progress).
- Your in-session quiz answers (used to score the lesson, then discarded).
- Your settings (sound effects on/off, haptics on/off, background music on/off, music track selection, colour theme, whether you have already left a review).
- Whether you have completed the onboarding flow.

None of the above is sent to any server we operate. It exists only on your device and is deleted when you uninstall the App.

---

## 4. Permissions the App may request

On **Android** the App declares the following permissions in its manifest. We list each one and explain why:

| Permission | Why we declare it |
|---|---|
| `INTERNET` | Required by the Android system for app updates, font loading by the Expo runtime, and for the "Leave a review" deep link to fall back to a Play Store web URL if the Play Store app is not installed. |
| `VIBRATE` | Used by the in-lesson haptic feedback (the gentle buzz when you answer correctly or incorrectly). You can disable this from the Profile screen. |
| `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` | Declared by underlying React Native / Expo libraries. The App itself does not read or write your photos, documents, or other files. |
| `SYSTEM_ALERT_WINDOW` | Declared by underlying React Native debugging tooling. The App does not draw overlays on top of other apps in normal use. |

On **iOS** the App does not request access to your location, contacts, camera, microphone, photos, calendar, or Bluetooth.

---

## 5. Services provided by Apple and Google

When you install an app from the Apple App Store or Google Play Store, Apple or Google may collect information about the installation, usage, crashes, and your device under their own terms. We do not control those collections and we receive only the aggregate, anonymised reporting that the stores make available to all developers (for example: number of installs by country, crash rate, average rating).

You can review their policies here:

- **Apple:** <https://www.apple.com/legal/privacy/>
- **Google:** <https://policies.google.com/privacy>

If you choose to leave a review or rating, the store will publish your review under its own terms.

---

## 6. Third-party libraries

The App is built using open-source libraries, including the Expo framework, React Native, and various components of the React ecosystem. These libraries run entirely on your device and, in their default configuration as used by this App, do not transmit personal information about you to their authors or to us.

The App does **not** embed Firebase, Google Analytics, Facebook SDK, AppsFlyer, Adjust, Mixpanel, Amplitude, Sentry, Crashlytics, or any comparable analytics, attribution, or crash-reporting service.

---

## 7. Children's privacy

History Hero is a general-audience educational app and may be used by children. Because we do not collect any personal information from any user, we do not knowingly collect personal information from children under 13 (or the equivalent minimum age in your jurisdiction). The App contains no advertising, no in-app purchases, no chat, and no user-generated content.

The "Send feedback" button opens your device's email client. A child should ask a parent or guardian before sending an email.

---

## 8. Data retention and deletion

Because all data the App stores stays on your device, you can delete it at any time by **uninstalling the App**. We do not retain a server-side copy because we never received one.

If you have previously emailed us feedback at `feedback@historyhero.app` and would like that email deleted, write to the same address and we will delete it within 30 days.

---

## 9. International users

History Hero can be downloaded worldwide. Because we do not collect personal information from you, no cross-border transfer of your data takes place as a result of using the App. Your store account information (Apple ID, Google account) is handled by Apple or Google under their respective privacy policies.

---

## 10. Your rights

Depending on where you live, you may have rights under laws such as the EU/UK General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA / CPRA), or similar regimes, to access, correct, or delete personal information held about you. Because we do not collect or hold personal information about you, we have nothing on file to disclose or delete. You can still contact us at `feedback@historyhero.app` to exercise these rights and we will respond within the time required by applicable law.

---

## 11. Changes to this policy

We may update this policy when the App changes — for example, if we add a feature that requires us to handle data differently. When we do, we will update the **Last updated** date at the top of this document and, for material changes, post a notice in the App. Continued use of the App after a change indicates acceptance of the updated policy.

---

## 12. Contact

If you have any questions about this policy or about how History Hero handles your data, please contact:

**Harry H.**
✉️ `feedback@historyhero.app`

We will respond as soon as we reasonably can.

---

*End of policy.*
