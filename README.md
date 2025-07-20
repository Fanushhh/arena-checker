# ⚔️ League of Legends Arena Match Tracker

A modern web application for tracking your wins and losses with different champions in League of Legends Arena mode. Features smart search functionality, bulk import capabilities, and an intuitive gaming-inspired interface.

![Arena Tracker Demo](https://img.shields.io/badge/Status-Active-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Version](https://img.shields.io/badge/Version-1.0.0-orange)

## ✨ Features

### 🔍 **Smart Champion Search**
- **Instant Search**: Type any part of a champion name to find them
- **Alias Support**: Use common nicknames (GP, MF, ASol, J4, etc.)
- **Inline Stats**: See win/loss stats directly in search results
- **No-Click Checking**: View champion performance without selecting

### 🏆 **Match Tracking**
- **Win/Loss Recording**: Simple buttons to record match results
- **Local Storage**: All data persists between sessions
- **Match History**: View recent games with delete functionality
- **Statistics**: Automatic win rate calculation and performance metrics

### 📁 **Bulk Import System**
- **File Upload**: Import victories from text files
- **Simple Format**: One champion name per line = one victory
- **Smart Parsing**: Handles full names, nicknames, and variations
- **Error Reporting**: Clear feedback on import success/failures

### 🎯 **Recent Victories**
- **Quick Access**: Last 10 champions with wins displayed prominently
- **Visual Cards**: Champion portraits with current stats
- **Clickable**: Select any recent champion for detailed view
- **Auto-Updates**: Refreshes when recording new wins

### 💾 **Backup & Export System**
- **CSV Export**: Download spreadsheet with champion statistics
- **JSON Backup**: Complete data backup for restoration
- **Smart Import**: Merge backups without creating duplicates
- **Data Safety**: Protect against browser data loss

### 🎨 **Modern Gaming UI**
- **Responsive Design**: Works perfectly on desktop and mobile
- **Smart Layout**: Upload section collapses during search for focus
- **Glass Morphism**: Modern blur effects and clean aesthetics
- **Gaming Colors**: Blue/purple gradients with intuitive color coding

## 🚀 Quick Start

1. **Open the Application**
   ```
   Simply open index.html in any modern web browser
   ```

2. **Search for a Champion**
   ```
   Type "Ahri" or "MF" or "GP" in the search bar
   ```

3. **Record Matches**
   ```
   Click a champion → Record Win/Loss → View updated stats
   ```

4. **Import Bulk Data** (Optional)
   ```
   Create a text file with champion names → Upload via 📁 icon
   ```

5. **Backup Your Data** (Recommended)
   ```
   Click "💾 Backup Data (JSON)" → Save file safely
   ```

## 📖 How to Use

### Basic Usage

1. **Search Champions**: Type in the search bar to find champions
2. **View Stats**: See wins/losses/win rate immediately in search results
3. **Record Matches**: Click a champion and use Win/Loss buttons
4. **Quick Access**: Use Recent Victories section for frequently played champions

### File Import

Create a text file with champion names (one per line):
```
Ahri
Yasuo
Jinx
GP
MF
```

Then upload via the 📁 icon or main upload area. Each champion listed will be recorded as one victory.

### Backup & Export

#### Export Your Stats (CSV)
- Click **"📊 Export Stats (CSV)"** to download a spreadsheet
- Opens in Excel, Google Sheets, or any CSV viewer
- Contains: Champion, Wins, Losses, Win Rate, Total Matches, Last Played
- Sorted by win rate (best performers first)

#### Backup Your Data (JSON)
- Click **"💾 Backup Data (JSON)"** for complete data backup
- Includes all matches, timestamps, and recent victories
- Use this before clearing browser data or switching devices

#### Restore From Backup
- Click **"📥 Restore Backup"** to import a JSON backup
- Automatically merges with existing data (no duplicates)
- Perfect for recovering data after browser cleanup

**Example CSV Output:**
```csv
Champion,Wins,Losses,Win Rate,Total Matches,Last Played
Ahri,8,2,80%,10,1/20/2024
Jinx,6,3,67%,9,1/19/2024
Yasuo,4,6,40%,10,1/18/2024
```

### Supported Champion Names

The app recognizes:
- **Full Names**: "Gangplank", "Miss Fortune", "Aurelion Sol"
- **Common Nicknames**: "GP", "MF", "ASol", "J4", "LB", "TF"
- **Partial Names**: "gang", "miss", "aurel"

### Smart UI Behavior

- **Searching**: Upload section collapses to focus on results
- **Champion Selected**: Interface focuses on champion stats and history
- **Title Click**: Click the app title to reset to default view
- **📁 Icon**: Always-accessible upload button next to search bar

## 🛠️ Technical Details

### Built With
- **Vanilla JavaScript**: No frameworks, fast and lightweight
- **HTML5**: Semantic structure with modern features
- **CSS3**: Advanced styling with backdrop filters and transitions
- **Local Storage API**: Client-side data persistence
- **File Reader API**: Text file processing

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### File Structure
```
arena-checker/
├── index.html          # Main application
├── styles.css          # Modern gaming UI styles
├── app.js              # Core functionality and logic
├── champions.js        # Complete champion database
└── README.md           # This documentation
```

## 🎮 Champion Database

Includes all **168+ League of Legends champions** with support for:

- Full champion names
- Common community nicknames
- Riot's official champion IDs
- Champion portrait integration via Riot's CDN

## 📊 Data Management

### Local Storage Structure
```javascript
// Individual champion matches
arena_matches_${championId}: [
  {
    id: timestamp,
    result: 'win' | 'loss',
    timestamp: ISO_string,
    date: formatted_date
  }
]

// Recent victories tracking
arena_recent_victories: [
  {
    championId: string,
    championName: string,
    timestamp: ISO_string
  }
]
```

### Data Persistence
- All match data stored locally in browser
- No external servers or accounts required
- Data survives browser restarts
- **Export/import system protects against data loss**
- JSON backups ensure complete data portability

## 🔧 Customization

### Adding New Champions
Update `champions.js`:
```javascript
const champions = [
    // Add new champions here
    { name: "New Champion", id: "newchampion" },
    // ...existing champions
];
```

### Adding New Aliases
Update the `aliasMatches` object in `app.js`:
```javascript
const aliasMatches = {
    'nickname': 'championid',
    // ...existing aliases
};
```

### Styling Modifications
The CSS uses CSS custom properties for easy theming:
```css
:root {
    --primary-color: #3b82f6;
    --accent-color: #8b5cf6;
    --success-color: #10b981;
    --error-color: #ef4444;
}
```

## 🐛 Troubleshooting

### Champion Images Not Loading
- The app includes automatic fallback to letter placeholders
- Uses Riot's official CDN for champion portraits
- Fallbacks work offline and handle API changes

### Search Not Finding Champions
- Try common nicknames (GP, MF, ASol)
- Use partial names (gang, miss, aurel)
- Check spelling and capitalization (case-insensitive)

### Import File Issues
- Ensure one champion name per line
- Use plain text (.txt) or CSV (.csv) files
- Check file encoding (UTF-8 recommended)

### Data Loss Prevention
- **Regular Backups**: Export JSON backup weekly
- **Before Browser Cleanup**: Always backup before clearing cookies/data
- **Device Migration**: Export on old device, import on new device
- **Backup Storage**: Save JSON files to cloud storage or external drive

### Backup/Restore Issues
- **CSV Won't Open**: Ensure you have Excel, Google Sheets, or text editor
- **JSON Import Fails**: Check file is valid JSON backup from this app
- **Missing Data After Import**: Backup may have been partial or corrupted
- **Duplicate Data**: App prevents duplicates automatically during import

## 🤝 Contributing

### Development Setup
1. Clone/download the project
2. Open `index.html` in your browser
3. Make changes to HTML/CSS/JS files
4. Refresh browser to see changes

### Feature Requests
Ideas for future enhancements:
- Statistics dashboard with charts
- Win streak tracking
- Champion performance analytics
- ~~Export functionality for match data~~ ✅ **Completed**
- Dark/light theme toggle
- Cloud sync options
- Advanced filtering and sorting
- Performance trend analysis

## 📄 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

## 🎯 Acknowledgments

- **Riot Games** for League of Legends and champion data
- **Google Fonts** for Inter and JetBrains Mono typefaces  
- **Claude Code** for development assistance
- **Community** for champion nickname suggestions

---

**Made with ❤️ for the League of Legends Arena community**

*Track your victories, improve your gameplay, dominate the arena!*