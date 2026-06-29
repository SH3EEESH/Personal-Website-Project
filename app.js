// Making lots of notes because i feel alittle iffy about javascript
// Grabbing different elements using const so these elements never change
const searchForm = document.getElementById('search-form'); // Grabs the 'search-form' from html file onto the form itself so it will refrain from refreshing the page
const searchInput = document.getElementById('search-input'); // Grabs from the 'search-input' from html file so I can read what the user input
const tierFilter = document.getElementById('tier-filter'); // Grab the 'tier-filter' from html file to manage dropdown menu so I know what category the user chose
const resultsGrid = document.getElementById('results-grid'); // Grab from the 'results-grid' from html to access empty grid so I can access the HTML cards inside it
const statusMessage = document.getElementById('status-message'); // Grabs from the 'status-message' to empty div so I can show if a response is loading or spits out an error text

// New elements relating to the tabs
const tabLearn = document.getElementById('tab-learn');
const tabPractice = document.getElementById('tab-practice');
const viewLearn = document.getElementById('view-learn');
const viewPractice = document.getElementById('view-practice');
const glossaryGrid = document.getElementById('glossary-grid');

// Elements regarding the new tab, so it can filter the new JSON file
const learnSearchForm = document.getElementById('learn-search-form');
const learnSearchInput = document.getElementById('learn-search-input');
const learnTierFilter = document.getElementById('learn-tier-filter');

// Use 'let' to start from an empty, and the information it has will be able to change
let scenariosData = [];
let foundationData = [];


// 1. Listen for the Learn Search Form submission
learnSearchForm.addEventListener('submit', function(e) { 
    e.preventDefault(); 

    const searchTerm = learnSearchInput.value.toLowerCase().trim();

    // Filter the foundationData using the specific JSON keys (term, definition, category)
    let filteredData = foundationData.filter(function(item) {
        let term = item.term.toLowerCase();
        let desc = item.definition.toLowerCase();
        let category = item.category.toLowerCase();

        return term.includes(searchTerm) || desc.includes(searchTerm) || category.includes(searchTerm);
    });

    learnTierFilter.value = 'All'; // Reset dropdown
    renderGlossary(filteredData); // Redraw the glossary screen
});

// 2. Listen for the Learn Dropdown Menu changing
learnTierFilter.addEventListener('change', function(e) {
    const selectedTier = e.target.value;
    
    let filteredData = foundationData.filter(function(item) {
        if (selectedTier === 'All') {
            return true; 
        } else {
            return item.category === selectedTier; 
        }
    });

    learnSearchInput.value = ''; // Clear search bar
    renderGlossary(filteredData); // Redraw the glossary screen
});


// Async section so javascript doesn't simply freeze the website lol
// Use async to start the function
async function setupScenariosDefaults() { // I created the name to remind me that this function focuses on when to prompt a loading or error message
    // Used the try command to allow the file to run the code, then moves down to the next step
    try {
        statusMessage.textContent = 'Loading training scenarios and glossary...'; // Basically used to prompt the user what is happening while everything loads
        
        // Pause until BOTH files are downloaded
        const [scenariosResponse, foundationResponse] = await Promise.all([
            fetch('commands.json'),
            fetch('CyberSecurityFoundation.json')
        ]);

        if (!scenariosResponse.ok || !foundationResponse.ok) { // A built in check to see if theres any problems or errors
            throw new Error('Network error, one or more files not found'); // Throw is like a force, if theres a major error, the error message is sent into the 'catch' block
        }

        scenariosData = await scenariosResponse.json();
        foundationData = await foundationResponse.json();
        statusMessage.textContent = '';

        // Move downloaded data into the next functions to draw the screens
        renderDashboard(scenariosData); // FIXED: Changed from renderUI to match the function name below
        renderGlossary(foundationData); // New function call to draw the glossary tab
    }
    catch (error) {
        statusMessage.style.color = '#f85149'; // FIXED: Corrected the variable name, added quotes and semicolon
        // use innerHTML to access the bold mechanic from HTML
        statusMessage.innerHTML = 'Error loading scenarios, make sure to run program on a <strong>Live</strong> Server'; // Added a bold to Live so it sticks out to user
        console.error(error);
    }
}

// Tab Switching Logic
    tabLearn.addEventListener('click', function() {
        viewLearn.style.display = 'block';
        viewPractice.style.display = 'none';
        tabLearn.style.backgroundColor = '#3ebd28d0';
        tabLearn.style.color = '#0d0d14';
        tabPractice.style.backgroundColor = '#161b22';
        tabPractice.style.color = '#3ebd28d0';
    });

    tabPractice.addEventListener('click', function() {
        viewPractice.style.display = 'block';
        viewLearn.style.display = 'none';
        tabPractice.style.backgroundColor = '#3ebd28d0';
        tabPractice.style.color = '#0d0d14';
        tabLearn.style.backgroundColor = '#161b22';
        tabLearn.style.color = '#3ebd28d0';
    });

