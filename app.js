let currentChampion = null;

const searchInput = document.getElementById('championSearch');
const searchResults = document.getElementById('searchResults');
const championInfo = document.getElementById('championInfo');
const matchHistory = document.getElementById('matchHistory');
const fileInput = document.getElementById('fileInput');
const fileUploadArea = document.getElementById('fileUploadArea');
const importResults = document.getElementById('importResults');
const recentChampionsGrid = document.getElementById('recentChampionsGrid');
const uploadIconBtn = document.getElementById('uploadIconBtn');
const importSection = document.getElementById('importSection');
const appTitle = document.getElementById('appTitle');
const backupInput = document.getElementById('backupInput');

function createChampionImageElement(championId, championName, className = 'champion-icon') {
    const img = document.createElement('img');
    img.src = getChampionImageUrl(championId);
    img.alt = championName;
    img.className = className;
    
    img.onerror = function() {
        this.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.className = className + ' champion-placeholder';
        placeholder.textContent = championName.charAt(0).toUpperCase();
        placeholder.title = championName;
        this.parentNode.insertBefore(placeholder, this);
    };
    
    return img;
}

function getRecentVictories() {
    const recentVictories = localStorage.getItem('arena_recent_victories');
    return recentVictories ? JSON.parse(recentVictories) : [];
}

function addRecentVictory(championId, championName) {
    let recentVictories = getRecentVictories();
    
    // Remove if already exists (to move to front)
    recentVictories = recentVictories.filter(victory => victory.championId !== championId);
    
    // Add to front
    recentVictories.unshift({
        championId: championId,
        championName: championName,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 10
    recentVictories = recentVictories.slice(0, 10);
    
    localStorage.setItem('arena_recent_victories', JSON.stringify(recentVictories));
    displayRecentVictories();
}

function displayRecentVictories() {
    const recentVictories = getRecentVictories();
    
    if (recentVictories.length === 0) {
        recentChampionsGrid.innerHTML = `
            <div class="no-recent-victories">
                <p>No recent victories yet. Start winning some arena matches!</p>
            </div>
        `;
        return;
    }
    
    const recentHTML = recentVictories.map(victory => {
        const stats = getChampionStats(victory.championId);
        const escapedName = victory.championName.replace(/'/g, "\\'");
        return `
            <div class="recent-champion-item" onclick="selectChampion('${victory.championId}', '${escapedName}')" title="${victory.championName} - ${stats.wins}W ${stats.losses}L">
                ${getChampionImageHTML(victory.championId, victory.championName, 'recent-champion-icon')}
                <div class="recent-champion-info">
                    <span class="recent-champion-name">${victory.championName}</span>
                    <span class="recent-champion-stats">${stats.wins}W ${stats.losses}L</span>
                </div>
            </div>
        `;
    }).join('');
    
    recentChampionsGrid.innerHTML = recentHTML;
}

function collapseImportSection() {
    importSection.classList.add('collapsed');
}

function expandImportSection() {
    importSection.classList.remove('collapsed');
}

function resetToDefaultView() {
    // Clear search
    searchInput.value = '';
    searchResults.style.display = 'none';
    
    // Hide champion info and match history
    championInfo.style.display = 'none';
    matchHistory.style.display = 'none';
    
    // Reset current champion
    currentChampion = null;
    
    // Expand import section
    expandImportSection();
}

function getChampionImageHTML(championId, championName, className = 'champion-icon') {
    return `<img src="${getChampionImageUrl(championId)}" 
                 alt="${championName}" 
                 class="${className}"
                 onerror="this.style.display='none'; 
                         if(!this.nextElementSibling || !this.nextElementSibling.classList.contains('champion-placeholder')) {
                             const placeholder = document.createElement('div');
                             placeholder.className = '${className} champion-placeholder';
                             placeholder.textContent = '${championName.charAt(0).toUpperCase()}';
                             placeholder.title = '${championName}';
                             this.parentNode.insertBefore(placeholder, this.nextSibling);
                         }">`;
}

searchInput.addEventListener('input', handleSearch);
searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim()) {
        searchResults.style.display = 'block';
    }
});

