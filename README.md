# Nexus One Emulator (Android 2.3)

A fully functional web-based emulator of the Nexus One running Android 2.3 Gingerbread. Features include a simulated CWM Recovery, detailed boot sequence, functional apps (Market, Browser, Gemini AI integration), and "Cydia" style tweaking.

## Features

- **Realistic Boot Sequence**: Boot logo, boot animation, and Setup Wizard.
- **System States**: Recovery Mode (CWM), Lock Screen, Home Screen, App Drawer.
- **Gemini AI Integration**: Chat with Gemini 3.0 Pro inside the emulator.
- **Customization**: Change wallpapers, ringtones, and install "Tweaks" via Cydia (e.g., ICS Theme, Dark Mode).
- **Mini-Games**: Includes a playable version of Geometry Dash.

## Installation & Local Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/nexus-one-emulator.git
    cd nexus-one-emulator
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up API Key**:
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```
    API_KEY=your_google_gemini_api_key_here
    ```

4.  **Run locally**:
    ```bash
    npm run dev
    ```

## Deploying to GitHub Pages

1.  Open `package.json` and change the `"homepage"` field if necessary (or rely on the `deploy` script).
2.  Run the deploy script:
    ```bash
    npm run deploy
    ```
    *Note: You may need to enable GitHub Pages in your repository settings and select the `gh-pages` branch as the source.*

## Tech Stack

- **React 18**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Lucide React** (Icons)
- **Google GenAI SDK**

## License

MIT