// Function to draw the glossary cards in the Learn Tab
function renderGlossary(dataArray) {
    let outputHTML = '';

    dataArray.forEach(function(item) {
        // Build the HTML card for each definition
        outputHTML += `
            <div class='scenario-box'>
                <h3 style="margin-bottom: 5px;"> ${item.term} 
                    <span style="font-size: 14px; color: #8b949e; margin-left: 10px;">[${item.category}]</span>
                </h3>
                <p style="color: #aeaeae;"> ${item.definition} </p>
                
                <div style='margin-top: 15px; padding-top: 10px; border-top: 1px solid #313d30;'>
                    <p style='color: #3fb950; font-family: monospace; margin: 0;'>> ${item.related_command}</p>
                </div>
            </div>
        `;
    });

    // Inject into the new glossary grid
    glossaryGrid.innerHTML = outputHTML;
}

// Drawing the actual scenario boxes in Java(script)
function renderDashboard(dataArray) { // Takes the data downloaded earlier and create the scenarios
    // Checks if the search field find nothing the user was looking for
    if (dataArray.length === 0) {
        // Print a new error message, or just a lost message
        resultsGrid.innerHTML = '<p style="text-align:center; grid-column:1/-1;"> Couldnt find scenarios </p>';
        return;
    }

    // Creates placeholders to strings, which is where the html text will be presented
    let outputHTML = '';

    // Now look through and loop every item in the data / information we downloaded
    // FIXED: Cleaned up the accidental duplicate loop here
    dataArray.forEach(function(scenario) {
        // This will lead into building a block for EACH scenario, so I don't have to create a seperate one for each
        // (`) allows me to write HTML on multiple lines
        outputHTML += `
            <div class='scenario-box'>
                <h3> ${scenario.title} (${scenario.tier}) </h3>
                <p> ${scenario.description} </p>
                
                <div style='display: flex; gap: 10px; margin-top: 15px; margin-bottom: 15px;'>
                    <button id='hint-btn-${scenario.id}'> Reveal Hint </button>
                    <button id='sol-btn-${scenario.id}'> Reveal Solution </button>
                </div>

                <div id='hint-details-${scenario.id}' style='display: none; margin-bottom: 10px;'>
                    <p style='color: #8b949e;'><em>Hint: ${scenario.hint}</em></p>
                </div>

                <div id='sol-details-${scenario.id}' style='display: none;'>
                    <p style='color: #3fb950; font-family: monospace;'>Command: ${scenario.expected_command}</p>
                </div>
            </div>
        `;
    });

    // 1. Actually inject the string of HTML we just built into the webpage
    resultsGrid.innerHTML = outputHTML;

    // 2. Loop through again to make the "Reveal Solution" buttons actually click
    dataArray.forEach(function(scenario) {
        
        // 1. Build the bridges to the 4 elements we just created in the HTML
        const hintBtn = document.getElementById(`hint-btn-${scenario.id}`);
        const hintDetails = document.getElementById(`hint-details-${scenario.id}`);
        
        const solBtn = document.getElementById(`sol-btn-${scenario.id}`);
        const solDetails = document.getElementById(`sol-details-${scenario.id}`);

        // The hint button to actually show the hint and not the stupid solution omg
        hintBtn.addEventListener('click', function() {
            
            // If it is currently showing, hide it.
            if (hintDetails.style.display === 'block') {
                hintDetails.style.display = 'none';
                hintBtn.textContent = 'Reveal Hint';
                
            // Otherwise, show it.
            } else {
                hintDetails.style.display = 'block';
                hintBtn.textContent = 'Hide Hint';
            }
        });

        // For the solution button so the user will HAVE to press instead of being given it straight away
        solBtn.addEventListener('click', function() {
            
            // If it is currently showing, hide it.
            if (solDetails.style.display === 'block') {
                solDetails.style.display = 'none';
                solBtn.textContent = 'Reveal Solution';
                
            // Otherwise, show it.
            } else {
                solDetails.style.display = 'block';
                solBtn.textContent = 'Hide Solution';
            }
        });
        
    });
}

// 1. Listen for the Search Form submission
searchForm.addEventListener('submit', function(e) { // e is the event function used in the video, DONT GET LOST IN FUTURE
    e.preventDefault(); // Stop page from reloading

    const searchTerm = searchInput.value.toLowerCase().trim();

    // .filter() automatically loops through and only keeps the items that return 'true'
    let filteredData = scenariosData.filter(function(scenario) {
        let title = scenario.title.toLowerCase();
        let desc = scenario.description.toLowerCase();
        let tier = scenario.tier.toLowerCase();

        // If this statement is true, .filter() automatically pushes it into filteredData!
        return title.includes(searchTerm) || desc.includes(searchTerm) || tier.includes(searchTerm);
    });

    tierFilter.value = 'All'; // Reset dropdown to default
    renderDashboard(filteredData); // Redraw the screen with only the matching items
});

// 2. Listen for the Dropdown Menu changing
tierFilter.addEventListener('change', function(e) {
    const selectedTier = e.target.value;
    
    // Use .filter() to grab only the category we want
    let filteredData = scenariosData.filter(function(scenario) {
        if (selectedTier === 'All') {
            return true; // Keep everything
        } else {
            return scenario.tier === selectedTier; // Keep only if the tier matches the dropdown
        }
    });

    searchInput.value = ''; // Clear search bar
    renderDashboard(filteredData); // Redraw the screen
});

// FINALLY: Run the setup function to start the whole app when the page loads!
setupScenariosDefaults();