uploadIconBtn.addEventListener('click', () => {
    fileInput.click();
});

appTitle.addEventListener('click', resetToDefaultView);

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        searchResults.style.display = 'none';
    }
});

function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (query.length === 0) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        expandImportSection();
        return;
    }

    // Collapse import section when user starts searching
    collapseImportSection();

    // First, try to find exact alias match
    const aliasMatch = findChampionByName(query);
    
    // Then filter for partial matches
    const partialMatches = champions.filter(champion => 
        champion.name.toLowerCase().includes(query)
    );
    
    // Combine results, prioritizing alias match
    let filteredChampions = [];
    
    if (aliasMatch && !partialMatches.includes(aliasMatch)) {
        filteredChampions.push(aliasMatch);
    }
    
    filteredChampions = filteredChampions.concat(partialMatches);
    
    // Remove duplicates and limit to 8 results
    const uniqueChampions = filteredChampions.filter((champion, index, self) => 
        index === self.findIndex(c => c.id === champion.id)
    ).slice(0, 8);

    displaySearchResults(uniqueChampions);
}

function displaySearchResults(champions) {
    if (champions.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No champions found</div>';
        searchResults.style.display = 'block';
        return;
    }

    const resultsHTML = champions.map(champion => {
        const stats = getChampionStats(champion.id);
        const hasMatches = stats.wins > 0 || stats.losses > 0;
        const winRate = hasMatches ? calculateWinRate(stats.wins, stats.losses) : null;
        const escapedName = champion.name.replace(/'/g, "\\'");
        
        return `
            <div class="search-result-item" onclick="selectChampion('${champion.id}', '${escapedName}')">
                ${getChampionImageHTML(champion.id, champion.name, 'champion-icon')}
                <div class="champion-info-inline">
                    <span class="champion-name">${champion.name}</span>
                    ${hasMatches ? `
                        <div class="champion-stats-inline">
                            <span class="wins-inline">${stats.wins}W</span>
                            <span class="losses-inline">${stats.losses}L</span>
                            <span class="winrate-inline">${winRate}</span>
                        </div>
                    ` : '<span class="no-matches-inline">No matches yet</span>'}
                </div>
            </div>
        `;
    }).join('');

    searchResults.innerHTML = resultsHTML;
    searchResults.style.display = 'block';
}

function selectChampion(championId, championName) {
    currentChampion = { id: championId, name: championName };
    searchInput.value = championName;
    searchResults.style.display = 'none';
    
    // Collapse import section when champion is selected
    collapseImportSection();
    
    // If showing no wins list, collapse it and return to recent victories
    if (showingNoWins) {
        showingNoWins = false;
        noWinsDisplayCount = 20; // Reset display count
        const btn = document.getElementById('showNoWinsBtn');
        const container = document.querySelector('.recent-victories-container');
        
        btn.classList.remove('active');
        btn.innerHTML = '🔍 No Wins';
        btn.title = 'Show champions you haven\'t won with';
        
        // Restore section header
        container.querySelector('h3').textContent = 'Recent Victories';
        container.querySelector('p').textContent = 'Your last 10 champions with wins';
        
        displayRecentVictories();
    }
    
    displayChampionInfo();
    displayMatchHistory();
}

function displayChampionInfo() {
    if (!currentChampion) return;

    const stats = getChampionStats(currentChampion.id);
    
    const championImageElement = document.getElementById('championImage');
    championImageElement.src = getChampionImageUrl(currentChampion.id);
    championImageElement.alt = currentChampion.name;
    
    championImageElement.onerror = function() {
        this.style.display = 'none';
        let placeholder = this.nextElementSibling;
        if (!placeholder || !placeholder.classList.contains('champion-placeholder')) {
            placeholder = document.createElement('div');
            placeholder.className = 'champion-portrait champion-placeholder';
            placeholder.textContent = currentChampion.name.charAt(0).toUpperCase();
            placeholder.title = currentChampion.name;
            this.parentNode.insertBefore(placeholder, this.nextSibling);
        } else {
            placeholder.style.display = 'flex';
        }
    };
    
    championImageElement.onload = function() {
        this.style.display = 'block';
        const placeholder = this.nextElementSibling;
        if (placeholder && placeholder.classList.contains('champion-placeholder')) {
            placeholder.style.display = 'none';
        }
    };
    
    document.getElementById('championName').textContent = currentChampion.name;
    document.getElementById('wins').textContent = stats.wins;
    document.getElementById('losses').textContent = stats.losses;
    document.getElementById('winRate').textContent = calculateWinRate(stats.wins, stats.losses);
    
    championInfo.style.display = 'block';
}

function getChampionStats(championId) {
    const matches = getMatches(championId);
    const wins = matches.filter(match => match.result === 'win').length;
    const losses = matches.filter(match => match.result === 'loss').length;
    
    return { wins, losses };
}

function calculateWinRate(wins, losses) {
    const total = wins + losses;
    if (total === 0) return '0%';
    return Math.round((wins / total) * 100) + '%';
}

function getMatches(championId) {
    const matches = localStorage.getItem(`arena_matches_${championId}`);
    return matches ? JSON.parse(matches) : [];
}

function saveMatch(championId, result) {
    const matches = getMatches(championId);
    const newMatch = {
        id: Date.now(),
        result: result,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString()
    };
    
    matches.unshift(newMatch);
    
    if (matches.length > 50) {
        matches.splice(50);
    }
    
    localStorage.setItem(`arena_matches_${championId}`, JSON.stringify(matches));
}

function recordMatch(result) {
    if (!currentChampion) return;
    
    saveMatch(currentChampion.id, result);
    
    // Track recent victories
    if (result === 'win') {
        addRecentVictory(currentChampion.id, currentChampion.name);
    }
    
    displayChampionInfo();
    displayMatchHistory();
    
    showNotification(`${result === 'win' ? 'Win' : 'Loss'} recorded for ${currentChampion.name}!`);
}

function displayMatchHistory() {
    if (!currentChampion) return;
    
    const matches = getMatches(currentChampion.id);
    const matchesList = document.getElementById('matchesList');
    
    if (matches.length === 0) {
        matchesList.innerHTML = '<p class="no-matches">No matches recorded yet. Play some arena games and record your results!</p>';
    } else {
        const matchesHTML = matches.slice(0, 10).map(match => `
            <div class="match-item ${match.result}">
                <span class="match-result">${match.result === 'win' ? 'W' : 'L'}</span>
                <span class="match-date">${match.date}</span>
                <button class="delete-match" onclick="deleteMatch('${currentChampion.id}', ${match.id})" title="Delete match">×</button>
            </div>
        `).join('');
        
        matchesList.innerHTML = matchesHTML;
    }
    
    matchHistory.style.display = 'block';
}

function deleteMatch(championId, matchId) {
    const matches = getMatches(championId);
    const updatedMatches = matches.filter(match => match.id !== matchId);
    
    localStorage.setItem(`arena_matches_${championId}`, JSON.stringify(updatedMatches));
    
    displayChampionInfo();
    displayMatchHistory();
    
    showNotification('Match deleted!');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        searchResults.style.display = 'none';
    }
});

