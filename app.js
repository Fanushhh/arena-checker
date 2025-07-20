let currentChampion = null;

const searchInput = document.getElementById('championSearch');
const searchResults = document.getElementById('searchResults');
const championInfo = document.getElementById('championInfo');
const matchHistory = document.getElementById('matchHistory');
const fileInput = document.getElementById('fileInput');
const fileUploadArea = document.getElementById('fileUploadArea');
const importResults = document.getElementById('importResults');

searchInput.addEventListener('input', handleSearch);
searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim()) {
        searchResults.style.display = 'block';
    }
});

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
        return;
    }

    const filteredChampions = champions.filter(champion => 
        champion.name.toLowerCase().includes(query)
    ).slice(0, 8);

    displaySearchResults(filteredChampions);
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
        
        return `
            <div class="search-result-item" onclick="selectChampion('${champion.id}', '${champion.name}')">
                <img src="${getChampionImageUrl(champion.id)}" alt="${champion.name}" class="champion-icon">
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
    
    displayChampionInfo();
    displayMatchHistory();
}

function displayChampionInfo() {
    if (!currentChampion) return;

    const stats = getChampionStats(currentChampion.id);
    
    document.getElementById('championImage').src = getChampionImageUrl(currentChampion.id);
    document.getElementById('championImage').alt = currentChampion.name;
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

    lines.forEach((line, index) => {
        try {
            const championName = line.trim();
            const championData = findChampionByName(championName);
            
            if (championData) {
                saveMatch(championData.id, 'win');
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
        'monkey king': 'wukong'
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