// Initialize recent victories on page load
document.addEventListener('DOMContentLoaded', () => {
    displayRecentVictories();
});

let showingNoWins = false;
let noWinsDisplayCount = 20;

function toggleNoWinsView() {
    const btn = document.getElementById('showNoWinsBtn');
    const container = document.querySelector('.recent-victories-container');
    const grid = document.getElementById('recentChampionsGrid');
    
    if (!showingNoWins) {
        // Switching to no wins view
        showingNoWins = true;
        noWinsDisplayCount = 20;
        
        btn.classList.add('active');
        btn.innerHTML = '↩️ Back';
        btn.title = 'Back to recent victories';
        
        // Update section header
        container.querySelector('h3').textContent = 'Champions Without Wins';
        container.querySelector('p').textContent = 'Loading...';
        
        // Add fade out animation
        grid.style.opacity = '0';
        grid.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            displayChampionsWithoutWins();
            // Fade in new content
            grid.style.opacity = '1';
            grid.style.transform = 'translateY(0)';
        }, 200);
    } else {
        // Switching back to recent victories
        showingNoWins = false;
        noWinsDisplayCount = 20;
        
        btn.classList.remove('active');
        btn.innerHTML = '🔍 No Wins';
        btn.title = 'Show champions you haven\'t won with';
        
        // Restore section header
        container.querySelector('h3').textContent = 'Recent Victories';
        container.querySelector('p').textContent = 'Your last 10 champions with wins';
        
        // Add fade out animation
        grid.style.opacity = '0';
        grid.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            displayRecentVictories();
            // Fade in new content
            grid.style.opacity = '1';
            grid.style.transform = 'translateY(0)';
        }, 200);
    }
}

function hideLastNoWins() {
    // Reduce display count by 20 (but keep minimum of 20)
    noWinsDisplayCount = Math.max(20, noWinsDisplayCount - 20);
    
    const grid = document.getElementById('recentChampionsGrid');
    
    // Add fade out animation
    grid.style.opacity = '0.7';
    grid.style.transform = 'translateY(-5px)';
    
    setTimeout(() => {
        displayChampionsWithoutWins();
        // Fade in updated content
        grid.style.opacity = '1';
        grid.style.transform = 'translateY(0)';
    }, 150);
}

function showMoreNoWins() {
    noWinsDisplayCount += 20;
    displayChampionsWithoutWins();
}

function displayChampionsWithoutWins() {
    const championsWithoutWins = [];
    
    // Check each champion for wins
    champions.forEach(champion => {
        const stats = getChampionStats(champion.id);
        if (stats.wins === 0) {
            championsWithoutWins.push(champion);
        }
    });
    
    const container = document.querySelector('.recent-victories-container');
    
    if (championsWithoutWins.length === 0) {
        container.querySelector('p').textContent = 'You have at least one win with every champion!';
        recentChampionsGrid.innerHTML = `
            <div class="no-recent-victories">
                <p>🎉 Amazing! You have at least one win with every champion!</p>
            </div>
        `;
        return;
    }
    
    // Sort alphabetically for easier browsing
    championsWithoutWins.sort((a, b) => a.name.localeCompare(b.name));
    
    // Determine how many to show based on current display count
    const totalCount = championsWithoutWins.length;
    const championsToShow = championsWithoutWins.slice(0, noWinsDisplayCount);
    const showingCount = championsToShow.length;
    
    // Update description with count
    container.querySelector('p').textContent = `Showing ${showingCount} of ${totalCount} champions you haven't won with yet`;
    
    const noWinsHTML = championsToShow.map(champion => {
        const stats = getChampionStats(champion.id);
        const escapedName = champion.name.replace(/'/g, "\\'");
        return `
            <div class="recent-champion-item no-wins-item" onclick="selectChampion('${champion.id}', '${escapedName}')" title="${champion.name} - No wins yet">
                ${getChampionImageHTML(champion.id, champion.name, 'recent-champion-icon')}
                <div class="recent-champion-info">
                    <span class="recent-champion-name">${champion.name}</span>
                    <span class="recent-champion-stats no-wins-stats">${stats.losses > 0 ? `${stats.losses}L` : 'No matches'}</span>
                </div>
            </div>
        `;
    }).join('');
    
    // Add action buttons
    let buttonHTML = '';
    
    // Show More button if there are more champions to display
    if (showingCount < totalCount) {
        const remaining = totalCount - showingCount;
        const nextBatch = Math.min(20, remaining);
        buttonHTML += `
            <div class="view-more-container">
                <button class="btn-view-more" onclick="showMoreNoWins()">
                    📋 Show ${nextBatch} More Champions
                </button>
            </div>
        `;
    }
    
    // Hide last 20 button (only show if we're displaying more than 20)
    if (noWinsDisplayCount > 20) {
        buttonHTML += `
            <div class="view-more-container">
                <button class="btn-hide-list" onclick="hideLastNoWins()">
                    🙈 Hide Last 20
                </button>
            </div>
        `;
    }
    
    recentChampionsGrid.innerHTML = noWinsHTML + buttonHTML;
}


function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function exportToCSV() {
    const championsWithData = [];
    
    // Collect all champions with match data
    champions.forEach(champion => {
        const matches = getMatches(champion.id);
        if (matches.length > 0) {
            const stats = getChampionStats(champion.id);
            championsWithData.push({
                championName: champion.name,
                wins: stats.wins,
                losses: stats.losses,
                winRate: calculateWinRate(stats.wins, stats.losses),
                totalMatches: matches.length,
                lastPlayed: matches[0]?.date || 'N/A'
            });
        }
    });
    
    if (championsWithData.length === 0) {
        showNotification('No match data to export!');
        return;
    }
    
    // Sort by win rate (descending)
    championsWithData.sort((a, b) => {
        const aRate = parseInt(a.winRate);
        const bRate = parseInt(b.winRate);
        return bRate - aRate;
    });
    
    // Create CSV content
    const headers = ['Champion', 'Wins', 'Losses', 'Win Rate', 'Total Matches', 'Last Played'];
    const csvContent = [
        headers.join(','),
        ...championsWithData.map(champ => [
            champ.championName,
            champ.wins,
            champ.losses,
            champ.winRate,
            champ.totalMatches,
            champ.lastPlayed
        ].join(','))
    ].join('\n');
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `arena-tracker-stats-${timestamp}.csv`;
    
    downloadFile(csvContent, filename, 'text/csv');
    showNotification(`Exported ${championsWithData.length} champions to ${filename}`);
}

function exportToJSON() {
    const allData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        champions: {},
        recentVictories: getRecentVictories()
    };
    
    // Collect all match data
    let totalMatches = 0;
    champions.forEach(champion => {
        const matches = getMatches(champion.id);
        if (matches.length > 0) {
            allData.champions[champion.id] = {
                name: champion.name,
                matches: matches
            };
            totalMatches += matches.length;
        }
    });
    
    if (totalMatches === 0) {
        showNotification('No match data to export!');
        return;
    }
    
    const jsonContent = JSON.stringify(allData, null, 2);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `arena-tracker-backup-${timestamp}.json`;
    
    downloadFile(jsonContent, filename, 'application/json');
    showNotification(`Exported complete backup with ${totalMatches} matches to ${filename}`);
}

function importFromJSON(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.version || !data.champions) {
                throw new Error('Invalid backup file format');
            }
            
            let importedMatches = 0;
            let importedChampions = 0;
            
            // Import champion matches
            Object.keys(data.champions).forEach(championId => {
                const championData = data.champions[championId];
                if (championData.matches && championData.matches.length > 0) {
                    // Merge with existing data
                    const existingMatches = getMatches(championId);
                    const existingIds = new Set(existingMatches.map(m => m.id));
                    
                    // Add new matches (avoid duplicates)
                    const newMatches = championData.matches.filter(m => !existingIds.has(m.id));
                    const mergedMatches = [...existingMatches, ...newMatches]
                        .sort((a, b) => b.id - a.id) // Sort by newest first
                        .slice(0, 50); // Keep only last 50
                    
                    localStorage.setItem(`arena_matches_${championId}`, JSON.stringify(mergedMatches));
                    importedMatches += newMatches.length;
                    if (newMatches.length > 0) importedChampions++;
                }
            });
            
            // Import recent victories (merge and deduplicate)
            if (data.recentVictories) {
                const existingRecent = getRecentVictories();
                const existingIds = new Set(existingRecent.map(v => v.championId));
                
                const newRecent = data.recentVictories.filter(v => !existingIds.has(v.championId));
                const mergedRecent = [...existingRecent, ...newRecent].slice(0, 10);
                
                localStorage.setItem('arena_recent_victories', JSON.stringify(mergedRecent));
            }
            
            // Refresh displays
            displayRecentVictories();
            if (currentChampion) {
                displayChampionInfo();
                displayMatchHistory();
            }
            
            showNotification(`Successfully imported ${importedMatches} matches for ${importedChampions} champions!`);
            
        } catch (error) {
            showNotification('Error importing backup file: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}


function clearAllData() {
    // Create custom confirmation dialog to bypass browser blocking
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: 'Inter', sans-serif;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 0.75rem;
        padding: 2rem;
        max-width: 400px;
        text-align: center;
        color: #e2e8f0;
    `;
    
    dialog.innerHTML = `
        <h3 style="margin: 0 0 1rem 0; color: #ef4444;">⚠️ Delete All Data</h3>
        <p style="margin: 0 0 2rem 0; line-height: 1.5;">Delete all arena data? This cannot be undone.</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button id="cancelBtn" style="
                padding: 0.75rem 1.5rem;
                border: 2px solid #64748b;
                border-radius: 0.5rem;
                background: transparent;
                color: #64748b;
                font-family: 'Inter', sans-serif;
                font-weight: 600;
                cursor: pointer;
            ">Cancel</button>
            <button id="confirmBtn" style="
                padding: 0.75rem 1.5rem;
                border: 2px solid #ef4444;
                border-radius: 0.5rem;
                background: #ef4444;
                color: white;
                font-family: 'Inter', sans-serif;
                font-weight: 600;
                cursor: pointer;
            ">Delete All</button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Handle button clicks
    dialog.querySelector('#cancelBtn').onclick = () => {
        document.body.removeChild(overlay);
    };
    
    dialog.querySelector('#confirmBtn').onclick = () => {
        // Clear all arena-related localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('arena_')) {
                localStorage.removeItem(key);
            }
        });
        
        // Reset UI
        resetToDefaultView();
        displayRecentVictories();
        showNotification('All arena data deleted');
        
        // Close dialog
        document.body.removeChild(overlay);
    };
    
    // Close on overlay click
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    };
}



fileUploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.classList.add('drag-over');
});

fileUploadArea.addEventListener('dragleave', () => {
    fileUploadArea.classList.remove('drag-over');
});

fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileUpload(e.target.files[0]);
    }
});

backupInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        importFromJSON(e.target.files[0]);
        e.target.value = ''; // Clear input for next use
    }
});

function handleFileUpload(file) {
    if (!file.type.includes('text') && !file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
        showNotification('Please upload a text (.txt) or CSV (.csv) file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target.result;
            parseMatchFile(content, file.name);
        } catch (error) {
            showNotification('Error reading file: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function parseMatchFile(content, filename) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const results = {
        imported: 0,
        skipped: 0,
        errors: []
    };

    // Check if it's a CSV file and if first line looks like headers
    const isCSV = filename.toLowerCase().endsWith('.csv');
    let startIndex = 0;
    
    if (isCSV && lines.length > 0) {
        const firstLine = lines[0].toLowerCase();
        // Check if first line contains common CSV headers
        if (firstLine.includes('champion') || firstLine.includes('name') || 
            firstLine.includes('wins') || firstLine.includes('losses') ||
            firstLine.includes('result') || firstLine.includes('match')) {
            startIndex = 1; // Skip header row
            results.errors.push('Skipped header row (line 1)');
        }
    }

    lines.forEach((line, index) => {
        // Skip header row if detected
        if (index < startIndex) return;
        
        try {
            const championName = line.trim();
            const championData = findChampionByName(championName);
            
            if (championData) {
                saveMatch(championData.id, 'win');
                addRecentVictory(championData.id, championData.name);
                results.imported++;
            } else {
                results.errors.push(`Line ${index + 1}: Champion "${championName}" not found`);
                results.skipped++;
            }
        } catch (error) {
            results.errors.push(`Line ${index + 1}: ${error.message}`);
            results.skipped++;
        }
    });

    displayImportResults(results, filename);
    
    if (currentChampion) {
        displayChampionInfo();
        displayMatchHistory();
    }
}

function parseMatchLine(line) {
    line = line.toLowerCase().trim();
    
    const csvMatch = line.match(/^([^,]+),\s*(win|loss|victory|defeat|w|l)$/i);
    if (csvMatch) {
        return {
            champion: csvMatch[1].trim(),
            result: normalizeResult(csvMatch[2].trim())
        };
    }
    
    const dateMatch = line.match(/^\d{4}-\d{2}-\d{2}\s+(.+?)\s+(win|loss|victory|defeat|w|l)$/i);
    if (dateMatch) {
        return {
            champion: dateMatch[1].trim(),
            result: normalizeResult(dateMatch[2].trim())
        };
    }
    
    const simpleMatch = line.match(/^(.+?)\s+(win|loss|victory|defeat|w|l)$/i);
    if (simpleMatch) {
        return {
            champion: simpleMatch[1].trim(),
            result: normalizeResult(simpleMatch[2].trim())
        };
    }
    
    return null;
}

function normalizeResult(result) {
    const normalized = result.toLowerCase();
    if (normalized === 'win' || normalized === 'victory' || normalized === 'w') {
        return 'win';
    } else if (normalized === 'loss' || normalized === 'defeat' || normalized === 'l') {
        return 'loss';
    }
    return null;
}

function findChampionByName(name) {
    const normalizedName = name.toLowerCase().trim();
    
    const exactMatch = champions.find(champion => 
        champion.name.toLowerCase() === normalizedName
    );
    if (exactMatch) return exactMatch;
    
    const partialMatch = champions.find(champion => 
        champion.name.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(champion.name.toLowerCase())
    );
    if (partialMatch) return partialMatch;
    
    const aliasMatches = {
        'asol': 'aurelionsol',
        'aurelion': 'aurelionsol',
        'mundo': 'drmundo',
        'dr mundo': 'drmundo',
        'gp': 'gangplank',
        'j4': 'jarvaniv',
        'jarvan': 'jarvaniv',
        'lb': 'leblanc',
        'lee': 'leesin',
        'mf': 'missfortune',
        'nunu': 'nunu',
        'reksai': 'reksai',
        'rek sai': 'reksai',
        'tf': 'twistedfate',
        'velkoz': 'velkoz',
        'vel koz': 'velkoz',
        'wukong': 'wukong',
        'monkey king': 'wukong',
        'naaf': 'naafiri',
        'naafy': 'naafiri',
        'briar': 'briar',
        'bri': 'briar'
    };
    
    const aliasMatch = aliasMatches[normalizedName];
    if (aliasMatch) {
        return champions.find(champion => champion.id === aliasMatch);
    }
    
    return null;
}

function displayImportResults(results, filename) {
    const total = results.imported + results.skipped;
    
    let html = `
        <div class="import-summary">
            <h4>Import Results for "${filename}"</h4>
            <div class="import-stats">
                <span class="stat-success">${results.imported} matches imported</span>
                <span class="stat-warning">${results.skipped} lines skipped</span>
                <span class="stat-total">Total lines: ${total}</span>
            </div>
        </div>
    `;
    
    if (results.errors.length > 0) {
        html += `
            <div class="import-errors">
                <h5>Errors/Warnings:</h5>
                <ul>
                    ${results.errors.slice(0, 10).map(error => `<li>${error}</li>`).join('')}
                    ${results.errors.length > 10 ? `<li>... and ${results.errors.length - 10} more</li>` : ''}
                </ul>
            </div>
        `;
    }
    
    importResults.innerHTML = html;
    importResults.style.display = 'block';
    
    if (results.imported > 0) {
        showNotification(`Successfully imported ${results.imported} matches!`);
    } else {
        showNotification('No matches were imported. Check the file format.');
    }
}